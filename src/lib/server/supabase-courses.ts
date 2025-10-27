// src/lib/server/supabase-courses.ts - Course data access via Supabase
import { supabase } from './db';
import type { Category, Course, Section, Lesson, Enrollment, CourseInfo } from '$lib/types/course';
import type { LessonProgress } from '$lib/services/progressService';

/**
 * Get Categories (sorted)
 */
export async function getCategories(): Promise<Category[]> {
	const { data, error } = await supabase
		.from('categories')
		.select('*')
		.eq('is_active', true)
		.order('sort_order');

	if (error) {
		console.error('Error fetching categories:', error);
		return [];
	}

	return data || [];
}

/**
 * Get Courses (with filters)
 */
export async function getCourses(limit = 4): Promise<Course[]> {
	const { data, error } = await supabase
		.from('courses')
		.select(
			`
			*,
			category_id:categories(id, name, slug),
			instructor_id:instructors(id, first_name, last_name, email)
		`
		)
		.eq('status', 'published')
		.order('created_at', { ascending: false })
		.limit(limit);

	if (error) {
		console.error('Error fetching courses:', error);
		return [];
	}

	return data || [];
}

/**
 * Get Course Detail by Slug
 */
export async function getCourseDetail(slug: string): Promise<{
	course: Course | null;
	sections: Section[];
	courseInfo: CourseInfo | null;
}> {
	// Get course with nested data
	const { data: courseData, error: courseError } = await supabase
		.from('courses')
		.select(
			`
			*,
			what_will_learn,
			requirements,
			category_id:categories(id, name, slug),
			instructor_id:instructors(id, first_name, last_name, email)
		`
		)
		.eq('slug', slug)
		.single();

	if (courseError || !courseData) {
		console.error('Error fetching course:', courseError);
		return { course: null, sections: [], courseInfo: null };
	}

	// Get course sections with lessons
	const { data: sectionsData, error: sectionsError } = await supabase
		.from('course_sections')
		.select(
			`
			id,
			title,
			slug,
			description,
			order_index,
			is_active,
			course_id
		`
		)
		.eq('course_id', courseData.id)
		.order('order_index');

	if (sectionsError) {
		console.error('Error fetching sections:', sectionsError);
	}

	// Get lessons for all sections
	let sections: Section[] = [];
	if (sectionsData && sectionsData.length > 0) {
		const sectionIds = sectionsData.map((s) => s.id);
		const { data: lessonsData, error: lessonsError } = await supabase
			.from('lessons')
			.select(
				`
				id,
				title,
				slug,
				content,
				order_index,
				estimated_duration,
				is_free,
				is_active,
				section_id
			`
			)
			.in('section_id', sectionIds)
			.order('order_index');

		if (lessonsError) {
			console.error('Error fetching lessons:', lessonsError);
		}

		// Combine sections with their lessons
		sections = sectionsData.map((section) => ({
			...section,
			lessons: lessonsData?.filter((lesson) => lesson.section_id === section.id) || []
		}));
	}

	// Get course info
	const { data: infoData, error: infoError } = await supabase
		.from('course_info')
		.select('*')
		.eq('course_id', courseData.id)
		.single();

	if (infoError && infoError.code !== 'PGRST116') {
		// PGRST116 = not found, which is ok
		console.error('Error fetching course info:', infoError);
	}

	return {
		course: courseData as unknown as Course,
		sections,
		courseInfo: infoData || null
	};
}

/**
 * Check if user is enrolled in a course
 */
export async function checkEnrollment(
	userId: string,
	courseId: string
): Promise<Enrollment | null> {
	const { data, error } = await supabase
		.from('enrollments')
		.select('*')
		.eq('user_id', userId)
		.eq('course_id', courseId)
		.single();

	if (error && error.code !== 'PGRST116') {
		console.error('Error checking enrollment:', error);
		return null;
	}

	return data;
}

/**
 * Create enrollment
 */
export async function createEnrollment(
	userId: string,
	courseId: string
): Promise<Enrollment | null> {
	const { data, error } = await supabase
		.from('enrollments')
		.insert({
			user_id: userId,
			course_id: courseId,
			enrolled_at: new Date().toISOString(),
			progress: 0,
			status: 'active'
		})
		.select()
		.single();

	if (error) {
		console.error('Error creating enrollment:', error);
		return null;
	}

	// Increment enrollment count (if function exists)
	try {
		await supabase.rpc('increment_enrollment_count', { course_id: courseId });
	} catch {
		// Ignore if RPC function doesn't exist
		console.log('Note: increment_enrollment_count RPC not available');
	}

	return data;
}

