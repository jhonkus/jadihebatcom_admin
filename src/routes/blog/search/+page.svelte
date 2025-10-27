<script lang="ts">
	import { Search } from 'lucide-svelte';
	
	export let data;

	$: articles = data.articles || [];
	$: categories = data.categories || [];
	$: searchQuery = data.query || '';

	const categoryColors = ['primary', 'success', 'info', 'warning', 'danger', 'dark'];

	function getCategoryColor(categoryName: string) {
		let hash = 0;
		for (let i = 0; i < categoryName.length; i++) {
			hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
		}
		const index = Math.abs(hash) % categoryColors.length;
		return categoryColors[index];
	}

	function highlightText(text: string, query: string) {
		if (!query || !text) return text;
		// Escape HTML first to avoid injecting tags from the source text
		const esc = String(text)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
		const regex = new RegExp(`(${query})`, 'gi');
		return esc.replace(regex, '<mark>$1</mark>');
	}

	function formatDate(dateString: string): string {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('id-ID', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return dateString;
		}
	}
</script>

<svelte:head>
	<title>{searchQuery ? `Hasil Pencarian: ${searchQuery}` : 'Pencarian'} - Blog Jadi Hebat</title>
	<meta name="description" content="Hasil pencarian artikel di Blog Jadi Hebat" />
</svelte:head>

