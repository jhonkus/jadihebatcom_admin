// src/routes/learning/[slug]/[lessonSlug]/quiz/+page.server.ts
import { redirect } from '@sveltejs/kit';
import { getCourseDetail, checkEnrollment } from '$lib/server/supabase-courses';
import {
	fetchQuizByLessonId,
	canUserAttemptQuiz,
	getUserBestScoreByLessonId
} from '$lib/server/neon-quiz';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { slug, lessonSlug } = params;

	if (!locals.user) {
		throw redirect(303, `/login?redirect=/learning/${slug}/${lessonSlug}/quiz`);
	}

	try {
		// 1. Get course with sections and lessons
		const courseDetail = await getCourseDetail(slug);

		if (!courseDetail.course) {
			return {
				error: 'Kursus tidak ditemukan',
				course: null,
				lesson: null,
				quiz: null
			};
		}

		const { course, sections } = courseDetail;

		// 2. Check enrollment
		const enrollment = await checkEnrollment(locals.user.id, course.id);
		const isEnrolled = !!enrollment;

		if (!isEnrolled) {
			throw redirect(303, `/courses/${slug}`);
		}

		// 3. Find the specific lesson
		let selectedLesson = null;
		for (const section of sections) {
			const lesson = section.lessons?.find((l) => l.slug === lessonSlug);
			if (lesson) {
				selectedLesson = lesson;
				break;
			}
		}

		if (!selectedLesson) {
			return {
				error: 'Lesson tidak ditemukan',
				course: null,
				lesson: null,
				quiz: null
			};
		}

		// 4. Get quiz data from Turso DB
		const quiz = await fetchQuizByLessonId(selectedLesson.id);

		if (!quiz) {
			return {
				error: 'Kuis tidak ditemukan untuk lesson ini',
				course: null,
				lesson: null,
				quiz: null
			};
		}

		// 5. Check if user can attempt this quiz (max 2 attempts)
		const quizId = parseInt(quiz.id.replace('quiz-', ''));
		const canAttempt = await canUserAttemptQuiz(locals.user.id, quizId);

		if (!canAttempt) {
			// Get user's best score
			const bestScore = await getUserBestScoreByLessonId(locals.user.id, selectedLesson.id);
			return {
				error: 'Anda telah mencapai batas maksimal 2 kali percobaan untuk kuis ini',
				course,
				lesson: selectedLesson,
				quiz: null,
				canAttempt: false,
				bestScore
			};
		}

		return {
			course,
			lesson: selectedLesson,
			quiz,
			isEnrolled: true,
			canAttempt: true
		};
	} catch (error: any) {
		if (error?.status === 303) {
			throw error;
		}

		return {
			error: error?.message || 'Gagal memuat data quiz',
			course: null,
			lesson: null,
			quiz: null
		};
	}
};
