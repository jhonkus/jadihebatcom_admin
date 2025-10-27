// src/lib/server/turso-blog.ts - TursoDB direct access for blog
// Import env lazily inside functions to avoid vitest trying to resolve Vite/SvelteKit virtual modules.
import type { BlogArticle, BlogCategory, BlogTag } from '$lib/types/blog';
import { sanitizeHtmlContent } from './sanitizer';
import { createClient } from '@libsql/client';
import { marked } from 'marked';

// Database client
let dbClient: any = null;

async function getDbClient() {
	if (!dbClient) {
		// lazy load environment variables
		const { TRS_DATABASE_URL, TRS_AUTH_TOKEN } = await import('$env/static/private');
		dbClient = createClient({
			url: TRS_DATABASE_URL,
			authToken: TRS_AUTH_TOKEN
		});
	}
	return dbClient;
}

// Transform DB row to BlogArticle
interface BlogPostRow {
	id: number;
	title: string;
	slug: string;
	excerpt?: string;
	content: string;
	cover_image?: string;
	author_id?: number;
	blog_category_id?: number;
	published_at?: string;
	created_at: string;
	updated_at: string;
	tags_json?: string;
	category_name?: string;
	category_slug?: string;
	author_name?: string;
}

function transformPost(row: BlogPostRow): BlogArticle {
	let tags: BlogTag[] = [];
	if (row.tags_json) {
		tags = row.tags_json
			.split(',')
			.map((tagStr: string) => {
				const [id, name, slug] = tagStr.split('|');
				return {
					id: parseInt(id),
					name,
					slug,
					created_at: '' // We don't have this from the query
				};
			})
			.filter((tag: any) => tag.id);
	}
	return {
		id: row.id,
		title: row.title,
		slug: row.slug,
		excerpt: row.excerpt || '',
		content: row.content,
		cover_image: row.cover_image || null,
		author_id: row.author_id || 0,
		author_name: row.author_name || '',
		blog_category_id: row.blog_category_id || null,
		category_name: row.category_name || null,
		category_slug: row.category_slug || null,
		featured: false, // Default value
		view_count: 0, // Default value
		read_time: 0, // Default value
		published_at: row.published_at || row.created_at,
		created_at: row.created_at,
		updated_at: row.updated_at,
		tags,
		// Legacy compatibility
		image_url: row.cover_image || undefined,
		date_created: row.published_at || row.created_at,
		date_updated: row.updated_at,
		status: 'published' as const
	};
}

// FETCH FUNCTIONS
export async function fetchArticles(limit = 10, page = 1): Promise<BlogArticle[]> {
	try {
		const db = await getDbClient();
		const offset = (page - 1) * limit;
		const result = await db.execute({
			sql: `SELECT bp.*, bc.name as category_name, bc.slug as category_slug, u.name as author_name,
            GROUP_CONCAT(bt.id || '|' || bt.name || '|' || bt.slug) as tags_json
            FROM blog_posts bp
            LEFT JOIN blog_categories bc ON bp.blog_category_id = bc.id
            LEFT JOIN users u ON bp.author_id = u.id
            LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
            LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
            GROUP BY bp.id
            ORDER BY bp.published_at DESC LIMIT ? OFFSET ?`,
			args: [limit, offset]
		});
		return result.rows.map((row: BlogPostRow) => transformPost(row));
	} catch (error) {
		console.error('Error fetching articles:', error);
		return [];
	}
}

export async function fetchArticlesWithPagination(
	limit = 10,
	page = 1
): Promise<{
	articles: BlogArticle[];
	totalCount: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}> {
	try {
		const db = await getDbClient();
		const offset = (page - 1) * limit;

		// Get total count
		const countResult = await db.execute({
			sql: `SELECT COUNT(*) as total FROM blog_posts`,
			args: []
		});
		const totalCount = Number(countResult.rows[0]?.total || 0);
		const totalPages = Math.ceil(totalCount / limit);

		// Get articles
		const result = await db.execute({
			sql: `SELECT bp.*, bc.name as category_name, bc.slug as category_slug, u.name as author_name,
            GROUP_CONCAT(bt.id || '|' || bt.name || '|' || bt.slug) as tags_json
            FROM blog_posts bp
            LEFT JOIN blog_categories bc ON bp.blog_category_id = bc.id
            LEFT JOIN users u ON bp.author_id = u.id
            LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
            LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
            GROUP BY bp.id
            ORDER BY bp.published_at DESC LIMIT ? OFFSET ?`,
			args: [limit, offset]
		});

		const articles = result.rows.map((row: BlogPostRow) => transformPost(row));

		return {
			articles,
			totalCount,
			totalPages,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1
		};
	} catch (error) {
		console.error('Error fetching articles with pagination:', error);
		return {
			articles: [],
			totalCount: 0,
			totalPages: 0,
			hasNextPage: false,
			hasPrevPage: false
		};
	}
}

