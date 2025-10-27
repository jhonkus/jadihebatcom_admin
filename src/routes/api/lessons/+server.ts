import { json, type RequestEvent } from '@sveltejs/kit';
import { createLesson, updateLesson } from '$lib/server/supabase-courses';

// POST /api/lessons - Create new lesson
// PUT /api/lessons - Update existing lesson
export const POST = async ({ request }: RequestEvent) => {
	try {
		const lessonData = await request.json();

		const lesson = await createLesson(lessonData);

		return json({ success: true, lesson });
	} catch (error) {
		return json({ success: false, error: (error as Error).message }, { status: 500 });
	}
};

export const PUT = async ({ request }: RequestEvent) => {
	try {
		const lessonData = await request.json();

		if (!lessonData.id) {
			return json({ success: false, error: 'Lesson ID is required' }, { status: 400 });
		}

		const lesson = await updateLesson(lessonData.id, lessonData);

		return json({ success: true, lesson });
	} catch (error) {
		return json({ success: false, error: (error as Error).message }, { status: 500 });
	}
};