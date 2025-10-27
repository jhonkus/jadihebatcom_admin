// routes/categories/[slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/server/db';

export const prerender = false;

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;
	if (
		!slug ||
		slug === 'favicon.ico' ||
		slug.includes('.') ||
		slug === 'undefined' ||
		slug.length < 2
	) {
		throw error(404, 'Kategori tidak ditemukan');
	}

	try {
		// Get category by slug
		const { data: category, error: categoryError } = await supabase
			.from('categories')
			.select('*')
			.eq('slug', slug)
			.single();

		if (categoryError || !category) {
			throw error(404, `Kategori "${slug}" tidak ditemukan`);
		}

		// Get courses for this category
		const { data: courses, error: coursesError } = await supabase
			.from('courses')
			.select(
				`
				id,
				title,
				slug,
				short_description,
				is_free,
				price,
				thumbnail,
				thumbnail_url,
				rating_average,
				enrollment_count,
				created_at,
				estimated_duration,
				difficulty_level,
				category_id:categories(name),
				instructor_id:instructors(first_name)
			`
			)
			.eq('status', 'published')
			.eq('category_id', category.id)
			.order('created_at', { ascending: false })
			.limit(8);

		if (coursesError) {
			console.error('Error fetching courses:', coursesError);
			throw error(500, 'Gagal memuat data kursus');
		}

		const coursesList = courses || [];
		const coursesWithRating = coursesList.filter((c) => c.rating_average > 0);
		const avgRating =
			coursesWithRating.length > 0
				? (
						coursesWithRating.reduce((sum, c) => sum + (c.rating_average || 0), 0) /
						coursesWithRating.length
					).toFixed(1)
				: '0';

		const freeCourses = coursesList.filter((c) => c.is_free).length;
		const totalStudents = coursesList.reduce((sum, c) => sum + (c.enrollment_count || 0), 0);

		return {
			category,
			featuredCourses: coursesList,
			stats: {
				totalCourses: coursesList.length,
				avgRating,
				freeCourses,
				totalStudents
			}
		};
	} catch (_err: any) {
		if (_err?.status === 404) {
			throw _err;
		}

		console.error('Error loading category:', _err);
		throw error(500, 'Gagal memuat data kategori');
	}
};
