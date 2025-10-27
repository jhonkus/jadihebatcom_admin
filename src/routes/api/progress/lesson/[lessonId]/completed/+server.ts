// src/routes/api/progress/lesson/[lessonId]/completed/+server.ts
import { json } from '@sveltejs/kit';
import { getLessonProgress } from '$lib/server/supabase-courses';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { lessonId } = params;

		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const progress = await getLessonProgress(locals.user.id, lessonId);

		return json({ completed: progress?.completed || false });
	} catch {
		// console.error('Check lesson completed error:', _error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
