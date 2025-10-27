import { searchArticles, fetchCategories, formatArticle } from '$lib/server/turso-blog';
import type { PageServerLoad } from './$types';
import type { BlogArticle, BlogCategory } from '$lib/types/blog';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('q') || '';
	const limit = 20; // More results for search

	let articles: BlogArticle[] = [];
	let categories: BlogCategory[] = [];

	if (query.trim()) {
		const [rawArticles, rawCategories] = await Promise.all([
			searchArticles(query, limit),
			fetchCategories()
		]);

		// Format articles and filter out nulls
		articles = rawArticles.map(formatArticle).filter((a) => a !== null) as BlogArticle[];
		categories = rawCategories;
	} else {
		categories = await fetchCategories();
	}

	return {
		articles,
		categories,
		query: query.trim()
	};
};
