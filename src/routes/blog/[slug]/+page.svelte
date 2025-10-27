<script>
	import { page } from '$app/stores';

	export let data;

	$: article = data.article;
	$: relatedArticles = data.relatedArticles || [];
	$: allCategories = data.allCategories || [];

	let copied = false;

	const categoryColors = ['primary', 'success', 'info', 'warning', 'danger', 'dark'];

	/**
	 * @param {string} categoryName
	 */
	function getCategoryColor(categoryName) {
		let hash = 0;
		for (let i = 0; i < categoryName.length; i++) {
			hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
		}
		const index = Math.abs(hash) % categoryColors.length;
		return categoryColors[index];
	}

	// Calculate reading time (average 200 words per minute)
	/**
	 * @param {string} content
	 */
	function calculateReadingTime(content) {
		if (!content) return 1;
		const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
		const minutes = Math.ceil(words / 200);
		return minutes;
	}

	$: readingTime = calculateReadingTime(article?.safeContent || article?.content || '');

	// Format content: if it already contains HTML tags, use as-is.
	// Otherwise escape and convert newlines to paragraphs and <br/>.
	/**
	 * @param {string} str
	 */
	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	$: formattedContent = (() => {
		// Prefer server-provided sanitized HTML (safeContent). If not available, fall back
		// to article.content and apply client-side formatting for plain text.
		const content = article?.safeContent || article?.content || '';
		if (!content) return '';
		// Heuristic: if contains any HTML tag, assume it's HTML from WYSIWYG
		if (/<[a-z][\s\S]*>/i.test(content)) return content;

		// Plain text: convert double newlines to paragraphs and single newlines to <br>
		const escaped = escapeHtml(content);
		const paragraphs = escaped.split(/\r?\n\r?\n+/).map((p) => p.replace(/\r?\n/g, '<br/>'));
		return '<p>' + paragraphs.join('</p><p>') + '</p>';
	})();

	// Share functions
	function shareOnTwitter() {
		if (!article || !article.title) {
			return;
		}
		try {
			const url = encodeURIComponent($page.url.href);
			const text = encodeURIComponent(article.title);
			window.open(
				`https://x.com/intent/tweet?url=${url}&text=${text}`,
				'_blank',
				'noopener,noreferrer'
			);
		} catch (error) {
			console.error('Error sharing on X (Twitter):', error);
		}
	}

	function shareOnFacebook() {
		if (!article || !article.title) {
			return;
		}
		try {
			const url = encodeURIComponent($page.url.href);
			window.open(
				`https://www.facebook.com/sharer/sharer.php?u=${url}`,
				'_blank',
				'noopener,noreferrer'
			);
		} catch (error) {
			console.error('Error sharing on Facebook:', error);
		}
	}

	function shareOnWhatsApp() {
		if (!article || !article.title) {
			return;
		}
		try {
			const url = encodeURIComponent($page.url.href);
			const text = encodeURIComponent(article.title);
			window.open(`https://wa.me/?text=${text}%20${url}`, '_blank', 'noopener,noreferrer');
		} catch (error) {
			console.error('Error sharing on WhatsApp:', error);
		}
	}

	async function copyLinkWithFeedback() {
		try {
			await navigator.clipboard.writeText($page.url.href);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Fallback for older browsers or when clipboard API is not available
			try {
				const textArea = document.createElement('textarea');
				textArea.value = $page.url.href;
				document.body.appendChild(textArea);
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);
				copied = true;
				setTimeout(() => (copied = false), 2000);
			} catch {
				alert('Tidak dapat menyalin link. Silakan salin secara manual: ' + $page.url.href);
			}
		}
	}

	function printArticle() {
		try {
			window.print();
		} catch (error) {
			console.error('Error printing article:', error);
		}
	}
</script>