<div class="search-page">
	<!-- Search Header -->
	<div class="search-header">
		<div class="container">
			<div class="row">
				<div class="col-lg-8 mx-auto text-center">
					<!-- Breadcrumb -->
					<nav aria-label="breadcrumb" class="mb-3">
						<ol class="breadcrumb justify-content-center">
							<li class="breadcrumb-item">
								<a href="/" class="text-white-50">Home</a>
							</li>
							<li class="breadcrumb-item">
								<a href="/blog" class="text-white-50">Blog</a>
							</li>
							<li class="breadcrumb-item active text-white" aria-current="page">Pencarian</li>
						</ol>
					</nav>

					<div class="search-icon mb-3">
						<Search size="48" aria-hidden="true" />
					</div>

					{#if searchQuery}
						<h1 class="display-5 fw-bold mb-3">Hasil Pencarian</h1>
						<p class="lead mb-4">
							Ditemukan <strong>{articles.length}</strong> artikel untuk
							<span class="search-term">"{searchQuery}"</span>
						</p>
					{:else}
						<h1 class="display-5 fw-bold mb-3">Cari Artikel</h1>
						<p class="lead">Temukan artikel yang kamu cari</p>
					{/if}

					<!-- Search Box in Header -->
					<div class="search-box-header">
						<form action="/blog/search" method="get" class="search-form">
							<div class="input-group input-group-lg">
								<input
									type="search"
									name="q"
									class="form-control"
									placeholder="Cari artikel, tutorial, tips..."
									value={searchQuery}
									aria-label="Search"
									required
								/>
								<button class="btn btn-light" type="submit">
									<Search class="me-2" size="20" aria-hidden="true" />
									Cari
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="container my-5">
		<div class="row g-4">
			<!-- Main Content -->
			<div class="col-lg-8">
				{#if !searchQuery}
					<!-- No search query yet -->
					<div class="search-suggestions">
						<h3 class="mb-4">
							<i class="bi bi-lightbulb me-2"></i>
							Saran Pencarian
						</h3>
						<div class="row g-3">
							<div class="col-md-6">
								<div class="suggestion-card">
									<i class="bi bi-tags fs-3 text-primary mb-3"></i>
									<h5>Cari berdasarkan topik</h5>
									<p class="text-muted">Temukan artikel sesuai minatmu</p>
								</div>
							</div>
							<div class="col-md-6">
								<div class="suggestion-card">
									<i class="bi bi-bookmark fs-3 text-success mb-3"></i>
									<h5>Tips & Tutorial</h5>
									<p class="text-muted">Pelajari hal baru setiap hari</p>
								</div>
							</div>
						</div>

						{#if categories.length > 0}
							<div class="mt-4">
								<h5 class="mb-3">Jelajahi Kategori</h5>
								<div class="d-flex flex-wrap gap-2">
									{#each categories as category}
										<a
											href={`/blog/category/${category.slug}`}
											class={`badge bg-${getCategoryColor(category.name)} badge-lg`}
										>
											{category.name}
										</a>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{:else if articles.length === 0}
					<!-- No results found -->
					<div class="empty-state">
						<i class="bi bi-inbox fs-1 text-muted mb-3"></i>
						<h3 class="mb-2">Tidak Ada Hasil</h3>
						<p class="text-muted mb-4">
							Tidak ditemukan artikel untuk pencarian <strong>"{searchQuery}"</strong>
						</p>

						<div class="search-tips">
							<h5 class="mb-3">Tips Pencarian:</h5>
							<ul class="text-start">
								<li>Periksa ejaan kata kunci</li>
								<li>Gunakan kata kunci yang lebih umum</li>
								<li>Coba kata kunci yang berbeda</li>
								<li>Kurangi jumlah kata kunci</li>
							</ul>
						</div>

						<a href="/blog" class="btn btn-primary mt-3">
							<i class="bi bi-arrow-left me-2"></i>
							Kembali ke Blog
						</a>
					</div>
				{:else}
					<!-- Search Results -->
					<div class="search-results-info mb-4">
						<h4 class="mb-0">
							<i class="bi bi-check-circle text-success me-2"></i>
							{articles.length} artikel ditemukan
						</h4>
					</div>

					<div class="row g-4">
						{#each articles as article}
							<div class="col-12">
								<article class="search-result-card">
									<div class="row g-0">
										<div class="col-md-4">
											<a href={`/blog/${article.slug}`}>
												<div class="search-result-image">
													{#if article.cover_image}
														<img src={article.cover_image} alt={article.title} loading="lazy" />
													{:else}
														<div class="search-result-placeholder">
															<i class="bi bi-image fs-1 text-white-50"></i>
														</div>
													{/if}
												</div>
											</a>
										</div>
										<div class="col-md-8">
											<div class="search-result-body">
												<!-- Categories -->
												{#if article.category_name && article.category_slug}
													<div class="mb-2">
														<a
															href={`/blog/category/${article.category_slug}`}
															class={`badge bg-${getCategoryColor(article.category_name)} me-1`}
														>
															{article.category_name}
														</a>
													</div>
												{/if}

												<h5 class="search-result-title">
													<a href={`/blog/${article.slug}`}>
														{@html highlightText(article.title, searchQuery)}
													</a>
												</h5>

												<p class="search-result-excerpt">
													{@html highlightText(article.excerpt, searchQuery)}
												</p>

												<div class="search-result-meta">
													<small class="text-muted">
														<i class="bi bi-calendar3 me-1"></i>
														{formatDate(article.published_at)}
													</small>
													<!-- {#if article.authorName}
														<small class="text-muted ms-3">
															<i class="bi bi-person me-1"></i>
															{article.authorName}
														</small>
													{/if} -->
													{#if article.tags && article.tags.length > 0}
														<small class="text-muted ms-3">
															<i class="bi bi-tag me-1"></i>
															{article.tags.slice(0, 2).map(tag => tag.name).join(', ')}
														</small>
													{/if}
												</div>

												<a href={`/blog/${article.slug}`} class="read-more-link mt-3">
													Baca selengkapnya
													<i class="bi bi-arrow-right ms-1"></i>
												</a>
											</div>
										</div>
									</div>
								</article>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Sidebar -->
			<div class="col-lg-4">
				<!-- Search Tips -->
				<div class="sidebar-card mb-4">
					<h5 class="sidebar-title">
						<i class="bi bi-info-circle me-2"></i>
						Tips Pencarian
					</h5>
					<ul class="search-tips-list">
						<li>
							<i class="bi bi-check-circle text-success me-2"></i>
							Gunakan kata kunci spesifik
						</li>
						<li>
							<i class="bi bi-check-circle text-success me-2"></i>
							Coba sinonim atau kata serupa
						</li>
						<li>
							<i class="bi bi-check-circle text-success me-2"></i>
							Kombinasikan beberapa kata kunci
						</li>
					</ul>
				</div>

				<!-- Categories Widget -->
				{#if categories.length > 0}
					<div class="sidebar-card mb-4">
						<h5 class="sidebar-title">
							<i class="bi bi-folder me-2"></i>
							Jelajahi Kategori
						</h5>
						<div class="category-list">
							{#each categories as category}
								<a href={`/blog/category/${category.slug}`} class="category-item">
									<span class={`category-badge bg-${getCategoryColor(category.name)}`}></span>
									<span class="category-name">{category.name}</span>
									<i class="bi bi-chevron-right"></i>
								</a>
							{/each}
						</div>

						<a href="/blog" class="btn btn-outline-primary w-100 mt-3">
							<i class="bi bi-grid-3x3-gap me-2"></i>
							Lihat Semua Artikel
						</a>
					</div>
				{/if}

				<!-- Popular Tags (if you have them) -->
				<div class="sidebar-card">
					<h5 class="sidebar-title">
						<i class="bi bi-tags me-2"></i>
						Tag Populer
					</h5>
					<div class="tag-cloud">
						<a href="/blog/search?q=tutorial" class="tag-item">Tutorial</a>
						<a href="/blog/search?q=tips" class="tag-item">Tips</a>
						<a href="/blog/search?q=belajar" class="tag-item">Belajar</a>
						<a href="/blog/search?q=pemrograman" class="tag-item">Pemrograman</a>
						<a href="/blog/search?q=web" class="tag-item">Web</a>
						<a href="/blog/search?q=design" class="tag-item">Design</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Search Header */
	.search-header {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: white;
		padding: 4rem 0 3rem;
		margin-bottom: 3rem;
	}

	.search-header h1 {
		color: white;
	}

	.search-icon {
		font-size: 3rem;
		opacity: 0.9;
	}

	.search-icon svg {
		width: 3rem;
		height: 3rem;
	}

	.search-term {
		background: rgba(255, 255, 255, 0.2);
		padding: 0.25rem 0.75rem;
		border-radius: 0.5rem;
		font-weight: 600;
	}

	.breadcrumb {
		background: transparent;
		padding: 0;
		margin: 0;
	}

	.breadcrumb-item + .breadcrumb-item::before {
		color: rgba(255, 255, 255, 0.5);
	}

	.breadcrumb a {
		text-decoration: none;
		transition: opacity 0.2s;
	}

	.breadcrumb a:hover {
		opacity: 1;
	}

	/* Search Box in Header */
	.search-box-header {
		max-width: 600px;
		margin: 0 auto;
	}

	.search-box-header .form-control {
		border: none;
		padding: 1rem 1.5rem;
		border-radius: 0.75rem 0 0 0.75rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.search-box-header .form-control:focus {
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
	}

	.search-box-header .btn {
		border-radius: 0 0.75rem 0.75rem 0;
		padding: 1rem 2rem;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.search-box-header .btn svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	/* Search Suggestions */
	.search-suggestions {
		background: white;
		padding: 2rem;
		border-radius: 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.suggestion-card {
		background: var(--bs-gray-100);
		padding: 1.5rem;
		border-radius: 0.75rem;
		text-align: center;
		transition: all 0.2s ease;
	}

	.suggestion-card:hover {
		background: var(--bs-gray-200);
		transform: translateY(-4px);
	}

	.badge-lg {
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		font-weight: 600;
		text-decoration: none;
		transition: transform 0.2s ease;
	}

	.badge-lg:hover {
		transform: translateY(-2px);
	}

	/* Search Results */
	.search-results-info {
		background: white;
		padding: 1.25rem 1.5rem;
		border-radius: 0.75rem;
		border-left: 4px solid var(--bs-success);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.search-result-card {
		background: white;
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
	}

	.search-result-card:hover {
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
		transform: translateY(-4px);
	}

	.search-result-image {
		width: 100%;
		height: 200px;
		overflow: hidden;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
	}

	.search-result-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.search-result-card:hover .search-result-image img {
		transform: scale(1.05);
	}

	.search-result-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.search-result-body {
		padding: 1.5rem;
	}

	.search-result-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		line-height: 1.4;
	}

	.search-result-title a {
		color: var(--bs-dark);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.search-result-title a:hover {
		color: var(--bs-primary);
	}

	.search-result-excerpt {
		color: var(--bs-gray-600);
		line-height: 1.6;
		margin-bottom: 1rem;
		display: -webkit-box;
		line-clamp: 3;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.search-result-meta {
		padding-top: 1rem;
		border-top: 1px solid var(--bs-border-color);
	}

	.read-more-link {
		display: inline-flex;
		align-items: center;
		color: var(--bs-primary);
		font-weight: 600;
		text-decoration: none;
		transition: gap 0.2s ease;
	}

	.read-more-link:hover {
		gap: 0.5rem;
	}

	/* Highlight matched text */
	:global(mark) {
		background-color: #fff3cd;
		padding: 0.1rem 0.3rem;
		border-radius: 0.25rem;
		font-weight: 600;
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: white;
		border-radius: 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.search-tips {
		max-width: 400px;
		margin: 2rem auto;
	}

	.search-tips ul {
		text-align: left;
		color: var(--bs-gray-600);
	}

	.search-tips li {
		margin-bottom: 0.5rem;
	}

	/* Sidebar */
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

	.search-tips-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.search-tips-list li {
		padding: 0.5rem 0;
		color: var(--bs-gray-600);
		display: flex;
		align-items: start;
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

	/* Tag Cloud */
	.tag-cloud {
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
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.tag-item:hover {
		background: var(--bs-primary);
		color: white;
		transform: translateY(-2px);
	}

	/* Responsive */
	@media (max-width: 991px) {
		.search-header {
			padding: 3rem 0 2rem;
			margin-bottom: 2rem;
		}

		.search-icon {
			font-size: 2.5rem;
		}

		.search-result-image {
			height: 150px;
		}
	}

	@media (max-width: 767px) {
		.search-box-header .btn {
			padding: 1rem 1.5rem;
		}

		.search-result-card .row {
			flex-direction: column;
		}
	}
</style>
