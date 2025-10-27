// src/routes/blog/+page.server.ts
import {
	fetchArticlesWithPagination,
	fetchCategories,
	formatArticle
} from '$lib/server/turso-blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const limit = 8;

	const [paginationResult, categories] = await Promise.all([
		fetchArticlesWithPagination(limit, page),
		fetchCategories()
	]);

	// Format semua artikel di server-side
	const formattedArticles = paginationResult.articles.map(formatArticle);

	return {
		articles: formattedArticles,
		categories,
		currentPage: page,
		totalPages: paginationResult.totalPages,
		totalCount: paginationResult.totalCount,
		hasNextPage: paginationResult.hasNextPage,
		hasPrevPage: paginationResult.hasPrevPage,
		limit
	};
};
