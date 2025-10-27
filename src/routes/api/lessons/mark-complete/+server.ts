// src/routes/api/lessons/mark-complete/+server.ts
import { json } from '@sveltejs/kit';
import {
	upsertLessonProgress,
	getCourseProgressStats,
	updateEnrollmentProgress
} from '$lib/server/supabase-courses';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { lesson_id, course_id } = body;

		if (!lesson_id || !course_id) {
			return json({ success: false, error: 'Missing required fields' }, { status: 400 });
		}

		// Mark lesson as completed
		await upsertLessonProgress(locals.user.id, lesson_id, true, course_id);

		// Update course progress
		const { progressPercentage } = await getCourseProgressStats(locals.user.id, course_id);
		await updateEnrollmentProgress(locals.user.id, course_id, progressPercentage);

		return json({ success: true });
	} catch {
		// console.error('Mark lesson complete error:', _error);
		return json(
			{
				success: false,
				error: 'Internal server error'
			},
			{ status: 500 }
		);
	}
};
