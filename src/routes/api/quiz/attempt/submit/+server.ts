// API route to submit quiz answers
import { json } from '@sveltejs/kit';
import { recordQuizAnswer } from '$lib/server/neon-quiz';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { attemptId, answers } = await request.json();

		if (!attemptId || !answers || !Array.isArray(answers)) {
			return json({ error: 'Attempt ID and answers array are required' }, { status: 400 });
		}

		// Record each answer
		const results = [];
		for (const answer of answers) {
			const success = await recordQuizAnswer(
				attemptId,
				answer.questionId,
				answer.selectedOptionId,
				answer.answerText || null
			);
			results.push({ questionId: answer.questionId, success });
		}

		return json({ results });
	} catch (_error) {
		console.error('Error submitting quiz answers:', _error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
