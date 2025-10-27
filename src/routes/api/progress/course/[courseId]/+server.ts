// src/routes/api/progress/course/[courseId]/+server.ts
import { json } from '@sveltejs/kit';
import { getCourseProgress } from '$lib/server/supabase-courses';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { courseId } = params;

		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get lesson progress for user in this course
		const progress = await getCourseProgress(locals.user.id, courseId);

		return json({ progress });
	} catch {
		// console.error('Get course progress error:', _error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
