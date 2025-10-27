import { error } from '@sveltejs/kit';
import { getCourseDetail } from '$lib/server/supabase-courses';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug;
	if (!slug) throw error(404, 'Slug tidak ditemukan');
	const detail = await getCourseDetail(slug);
	if (!detail) throw error(404, 'Kursus tidak ditemukan');
	return detail;
};
