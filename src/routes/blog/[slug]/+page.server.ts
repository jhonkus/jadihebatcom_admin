import { error } from '@sveltejs/kit';
import {
	fetchArticleBySlug,
	fetchRelatedArticles,
	formatArticle,
	fetchCategories
} from '$lib/server/turso-blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const article = await fetchArticleBySlug(params.slug);

	if (!article) {
		throw error(404, 'Artikel tidak ditemukan');
	}

	// Get related articles and categories in parallel
	const [relatedArticles, allCategories] = await Promise.all([
		fetchRelatedArticles(article, 4),
		fetchCategories()
	]);

	// Format all articles
	const formattedArticle = formatArticle(article);
	const formattedRelated = relatedArticles.map(formatArticle);

	return {
		article: formattedArticle,
		relatedArticles: formattedRelated,
		allCategories
	};
};
