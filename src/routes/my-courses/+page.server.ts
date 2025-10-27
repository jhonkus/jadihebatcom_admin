// src/routes/my-courses/+page.server.ts
import { redirect } from '@sveltejs/kit';
import { getUserEnrollments } from '$lib/server/supabase-courses';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Check authentication using locals.user (set by hooks)
	if (!locals.user) {
		throw redirect(303, '/login?redirect=/my-courses');
	}

	try {
		// Get user enrollments with course data
		const enrollments = await getUserEnrollments(locals.user.id);

		// Calculate stats
		const stats = {
			total: enrollments.length,
			active: enrollments.filter((e) => e.status === 'active').length,
			completed: enrollments.filter((e) => e.status === 'completed').length,
			avgProgress:
				enrollments.length > 0
					? Math.round(
							enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
						)
					: 0
		};

		return {
			enrollments,
			stats
		};
	} catch (error) {
		// console.error('Load my-courses error:', error);

		// Return error state instead of throwing
		return {
			enrollments: [],
			stats: {
				total: 0,
				active: 0,
				completed: 0,
				avgProgress: 0
			},
			error: error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat kursus'
		};
	}
};
