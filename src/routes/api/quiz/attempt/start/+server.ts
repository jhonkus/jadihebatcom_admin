// API route to start a quiz attempt
import { json } from '@sveltejs/kit';
import { createQuizAttempt } from '$lib/server/neon-quiz';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { quizId } = await request.json();

		if (!quizId) {
			return json({ error: 'Quiz ID is required' }, { status: 400 });
		}

		const attemptId = await createQuizAttempt(locals.user.id, quizId);

		if (!attemptId) {
			return json({ error: 'Failed to create quiz attempt' }, { status: 500 });
		}

		return json({ attemptId });
	} catch (_error) {
		console.error('Error starting quiz attempt:', _error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
