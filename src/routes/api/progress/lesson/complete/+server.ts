// src/routes/api/progress/lesson/complete/+server.ts
import { json } from '@sveltejs/kit';
import {
	upsertLessonProgress,
	getCourseProgressStats,
	updateEnrollmentProgress
} from '$lib/server/supabase-courses';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { lessonId, courseId } = await request.json();

		if (!lessonId || !courseId) {
			return json({ error: 'Lesson ID and Course ID are required' }, { status: 400 });
		}

		// Mark lesson as completed
		await upsertLessonProgress(locals.user.id, lessonId, true, courseId);

		// Update course progress
		const { progressPercentage } = await getCourseProgressStats(locals.user.id, courseId);
		await updateEnrollmentProgress(locals.user.id, courseId, progressPercentage);

		return json({ success: true });
	} catch {
		// console.error('Mark lesson complete error:', _error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
