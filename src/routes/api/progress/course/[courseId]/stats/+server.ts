// src/routes/api/progress/course/[courseId]/stats/+server.ts
import { json } from '@sveltejs/kit';
import { getCourseProgressStats } from '$lib/server/supabase-courses';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { courseId } = params;

		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const stats = await getCourseProgressStats(locals.user.id, courseId);

		return json(stats);
	} catch {
		// console.error('Get course stats error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
