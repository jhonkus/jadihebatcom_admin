import { error } from '@sveltejs/kit';
import {
	fetchArticlesByTag,
	fetchTags,
	fetchCategories,
	formatArticle
} from '$lib/server/turso-blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = 9;

	const [articles, allTags, allCategories] = await Promise.all([
		fetchArticlesByTag(params.slug, limit * 10), // Fetch more since we'll filter
		fetchTags(),
		fetchCategories()
	]);

	// Find current tag
	const currentTag = allTags.find(
		(tag) => tag.slug === params.slug || tag.name.toLowerCase() === params.slug.toLowerCase()
	);

	if (!currentTag && articles.length === 0) {
		throw error(404, 'Tag tidak ditemukan');
	}

	// Format articles
	const formattedArticles = articles.map(formatArticle);

	return {
		articles: formattedArticles,
		currentTag: currentTag || { id: 0, name: params.slug, slug: params.slug, created_at: '' },
		allTags: allTags.filter((tag) => tag.slug !== params.slug),
		allCategories,
		currentPage: page,
		limit
	};
};