/**
 * Get user enrollments
 */
export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
	const { data, error } = await supabase
		.from('enrollments')
		.select(
			`
			*,
			course_id:courses(
				id,
				title,
				slug,
				short_description,
				thumbnail,
				thumbnail_url,
				estimated_duration,
				difficulty_level,
				category_id:categories(name)
			)
		`
		)
		.eq('user_id', userId)
		.order('enrolled_at', { ascending: false });

	if (error) {
		console.error('Error fetching enrollments:', error);
		return [];
	}

	return data || [];
}

/**
 * Get lesson by ID
 */
export async function getLesson(lessonId: string): Promise<Lesson | null> {
	const { data, error } = await supabase.from('lessons').select('*').eq('id', lessonId).single();

	if (error) {
		console.error('Error fetching lesson:', error);
		return null;
	}

	return data;
}

/**
 * Get lesson progress
 */
export async function getLessonProgress(
	userId: string,
	lessonId: string
): Promise<LessonProgress | null> {
	const { data, error } = await supabase
		.from('lesson_progress')
		.select('*')
		.eq('user_id', userId)
		.eq('lesson_id', lessonId)
		.single();

	if (error && error.code !== 'PGRST116') {
		console.error('Error fetching lesson progress:', error);
		return null;
	}

	return data;
}

/**
 * Create or update lesson progress
 */
export async function upsertLessonProgress(
	userId: string,
	lessonId: string,
	completed: boolean,
	courseId: string
): Promise<LessonProgress | null> {
	const { data, error } = await supabase
		.from('lesson_progress')
		.upsert(
			{
				user_id: userId,
				lesson_id: lessonId,
				course_id: courseId,
				completed,
				completed_at: completed ? new Date().toISOString() : null,
				updated_at: new Date().toISOString()
			},
			{
				onConflict: 'user_id,lesson_id'
			}
		)
		.select()
		.single();

	if (error) {
		console.error('Error upserting lesson progress:', error);
		return null;
	}

	return data;
}

/**
 * Get course progress stats
 */
export async function getCourseProgressStats(
	userId: string,
	courseId: string
): Promise<{
	totalLessons: number;
	completedLessons: number;
	progressPercentage: number;
}> {
	// Get all lesson IDs for this course
	const { data: sectionsData, error: sectionsError } = await supabase
		.from('course_sections')
		.select('lessons(id)')
		.eq('course_id', courseId)
		.eq('is_active', true);

	if (sectionsError) {
		console.error('Error fetching course lessons:', sectionsError);
		return { totalLessons: 0, completedLessons: 0, progressPercentage: 0 };
	}

	const lessonIds = sectionsData?.flatMap((s: any) => s.lessons?.map((l: any) => l.id) || []) || [];
	const totalLessons = lessonIds.length;

	if (totalLessons === 0) {
		return { totalLessons: 0, completedLessons: 0, progressPercentage: 0 };
	}

	// Get completed lessons count
	const { count: completedLessons, error: progressError } = await supabase
		.from('lesson_progress')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', userId)
		.in('lesson_id', lessonIds)
		.eq('completed', true);

	if (progressError) {
		console.error('Error fetching progress count:', progressError);
		return { totalLessons, completedLessons: 0, progressPercentage: 0 };
	}

	const completed = completedLessons || 0;
	const progressPercentage = Math.round((completed / totalLessons) * 100);

	return { totalLessons, completedLessons: completed, progressPercentage };
}

/**
 * Update enrollment progress
 */
export async function updateEnrollmentProgress(
	userId: string,
	courseId: string,
	progressPercentage: number
): Promise<void> {
	const { error } = await supabase
		.from('enrollments')
		.update({
			progress: progressPercentage
		})
		.eq('user_id', userId)
		.eq('course_id', courseId);

	if (error) {
		console.error('Error updating enrollment progress:', error);
	}
}

/**
 * Get all lesson progress for a course
 */
export async function getCourseProgress(
	userId: string,
	courseId: string
): Promise<LessonProgress[]> {
	const { data, error } = await supabase
		.from('lesson_progress')
		.select('*')
		.eq('user_id', userId)
		.eq('course_id', courseId);

	if (error) {
		console.error('Error fetching course progress:', error);
		return [];
	}

	return data || [];
}
