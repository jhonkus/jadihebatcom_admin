/* eslint-disable @typescript-eslint/no-explicit-any */
// routes/api/enrollments/enroll/+server.ts
import { json } from '@sveltejs/kit';
import { checkEnrollment, createEnrollment } from '$lib/server/supabase-courses';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { course_id } = await request.json();

		if (!course_id) {
			return json({ error: 'Course ID is required' }, { status: 400 });
		}

		// Check authentication using locals.user (set by hooks)
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = locals.user.id;

		// Check if already enrolled
		const existingEnrollment = await checkEnrollment(userId, course_id);

		if (existingEnrollment) {
			return json(
				{
					error: 'Already enrolled in this course',
					enrollment: existingEnrollment
				},
				{ status: 400 }
			);
		}

		// Create new enrollment (also increments course enrollment_count)
		const enrollment = await createEnrollment(userId, course_id);

		if (!enrollment) {
			return json({ error: 'Failed to create enrollment' }, { status: 500 });
		}

		return json({
			success: true,
			enrollment
		});
	} catch (_error: any) {
		// console.error('Enrollment API error:', _error);
		return json(
			{
				error: _error.message || 'Internal server error'
			},
			{ status: 500 }
		);
	}
};
