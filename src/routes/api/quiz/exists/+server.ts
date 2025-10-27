import { json, type RequestHandler } from '@sveltejs/kit';
import { fetchQuizByLessonId } from '$lib/server/neon-quiz';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { lessonId } = await request.json();

		if (!lessonId) {
			return json({ success: false, error: 'Lesson ID is required' }, { status: 400 });
		}

		// Check if quiz exists for this lesson
		const quiz = await fetchQuizByLessonId(lessonId);
		const quizExists = quiz !== null;

		return json({
			success: true,
			quizExists
		});
	} catch (_error) {
		console.error('Error checking quiz existence:', _error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
};
