import { error } from '@sveltejs/kit';
import { fetchArticlesByCategory, fetchCategories, formatArticle } from '$lib/server/turso-blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = 9;

	const [articles, allCategories] = await Promise.all([
		fetchArticlesByCategory(params.slug, limit, page),
		fetchCategories()
	]);

	// Find current category
	const currentCategory = allCategories.find((cat) => cat.slug === params.slug);

	if (!currentCategory) {
		throw error(404, 'Kategori tidak ditemukan');
	}

	// Format articles
	const formattedArticles = articles.map(formatArticle);

	return {
		articles: formattedArticles,
		currentCategory,
		allCategories: allCategories.filter((cat) => cat.slug !== params.slug),
		currentPage: page,
		limit
	};
};