<svelte:head>
	<title>{article?.title || 'Blog'} - Blog Jadi Hebat</title>
	<meta name="description" content={article?.excerpt || ''} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" />
	<meta property="og:title" content={article?.title || ''} />
	<meta property="og:description" content={article?.excerpt || ''} />
	{#if article?.imageUrl}
		<meta property="og:image" content={article.imageUrl} />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={article?.title || ''} />
	<meta name="twitter:description" content={article?.excerpt || ''} />
	{#if article?.imageUrl}
		<meta name="twitter:image" content={article.imageUrl} />
	{/if}
</svelte:head>

<article class="article-page">
	{#if article}
		<!-- Article Header -->
		<div class="article-header">
			<div class="container">
				<div class="row">
					<div class="col-lg-10 mx-auto">
						<!-- Breadcrumb -->
						<nav aria-label="breadcrumb" class="mb-4">
							<ol class="breadcrumb">
								<li class="breadcrumb-item">
									<a href="/">Home</a>
								</li>
								<li class="breadcrumb-item">
									<a href="/blog">Blog</a>
								</li>
								{#if article.categories && article.categories.length > 0}
									<li class="breadcrumb-item">
										<a href={`/blog/category/${article.categories[0].slug}`}>
											{article.categories[0].name}
										</a>
									</li>
								{/if}
								<li class="breadcrumb-item active" aria-current="page">
									{article.title}
								</li>
							</ol>
						</nav>

						<!-- Categories -->
						{#if article.categories && article.categories.length > 0}
							<div class="article-categories mb-3">
								{#each article.categories as category}
									<a
										href={`/blog/category/${category.slug}`}
										class={`badge bg-${getCategoryColor(category.name)} badge-lg`}
									>
										{category.name}
									</a>
								{/each}
							</div>
						{/if}

						<!-- Title -->
						<h1 class="article-title">{article.title}</h1>

						<!-- Meta Info -->
						<div class="article-meta">
							<div class="d-flex flex-wrap align-items-center gap-3">
								<!-- <div class="meta-item">
									<i class="bi bi-person-circle me-2"></i>
									<span>{article.authorName}</span>
								</div> -->
								<div class="meta-item">
									<i class="bi bi-calendar3 me-2"></i>
									<span>{article.formattedDate}</span>
								</div>
								{#if article.formattedDateUpdated}
									<div class="meta-item">
										<i class="bi bi-arrow-repeat me-2"></i>
										<span>Diperbarui {article.formattedDateUpdated}</span>
									</div>
								{/if}
								<div class="meta-item">
									<i class="bi bi-clock me-2"></i>
									<span>{readingTime} menit baca</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Featured Image -->
		{#if article.imageUrl}
			<div class="featured-image">
				<div class="container">
					<div class="row">
						<div class="col-lg-10 mx-auto">
							<img src={article.imageUrl} alt={article.title} class="img-fluid" />
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Article Content -->
		<div class="article-content">
			<div class="container">
				<div class="row">
					<!-- Main Content -->
					<div class="col-lg-8">
						<div class="content-wrapper">
							<!-- Excerpt -->
							{#if article.excerpt}
								<div class="article-excerpt">
									<p class="lead">{article.excerpt}</p>
								</div>
							{/if}

							<!-- Content (WYSIWYG HTML from Directus) -->
							<div class="article-body">
								{@html formattedContent}
							</div>

							<!-- Tags -->
							{#if article.tags && article.tags.length > 0}
								<div class="article-tags">
									<h5 class="mb-3">
										<i class="bi bi-tags me-2"></i>
										Tags
									</h5>
									<div class="tag-list">
										{#each article.tags as tag}
											<a href={`/blog/tag/${tag.slug}`} class="tag-item">
												<i class="bi bi-tag-fill me-1"></i>
												{tag.name}
											</a>
										{/each}
									</div>
								</div>
							{/if}

							<!-- Share Buttons -->
							<div class="share-section">
								<h5 class="mb-3">
									<i class="bi bi-share me-2"></i>
									Bagikan Artikel
								</h5>
								<div class="share-buttons">
									<button
										class="share-btn share-twitter"
										onclick={shareOnTwitter}
										aria-label="Share on X (Twitter)"
										disabled={!article}
									>
										<i class="bi bi-twitter"></i>
										<span>X (Twitter)</span>
									</button>
									<button
										class="share-btn share-facebook"
										onclick={shareOnFacebook}
										aria-label="Share on Facebook"
										disabled={!article}
									>
										<i class="bi bi-facebook"></i>
										<span>Facebook</span>
									</button>
									<button
										class="share-btn share-whatsapp"
										onclick={shareOnWhatsApp}
										aria-label="Share on WhatsApp"
										disabled={!article}
									>
										<i class="bi bi-whatsapp"></i>
										<span>WhatsApp</span>
									</button>
									<button
										class="share-btn share-copy"
										onclick={copyLinkWithFeedback}
										aria-label="Copy link"
										disabled={!article}
									>
										<i class={`bi bi-${copied ? 'check' : 'link-45deg'}`}></i>
										<span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
									</button>
								</div>
							</div>

							<!-- Author Card -->
							<!-- <div class="author-card">
								<div class="author-avatar">
									<i class="bi bi-person-circle"></i>
								</div>
								<div class="author-info">
									<h5 class="author-name">{article.authorName}</h5>
									<p class="author-bio text-muted">Penulis artikel di Jadi Hebat</p>
								</div>
							</div> -->
						</div>
					</div>

					<!-- Sidebar -->
					<div class="col-lg-4">
						<div class="sidebar-sticky">
							<!-- Print Article Widget -->
							<div class="sidebar-card mb-4">
								<h5 class="sidebar-title">
									<i class="bi bi-printer me-2"></i>
									Opsi Artikel
								</h5>
								<div class="article-options">
									<button
										class="btn btn-outline-primary btn-sm w-100 mb-2"
										onclick={printArticle}
										disabled={!article}
									>
										<i class="bi bi-printer me-2"></i>
										Cetak Artikel
									</button>
									<button
										class="btn btn-outline-secondary btn-sm w-100"
										onclick={copyLinkWithFeedback}
										disabled={!article}
									>
										<i class={`bi bi-${copied ? 'check' : 'link-45deg'} me-2`}></i>
										{copied ? 'Tersalin!' : 'Salin Link'}
									</button>
								</div>
							</div>

							<!-- Categories Widget -->
							{#if allCategories.length > 0}
								<div class="sidebar-card mb-4">
									<h5 class="sidebar-title">
										<i class="bi bi-folder me-2"></i>
										Kategori Lainnya
									</h5>
									<div class="category-list">
										{#each allCategories.slice(0, 5) as category}
											<a href={`/blog/category/${category.slug}`} class="category-item">
												<span class={`category-badge bg-${getCategoryColor(category.name)}`}></span>
												<span class="category-name">{category.name}</span>
												<i class="bi bi-chevron-right"></i>
											</a>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Related Articles -->
		{#if relatedArticles.length > 0}
			<div class="related-articles">
				<div class="container">
					<div class="row">
						<div class="col-12">
							<h3 class="section-title mb-4">
								<i class="bi bi-collection me-2"></i>
								Artikel Terkait
							</h3>
						</div>
					</div>

					<div class="row g-4">
						{#each relatedArticles as relatedArticle}
							{#if relatedArticle}
								<div class="col-md-6 col-lg-3">
									<article class="related-card">
										<a href={`/blog/${relatedArticle.slug}`} class="related-card-link">
											<div class="related-card-image">
												{#if relatedArticle.imageUrl}
													<img
														src={relatedArticle.imageUrl}
														alt={relatedArticle.title}
														loading="lazy"
													/>
												{:else}
													<div class="related-card-placeholder">
														<i class="bi bi-image fs-3 text-white-50"></i>
													</div>
												{/if}
											</div>

											<div class="related-card-body">
												{#if relatedArticle.categories && relatedArticle.categories.length > 0}
													<span
														class={`badge bg-${getCategoryColor(relatedArticle.categories[0].name)} mb-2`}
													>
														{relatedArticle.categories[0].name}
													</span>
												{/if}

												<h5 class="related-card-title">{relatedArticle.title}</h5>
												<p class="related-card-date">
													<i class="bi bi-calendar3 me-1"></i>
													{relatedArticle.formattedDate}
												</p>
											</div>
										</a>
									</article>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		{/if}
	{:else}
		<!-- Loading state -->
		<div class="container py-5">
			<div class="row">
				<div class="col-12 text-center">
					<div class="spinner-border text-primary" role="status">
						<span class="visually-hidden">Loading...</span>
					</div>
					<p class="mt-3">Memuat artikel...</p>
				</div>
			</div>
		</div>
	{/if}
</article>

<style>
	/* Article Header */
	.article-header {
		padding: 3rem 0 2rem;
		background: var(--bs-gray-100);
	}

	.breadcrumb {
		background: transparent;
		padding: 0;
		margin: 0;
	}

	.breadcrumb a {
		text-decoration: none;
		color: var(--bs-gray-600);
		transition: color 0.2s;
	}

	.breadcrumb a:hover {
		color: var(--bs-primary);
	}

	.article-categories {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.badge-lg {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		text-decoration: none;
		transition: transform 0.2s ease;
	}

	.badge-lg:hover {
		transform: translateY(-2px);
	}

	.article-title {
		font-size: 2.5rem;
		font-weight: 800;
		line-height: 1.2;
		color: var(--bs-dark);
		margin-bottom: 1.5rem;
	}

	.article-meta {
		color: var(--bs-gray-600);
		padding-bottom: 1rem;
	}

	.meta-item {
		display: flex;
		align-items: center;
		font-size: 0.95rem;
	}

	/* Featured Image */
	.featured-image {
		padding: 2rem 0;
		background: var(--bs-gray-100);
	}

	.featured-image img {
		border-radius: 1rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		width: 100%;
		height: auto;
	}

	/* Article Content */
	.article-content {
		padding: 3rem 0;
	}

	.content-wrapper {
		background: white;
		padding: 2.5rem;
		border-radius: 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.article-excerpt {
		padding: 1.5rem;
		background: var(--bs-gray-100);
		border-left: 4px solid var(--bs-primary);
		border-radius: 0.5rem;
		margin-bottom: 2rem;
	}

	.article-excerpt .lead {
		margin: 0;
		color: var(--bs-gray-700);
	}

	/* Article Body Typography */
	.article-body {
		font-size: 1.125rem;
		line-height: 1.8;
		color: var(--bs-gray-800);
		margin-bottom: 2rem;
	}

	:global(.article-body h2) {
		font-size: 2rem;
		font-weight: 700;
		margin-top: 2.5rem;
		margin-bottom: 1rem;
		color: var(--bs-dark);
	}

	:global(.article-body h3) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 2rem;
		margin-bottom: 0.75rem;
		color: var(--bs-dark);
	}

	:global(.article-body p) {
		margin-bottom: 1.5rem;
	}

	:global(.article-body img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 2rem 0;
	}

	:global(.article-body ul, .article-body ol) {
		margin-bottom: 1.5rem;
		padding-left: 2rem;
	}

	:global(.article-body li) {
		margin-bottom: 0.5rem;
	}

	:global(.article-body blockquote) {
		border-left: 4px solid var(--bs-primary);
		padding-left: 1.5rem;
		margin: 2rem 0;
		font-style: italic;
		color: var(--bs-gray-600);
	}

	:global(.article-body code) {
		background: var(--bs-gray-100);
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
		font-size: 0.9em;
	}

	:global(.article-body pre) {
		background: var(--bs-dark);
		color: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin: 2rem 0;
	}

	:global(.article-body pre code) {
		background: transparent;
		padding: 0;
	}

	/* Tags */
	.article-tags {
		padding-top: 2rem;
		margin-top: 2rem;
		border-top: 2px solid var(--bs-border-color);
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag-item {
		background: var(--bs-gray-100);
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		text-decoration: none;
		color: var(--bs-dark);
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
	}

	.tag-item:hover {
		background: var(--bs-primary);
		color: white;
		transform: translateY(-2px);
	}

	/* Share Section */
	.share-section {
		padding-top: 2rem;
		margin-top: 2rem;
		border-top: 2px solid var(--bs-border-color);
	}

	.share-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.share-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		color: white;
	}

	.share-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none !important;
		box-shadow: none !important;
		pointer-events: none;
	}

	.share-twitter {
		background: #1da1f2;
	}

	.share-facebook {
		background: #1877f2;
	}

	.share-whatsapp {
		background: #25d366;
	}

	.share-copy {
		background: var(--bs-gray-600);
	}

	/* Author Card */
	/* .author-card {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 2rem;
		background: var(--bs-gray-100);
		border-radius: 1rem;
		margin-top: 3rem;
	}

	.author-avatar {
		font-size: 4rem;
		color: var(--bs-primary);
	}

	.author-name {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
		color: var(--bs-dark);
	}

	.author-bio {
		margin: 0;
	} */

	/* Sidebar */
	.sidebar-sticky {
		position: sticky;
		top: 2rem;
	}

	.sidebar-card {
		background: white;
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.sidebar-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--bs-dark);
		margin-bottom: 1.25rem;
		display: flex;
		align-items: center;
	}

	/* Article Options */
	.article-options {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.article-options button {
		transition: all 0.2s ease;
	}

	.article-options button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none !important;
	}

	/* Category List */
	.category-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.category-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		text-decoration: none;
		color: var(--bs-dark);
		transition: all 0.2s ease;
		background: var(--bs-gray-100);
	}

	.category-item:hover {
		background: var(--bs-gray-200);
		transform: translateX(4px);
	}

	.category-badge {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.category-name {
		flex: 1;
		font-weight: 500;
	}

	.category-item i {
		color: var(--bs-gray-400);
		transition: transform 0.2s ease;
	}

	.category-item:hover i {
		transform: translateX(2px);
	}

	/* Related Articles */
	.related-articles {
		padding: 4rem 0;
		background: var(--bs-gray-100);
	}

	.section-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--bs-dark);
	}

	.related-card {
		height: 100%;
		background: white;
		border-radius: 1rem;
		overflow: hidden;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.related-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
	}

	.related-card-link {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.related-card-image {
		width: 100%;
		height: 180px;
		overflow: hidden;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
	}

	.related-card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.related-card:hover .related-card-image img {
		transform: scale(1.05);
	}

	.related-card-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.related-card-body {
		padding: 1.25rem;
	}

	.related-card-title {
		font-size: 1rem;
		font-weight: 700;
		color: var(--bs-dark);
		margin-bottom: 0.75rem;
		line-height: 1.4;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.related-card-date {
		font-size: 0.875rem;
		color: var(--bs-gray-600);
		margin: 0;
	}

	/* Responsive */
	@media (max-width: 991px) {
		.article-title {
			font-size: 2rem;
		}

		.content-wrapper {
			padding: 1.5rem;
		}

		.sidebar-sticky {
			position: static;
			margin-top: 3rem;
		}
	}

	@media (max-width: 767px) {
		.article-title {
			font-size: 1.75rem;
		}

		.share-buttons {
			flex-direction: column;
		}

		.share-btn {
			width: 100%;
			justify-content: center;
		}

		.author-card {
			flex-direction: column;
			text-align: center;
		}
	}
</style>
