import { getCategories, getCourses } from '$lib/server/supabase-courses';
import { fetchArticles, formatArticle } from '$lib/server/turso-blog';

export const prerender = false;

export const load = async () => {
	try {
		const [categories, courses] = await Promise.all([getCategories(), getCourses()]);

		// console.log('courses:', courses);
		const [articles] = await Promise.all([fetchArticles(3, 1)]);
		const formattedArticles = articles.map(formatArticle);
		return { categories, courses, formattedArticles };
	} catch {
		// console.error('SSR load error:', error);
		return { categories: [], courses: [] };
	}
};
