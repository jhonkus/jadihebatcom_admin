// src/routes/api/quiz/best-score/+server.ts
import { json } from '@sveltejs/kit';
import { getUserBestScoreByLessonId } from '$lib/server/neon-quiz';

export const POST = async ({ request, locals }: any) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { lessonId } = await request.json();

		if (!lessonId) {
			return json({ error: 'Lesson ID is required' }, { status: 400 });
		}

		const bestScore = await getUserBestScoreByLessonId(locals.user.id, lessonId);

		return json({
			success: true,
			bestScore
		});
	} catch (_error) {
		console.error('Error fetching best score:', _error);
		return json(
			{
				error: 'Failed to fetch best score',
				bestScore: null
			},
			{ status: 500 }
		);
	}
};
