import { json } from '@sveltejs/kit';
import { getLessonHierarchy } from '$lib/server/supabase-courses';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const categories = await getLessonHierarchy();
		return json({ categories });
	} catch (e) {
		return json({ error: e.message || 'Failed to fetch hierarchy' }, { status: 500 });
	}
};
