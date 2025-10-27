// routes/api/enrollments/check/+server.ts
import { json } from '@sveltejs/kit';
import { checkEnrollment } from '$lib/server/supabase-courses';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const courseId = url.searchParams.get('courseId');

		if (!courseId) {
			return json({ error: 'Missing courseId' }, { status: 400 });
		}

		// Check if user is authenticated using locals.user (set by hooks)
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check enrollment using the authenticated user's ID
		const enrollment = await checkEnrollment(locals.user.id, courseId);

		return json({ enrolled: !!enrollment });
	} catch {
		// console.error('Check enrollment API error:', _error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
