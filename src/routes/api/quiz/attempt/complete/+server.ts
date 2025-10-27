// API route to complete a quiz attempt
import { json } from '@sveltejs/kit';
import { completeQuizAttempt } from '$lib/server/neon-quiz';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { attemptId, score, timeTaken } = await request.json();

		if (!attemptId || score === undefined || timeTaken === undefined) {
			return json({ error: 'Attempt ID, score, and time taken are required' }, { status: 400 });
		}

		const success = await completeQuizAttempt(attemptId, score, timeTaken);

		if (!success) {
			return json({ error: 'Failed to complete quiz attempt' }, { status: 500 });
		}

		return json({ success: true });
	} catch (_error) {
		console.error('Error completing quiz attempt:', _error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
