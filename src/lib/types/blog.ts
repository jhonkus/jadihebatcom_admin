// ============================================
// BLOG TYPES (Blog API - New REST API)
// ============================================

/**
 * Blog Post from new API
 */
export interface BlogArticle {
	id: number;
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	cover_image: string | null;
	author_id: number;
	author_name: string;
	blog_category_id: number | null;
	category_name: string | null;
	category_slug: string | null;
	featured: boolean;
	view_count: number;
	read_time: number;
	published_at: string;
	created_at: string;
	updated_at: string;
	tags?: BlogTag[];

	// Legacy compatibility fields (for backward compatibility)
	image_url?: string;
	date_created?: string;
	date_updated?: string;
	status?: 'draft' | 'published' | 'archived';
}

/**
 * Blog Category
 */
export interface BlogCategory {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

/**
 * Blog Tag
 */
export interface BlogTag {
	id: number;
	name: string;
	slug: string;
	created_at: string;
}

/**
 * Legacy interface for backward compatibility
 */
export interface BlogCollections {
	articles: BlogArticle[];
	categories: BlogCategory[];
}