export async function fetchArticleBySlug(slug: string): Promise<BlogArticle | null> {
	try {
		const db = await getDbClient();
		const result = await db.execute({
			sql: `SELECT bp.*, bc.name as category_name, bc.slug as category_slug, u.name as author_name,
            GROUP_CONCAT(bt.id || '|' || bt.name || '|' || bt.slug) as tags_json
            FROM blog_posts bp
            LEFT JOIN blog_categories bc ON bp.blog_category_id = bc.id
            LEFT JOIN users u ON bp.author_id = u.id
            LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
            LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
            WHERE bp.slug = ?
            GROUP BY bp.id`,
			args: [slug]
		});
		if (result.rows.length === 0) return null;
		return transformPost(result.rows[0]);
	} catch (error) {
		console.error('Error fetching article:', error);
		return null;
	}
}

export async function fetchCategories(): Promise<BlogCategory[]> {
	try {
		const db = await getDbClient();
		const result = await db.execute(`SELECT * FROM blog_categories WHERE is_active = 1`);
		return result.rows as BlogCategory[];
	} catch (error) {
		console.error('Error fetching categories:', error);
		return [];
	}
}

export async function fetchArticlesByCategory(
	categorySlug: string,
	limit = 10,
	page = 1
): Promise<BlogArticle[]> {
	try {
		const db = await getDbClient();
		const offset = (page - 1) * limit;
		const result = await db.execute({
			sql: `SELECT bp.*, bc.name as category_name, bc.slug as category_slug, u.name as author_name,
            GROUP_CONCAT(bt.id || '|' || bt.name || '|' || bt.slug) as tags_json
            FROM blog_posts bp
            JOIN blog_categories bc ON bp.blog_category_id = bc.id
            LEFT JOIN users u ON bp.author_id = u.id
            LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
            LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
            WHERE bc.slug = ?
            GROUP BY bp.id
            ORDER BY bp.published_at DESC LIMIT ? OFFSET ?`,
			args: [categorySlug, limit, offset]
		});
		return result.rows.map((row: BlogPostRow) => transformPost(row));
	} catch (error) {
		console.error('Error fetching articles by category:', error);
		return [];
	}
}

// Legacy function for backward compatibility
export async function fetchArticlesByCategory2(
	categorySlug: string,
	limit = 10,
	page = 1
): Promise<BlogArticle[]> {
	return fetchArticlesByCategory(categorySlug, limit, page);
}

export async function searchArticles(query: string, limit = 10): Promise<BlogArticle[]> {
	try {
		const db = await getDbClient();
		const searchTerm = `%${query}%`;
		const result = await db.execute({
			sql: `SELECT bp.*, bc.name as category_name, bc.slug as category_slug, u.name as author_name,
            GROUP_CONCAT(bt.id || '|' || bt.name || '|' || bt.slug) as tags_json
            FROM blog_posts bp
            LEFT JOIN blog_categories bc ON bp.blog_category_id = bc.id
            LEFT JOIN users u ON bp.author_id = u.id
            LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
            LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
            WHERE bp.title LIKE ? OR bp.content LIKE ? OR bp.excerpt LIKE ?
            GROUP BY bp.id
            ORDER BY bp.published_at DESC LIMIT ?`,
			args: [searchTerm, searchTerm, searchTerm, limit]
		});
		return result.rows.map((row: BlogPostRow) => transformPost(row));
	} catch (error) {
		console.error('Error searching articles:', error);
		return [];
	}
}

export async function fetchArticlesByTag(tag: string, limit = 10): Promise<BlogArticle[]> {
	try {
		const db = await getDbClient();
		const result = await db.execute({
			sql: `SELECT bp.*, bc.name as category_name, bc.slug as category_slug, u.name as author_name,
            GROUP_CONCAT(bt.id || '|' || bt.name || '|' || bt.slug) as tags_json
            FROM blog_posts bp
            JOIN blog_post_tags bpt ON bp.id = bpt.post_id
            JOIN blog_tags bt ON bpt.tag_id = bt.id
            LEFT JOIN blog_categories bc ON bp.blog_category_id = bc.id
            LEFT JOIN users u ON bp.author_id = u.id
            WHERE bt.slug = ? OR bt.name = ?
            GROUP BY bp.id
            ORDER BY bp.published_at DESC LIMIT ?`,
			args: [tag, tag, limit]
		});
		return result.rows.map((row: BlogPostRow) => transformPost(row));
	} catch (error) {
		console.error('Error fetching articles by tag:', error);
		return [];
	}
}

