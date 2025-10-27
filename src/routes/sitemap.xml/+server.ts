// src/routes/sitemap.xml/+server.ts
import { fetchArticles, fetchCategories as fetchBlogCategories } from '$lib/server/turso-blog';
import { getCourses, getCategories as getCourseCategories } from '$lib/server/supabase-courses';

// Cache for sitemap data (server-side only)
let sitemapCache: {
	data: string;
	timestamp: number;
	stats: {
		blogArticles: number;
		courses: number;
		totalUrls: number;
		generationTime: number;
	};
} | null = null;

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

async function generateSitemapData(): Promise<{ content: string; stats: any }> {
	const startTime = Date.now();
	const baseUrl = 'https://jadihebat.com';
	const currentDate = new Date().toISOString();

	// Static pages - sesuaikan dengan routes yang ada
	const staticPages = [
		{
			url: '',
			lastmod: currentDate,
			changefreq: 'daily',
			priority: '1.0'
		},
		{
			url: 'about',
			lastmod: currentDate,
			changefreq: 'monthly',
			priority: '0.8'
		},
		{
			url: 'courses',
			lastmod: currentDate,
			changefreq: 'weekly',
			priority: '0.9'
		},
		{
			url: 'blog',
			lastmod: currentDate,
			changefreq: 'daily',
			priority: '0.8'
		},
		{
			url: 'privacy',
			lastmod: currentDate,
			changefreq: 'monthly',
			priority: '0.3'
		},
		{
			url: 'terms',
			lastmod: currentDate,
			changefreq: 'monthly',
			priority: '0.3'
		},
		{
			url: 'login',
			lastmod: currentDate,
			changefreq: 'yearly',
			priority: '0.4'
		},
		{
			url: 'register',
			lastmod: currentDate,
			changefreq: 'yearly',
			priority: '0.5'
		},
		{
			url: 'help',
			lastmod: currentDate,
			changefreq: 'yearly',
			priority: '0.5'
		},
		{
			url: 'faq',
			lastmod: currentDate,
			changefreq: 'yearly',
			priority: '0.5'
		},
		{
			url: 'my-courses',
			lastmod: currentDate,
			changefreq: 'weekly',
			priority: '0.6'
		},
		{
			url: 'profile',
			lastmod: currentDate,
			changefreq: 'monthly',
			priority: '0.4'
		}
	];

	// Initialize arrays for dynamic content
	let blogArticles: any[] = [];
	let blogCategories: any[] = [];
	let courses: any[] = [];
	let courseCategories: any[] = [];

	try {
		// Fetch dynamic content in parallel to reduce total time
		const [blogArticlesPromise, blogCategoriesPromise, coursesPromise, courseCategoriesPromise] =
			await Promise.allSettled([
				fetchArticles(500, 1), // Reduced from 1000 to 500
				fetchBlogCategories(),
				getCourses(500), // Reduced from 1000 to 500
				getCourseCategories()
			]);

		if (blogArticlesPromise.status === 'fulfilled') {
			blogArticles = blogArticlesPromise.value;
			console.log(`Fetched ${blogArticles.length} blog articles for sitemap`);
		}

		if (blogCategoriesPromise.status === 'fulfilled') {
			blogCategories = blogCategoriesPromise.value;
			console.log(`Fetched ${blogCategories.length} blog categories for sitemap`);
		}

		if (coursesPromise.status === 'fulfilled') {
			courses = coursesPromise.value;
			console.log(`Fetched ${courses.length} courses for sitemap`);
		}

		if (courseCategoriesPromise.status === 'fulfilled') {
			courseCategories = courseCategoriesPromise.value;
			console.log(`Fetched ${courseCategories.length} course categories for sitemap`);
		}
	} catch (_error) {
		console.error('Error fetching dynamic content for sitemap:', _error);
		// Continue with empty arrays if fetching fails
	}

	// Calculate totals
	const totalUrls =
		staticPages.length +
		blogCategories.length +
		courseCategories.length +
		blogArticles.length +
		courses.length;

	const stats = {
		blogArticles: blogArticles.length,
		blogCategories: blogCategories.length,
		courses: courses.length,
		courseCategories: courseCategories.length,
		staticPages: staticPages.length,
		totalUrls,
		generationTime: Date.now() - startTime
	};

	console.log('Sitemap stats:', stats);

	// Build sitemap XML
	const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
		.map(
			(page) => `
  <url>
    <loc>${baseUrl}/${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
		)
		.join('')}

  ${blogCategories
		.map(
			(category: any) => `
  <url>
    <loc>${baseUrl}/blog/category/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
		)
		.join('')}

  ${courseCategories
		.map(
			(category: any) => `
  <url>
    <loc>${baseUrl}/categories/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
		)
		.join('')}

  ${blogArticles
		.map(
			(article: any) => `
  <url>
    <loc>${baseUrl}/blog/${article.slug}</loc>
    <lastmod>${article.updated_at || article.published_at || article.created_at}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
		)
		.join('')}

  ${courses
		.map(
			(course: any) => `
  <url>
    <loc>${baseUrl}/courses/${course.slug}</loc>
    <lastmod>${course.updated_at || course.created_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
		)
		.join('')}

</urlset>`;

	return { content: sitemapContent, stats };
}

export async function GET() {
	const now = Date.now();

	// Check if we have valid cached data
	if (sitemapCache && now - sitemapCache.timestamp < CACHE_DURATION) {
		console.log('Serving sitemap from cache');
		return new Response(sitemapCache.data, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'max-age=0, s-maxage=3600',
				'X-Sitemap-Cached': 'true',
				'X-Sitemap-Urls': sitemapCache.stats.totalUrls.toString(),
				'X-Sitemap-Generation-Time': sitemapCache.stats.generationTime.toString()
			}
		});
	}

	console.log('Generating fresh sitemap data');
	const { content, stats } = await generateSitemapData();

	// Cache the result
	sitemapCache = {
		data: content,
		timestamp: now,
		stats
	};

	return new Response(content, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600',
			'X-Sitemap-Cached': 'false',
			'X-Sitemap-Urls': stats.totalUrls.toString(),
			'X-Sitemap-Generation-Time': stats.generationTime.toString()
		}
	});
}
