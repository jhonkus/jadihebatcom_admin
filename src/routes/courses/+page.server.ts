// routes/courses/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/server/db';
import type { CourseFilters } from '$lib/types/course';

export const prerender = false;

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = 12;
	const offset = (page - 1) * limit;
	const categoryFilter = url.searchParams.get('category') || '';
	const searchQuery = url.searchParams.get('search') || '';
	const sortBy = url.searchParams.get('sort') || 'newest';
	const levelFilter = url.searchParams.get('level') || '';
	const priceFilter = url.searchParams.get('price') || '';

	try {
		// First, get category IDs from published courses
		const { data: publishedCourses } = await supabase
			.from('courses')
			.select('category_id')
			.eq('status', 'published');

		const categoryIds = [...new Set(publishedCourses?.map((c) => c.category_id).filter(Boolean))];

		// Fetch categories that have published courses
		const { data: allCategories, error: categoriesError } = await supabase
			.from('categories')
			.select('id, name, slug')
			.in('id', categoryIds)
			.order('name');

		if (categoriesError) throw categoriesError;

		// Fetch distinct difficulty levels from published courses
		const { data: levelsData, error: levelsError } = await supabase
			.from('courses')
			.select('difficulty_level')
			.eq('status', 'published')
			.not('difficulty_level', 'is', null)
			.order('difficulty_level');

		if (levelsError) throw levelsError;

		const availableLevels = [...new Set(levelsData?.map((row) => row.difficulty_level))];

		// Get category ID if filtering by category name
		let selectedCategoryId = null;
		if (categoryFilter && categoryFilter !== 'all') {
			const matchingCategory = allCategories?.find((cat) => cat.name === categoryFilter);
			selectedCategoryId = matchingCategory?.id || null;
		}

		// Build query for courses
		let coursesQuery = supabase
			.from('courses')
			.select(
				`
				id,
				title,
				slug,
				short_description,
				is_free,
				thumbnail,
				thumbnail_url,
				icon_name,
				icon_color,
				price,
				rating_average,
				enrollment_count,
				created_at,
				estimated_duration,
				difficulty_level,
				category_id (
					name
				),
				instructor_id (
					first_name
				)
			`,
				{ count: 'exact' }
			)
			.eq('status', 'published');

		// Category filter
		if (selectedCategoryId) {
			coursesQuery = coursesQuery.eq('category_id', selectedCategoryId);
		}

		// Level filter
		if (levelFilter && levelFilter !== 'all') {
			coursesQuery = coursesQuery.eq('difficulty_level', levelFilter);
		}

		// Price filter
		if (priceFilter && priceFilter !== 'all') {
			switch (priceFilter) {
				case 'free':
					coursesQuery = coursesQuery.eq('is_free', true);
					break;
				case 'low':
					coursesQuery = coursesQuery.eq('is_free', false).lt('price', 250000);
					break;
				case 'medium':
					coursesQuery = coursesQuery
						.eq('is_free', false)
						.gte('price', 250000)
						.lte('price', 350000);
					break;
				case 'high':
					coursesQuery = coursesQuery.eq('is_free', false).gt('price', 350000);
					break;
			}
		}

		// Search filter
		if (searchQuery) {
			coursesQuery = coursesQuery.or(
				`title.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%`
			);
		}

		// Sorting
		switch (sortBy) {
			case 'oldest':
				coursesQuery = coursesQuery.order('created_at', { ascending: true });
				break;
			case 'price-low':
				coursesQuery = coursesQuery.order('price', { ascending: true });
				break;
			case 'price-high':
				coursesQuery = coursesQuery.order('price', { ascending: false });
				break;
			case 'rating':
				coursesQuery = coursesQuery.order('rating_average', { ascending: false });
				break;
			case 'popular':
				coursesQuery = coursesQuery.order('enrollment_count', { ascending: false });
				break;
			case 'title-asc':
				coursesQuery = coursesQuery.order('title', { ascending: true });
				break;
			case 'title-desc':
				coursesQuery = coursesQuery.order('title', { ascending: false });
				break;
			default: // 'newest'
				coursesQuery = coursesQuery.order('created_at', { ascending: false });
				break;
		}

		// Pagination
		coursesQuery = coursesQuery.range(offset, offset + limit - 1);

		const { data: courses, error: coursesError, count: total } = await coursesQuery;

		if (coursesError) throw coursesError;

		const currentFilters: CourseFilters = {
			category: categoryFilter,
			search: searchQuery,
			sort: sortBy,
			level: levelFilter,
			price: priceFilter,
			page
		};

		return {
			courses: courses || [],
			allCategories: allCategories || [],
			availableLevels,
			total: total || 0,
			page,
			limit,
			totalPages: Math.ceil((total || 0) / limit),
			currentFilters
		};
	} catch (err) {
		console.error('Error loading courses:', err);
		throw error(500, 'Gagal memuat data kursus');
	}
};
