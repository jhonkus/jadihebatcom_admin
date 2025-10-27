// src/routes/learning/[slug]/+page.server.ts
import { redirect } from '@sveltejs/kit';
import { getCourseDetail, checkEnrollment } from '$lib/server/supabase-courses';
import { fetchQuizByLessonId } from '$lib/server/neon-quiz';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const { slug } = params;
	const lessonSlug = url.searchParams.get('lesson');

	if (!locals.user) {
		throw redirect(303, `/login?redirect=/learning/${slug}`);
	}

	try {
		// 1. Get course with sections and lessons
		const courseDetail = await getCourseDetail(slug);

		if (!courseDetail.course) {
			return {
				error: 'Kursus tidak ditemukan',
				course: null,
				sections: [],
				isEnrolled: false,
				selectedLesson: null
			};
		}

		const { course, sections } = courseDetail;

		// 2. Check enrollment
		const enrollment = await checkEnrollment(locals.user.id, course.id);
		const isEnrolled = !!enrollment;

		if (!isEnrolled) {
			throw redirect(303, `/courses/${slug}`);
		}

		// 3. Select lesson based on URL parameter or auto select first lesson
		let selectedLesson = null;
		if (lessonSlug) {
			// Find the specific lesson by slug
			for (const section of sections) {
				const lesson = section.lessons?.find((l) => l.slug === lessonSlug);
				if (lesson) {
					selectedLesson = lesson;
					break;
				}
			}
		}

		// If no lesson found or no lessonSlug provided, auto select first lesson
		if (!selectedLesson) {
			if (sections.length > 0 && sections[0].lessons && sections[0].lessons.length > 0) {
				selectedLesson = sections[0].lessons[0];
			}
		}

		// Check if selected lesson has a quiz
		let hasQuiz = false;
		if (selectedLesson) {
			const quiz = await fetchQuizByLessonId(selectedLesson.id);
			hasQuiz = quiz !== null;
		}

		return {
			course,
			sections,
			isEnrolled: true,
			selectedLesson,
			hasQuiz
		};
	} catch (error: any) {
		// console.error('Learning page load error:', error);

		if (error?.status === 303) {
			throw error;
		}

		return {
			error: error?.message || 'Gagal memuat data',
			course: null,
			sections: [],
			isEnrolled: false,
			selectedLesson: null
		};
	}
};