export async function fetchRelatedArticles(
	article: BlogArticle,
	limit = 3
): Promise<BlogArticle[]> {
	try {
		const db = await getDbClient();
		if (!article.category_slug) return [];
		const result = await db.execute({
			sql: `SELECT bp.*, bc.name as category_name, bc.slug as category_slug, u.name as author_name,
            GROUP_CONCAT(bt.id || '|' || bt.name || '|' || bt.slug) as tags_json
            FROM blog_posts bp
            JOIN blog_categories bc ON bp.blog_category_id = bc.id
            LEFT JOIN users u ON bp.author_id = u.id
            LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
            LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
            WHERE bc.slug = ? AND bp.id != ?
            GROUP BY bp.id
            ORDER BY bp.published_at DESC LIMIT ?`,
			args: [article.category_slug, article.id, limit]
		});
		return result.rows.map((row: BlogPostRow) => transformPost(row));
	} catch (error) {
		console.error('Error fetching related articles:', error);
		return [];
	}
}

export async function fetchTags(): Promise<BlogTag[]> {
	try {
		const db = await getDbClient();
		const result = await db.execute(`SELECT * FROM blog_tags`);
		return result.rows as BlogTag[];
	} catch (error) {
		console.error('Error fetching tags:', error);
		return [];
	}
}

// HELPER FUNCTIONS
export function getImageUrl(imageId: string | null | undefined): string {
	if (!imageId) return '/placeholder-image.jpg';

	// If it's already a full URL, return it
	if (imageId.startsWith('http://') || imageId.startsWith('https://')) {
		return imageId;
	}

	// Otherwise, construct a relative URL (we avoid depending on SvelteKit's $env here so tests don't need it)
	return `/assets/${imageId}`;
}

export function getAuthorName(article: BlogArticle): string {
	return article.author_name || 'Admin';
}

export function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString('id-ID', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

export function getArticleCategories(article: BlogArticle): BlogCategory[] {
	// New API structure - single category per post
	if (article.blog_category_id && article.category_name && article.category_slug) {
		return [
			{
				id: article.blog_category_id,
				name: article.category_name,
				slug: article.category_slug,
				description: null,
				is_active: true,
				created_at: article.created_at,
				updated_at: article.updated_at
			}
		];
	}
	return [];
}

export function formatArticle(article: BlogArticle) {
	if (!article) return null;

	// Sanitize content (prefer sanitize-html if available, otherwise use a safe fallback)
	// Use a safe any-cast because REST article shape may vary across API versions
	// and TypeScript's BlogArticle may not include all possible fields.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const a: any = article;
	const rawContent = (a.content || a.body || a.html || '') as string;

	// Convert markdown to HTML if content appears to be markdown
	let htmlContent = rawContent;
	if (
		rawContent &&
		(rawContent.includes('#') ||
			rawContent.includes('*') ||
			rawContent.includes('[') ||
			rawContent.includes('```'))
	) {
		try {
			htmlContent = marked.parse(rawContent) as string;
		} catch (error) {
			console.warn('Failed to parse markdown, using raw content:', error);
		}
	}

	const safeContent = sanitizeHtmlContent(htmlContent);

	// Determine published and updated dates
	const publishedDate = article.published_at || article.date_created || article.created_at;
	const updatedDate = article.updated_at || article.date_updated;

	// Only show "Diperbarui" if updated_at exists AND is actually after published_at
	let formattedDateUpdated = null;
	if (updatedDate && publishedDate) {
		const publishedTime = new Date(publishedDate).getTime();
		const updatedTime = new Date(updatedDate).getTime();
		// Only show updated date if it's at least 1 minute after published (to account for auto-updates)
		if (updatedTime > publishedTime + 60000) {
			formattedDateUpdated = formatDate(updatedDate);
		}
	}

	return {
		...article,
		imageUrl: getImageUrl(article.cover_image || article.image_url),
		formattedDate: formatDate(publishedDate),
		formattedDateUpdated,
		tagNames: article.tags?.map((t) => t.name) || [],
		categories: getArticleCategories(article),
		excerpt: article.excerpt || '',
		authorName: getAuthorName(article),
		// safeContent is sanitized HTML safe to render with {@html}
		safeContent
	};
}
