<script lang="ts">
	export let data;

	$: articles = data.articles || [];
	$: currentTag = data.currentTag;
	$: allTags = data.allTags || [];
	$: allCategories = data.allCategories || [];
	// $: currentPage = data.currentPage || 1;

	const categoryColors = ['primary', 'success', 'info', 'warning', 'danger', 'dark'];

	function getCategoryColor(categoryName: string) {
		let hash = 0;
		for (let i = 0; i < categoryName.length; i++) {
			hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
		}
		const index = Math.abs(hash) % categoryColors.length;
		return categoryColors[index];
	}
</script>

<svelte:head>
	<title>{currentTag.name} - Blog Jadi Hebat</title>
	<meta name="description" content="Artikel dengan tag {currentTag.name}" />
</svelte:head>

<div class="tag-page">
	<!-- Tag Header -->
	<div class="tag-header">
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
							<li class="breadcrumb-item active text-white" aria-current="page">
								{currentTag.name}
							</li>
						</ol>
					</nav>

					<div class="tag-icon mb-3">
						<i class="bi bi-tag-fill"></i>
					</div>
					<h1 class="display-4 fw-bold mb-3">#{currentTag.name}</h1>
					<p class="lead text-white">
						{articles.length} artikel ditemukan dengan tag ini
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="container my-5">
		<div class="row g-4">
			<!-- Main Content -->
			<div class="col-lg-8">
				{#if articles.length === 0}
					<div class="empty-state">
						<i class="bi bi-inbox fs-1 text-muted mb-3"></i>
						<h3 class="mb-2">Belum Ada Artikel</h3>
						<p class="text-muted mb-4">
							Belum ada artikel dengan tag <strong>{currentTag.name}</strong>
						</p>
						<a href="/blog" class="btn btn-primary">
							<i class="bi bi-arrow-left me-2"></i>
							Kembali ke Blog
						</a>
					</div>
				{:else}
					<!-- Articles Grid -->
					<div class="row g-4">
						{#each articles as article}
							{#if article}
								<div class="col-md-6">
									<article class="blog-card">
										<a href={`/blog/${article.slug}`} class="blog-card-link">
											<div class="blog-card-image">
												{#if article.imageUrl}
													<img src={article.imageUrl} alt={article.title} loading="lazy" />
												{:else}
													<div class="blog-card-placeholder">
														<i class="bi bi-image fs-1 text-white-50"></i>
													</div>
												{/if}

												<!-- Categories overlay -->
												{#if article.categories && article.categories.length > 0}
													<div class="blog-card-categories">
														{#each article.categories.slice(0, 2) as category}
															<span class={`badge bg-${getCategoryColor(category.name)} shadow-sm`}>
																{category.name}
															</span>
														{/each}
													</div>
												{/if}
											</div>

											<div class="blog-card-body">
												<h5 class="blog-card-title">{article.title}</h5>
												<p class="blog-card-excerpt">{article.excerpt}</p>

												<div class="blog-card-footer">
													<div class="d-flex align-items-center gap-3">
														<small class="text-muted">
															<i class="bi bi-calendar3 me-1"></i>
															{article.formattedDate}
														</small>
														<!-- {#if article.authorName}
															<small class="text-muted">
																<i class="bi bi-person me-1"></i>
																{article.authorName}
															</small>
														{/if} -->
													</div>
													<span class="read-more">
														Baca selengkapnya
														<i class="bi bi-arrow-right ms-1"></i>
													</span>
												</div>
											</div>
										</a>
									</article>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>

			<!-- Sidebar -->
			<div class="col-lg-4">
				<!-- Current Tag Info -->
				<div class="sidebar-card mb-4 tag-info-card">
					<div>
						<h5 class="mb-3">
							<i class="bi bi-tag-fill me-2 text-primary"></i>
							Tag: {currentTag.name}
						</h5>
						<p class="mb-0 text-muted">
							{articles.length} artikel membahas topik {currentTag.name.toLowerCase()}
						</p>
					</div>
				</div>

				<!-- Other Tags Widget -->
				{#if allTags.length > 0}
					<div class="sidebar-card mb-4">
						<h5 class="sidebar-title">
							<i class="bi bi-tags me-2"></i>
							Tag Lainnya
						</h5>
						<div class="tag-cloud">
							{#each allTags.slice(0, 15) as tag}
								<a href={`/blog/tag/${tag.slug}`} class="tag-item">
									{tag.name}
								</a>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Categories Widget -->
				{#if allCategories.length > 0}
					<div class="sidebar-card">
						<h5 class="sidebar-title">
							<i class="bi bi-folder me-2"></i>
							Jelajahi Kategori
						</h5>
						<div class="category-list">
							{#each allCategories.slice(0, 6) as category}
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
			</div>
		</div>
	</div>
</div>

<style>
	/* Tag Header */
	.tag-header {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: white;
		padding: 4rem 0 3rem;
		margin-bottom: 3rem;
		position: relative;
		overflow: hidden;
	}

	.tag-header::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
		pointer-events: none;
	}

	.tag-header .container {
		position: relative;
		z-index: 1;
	}

	.tag-icon {
		font-size: 3rem;
		opacity: 0.9;
	}

	.tag-header h1 {
		color: white;
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

	/* Tag Info Card */
	.tag-info-card {
		border-left: 4px solid var(--bs-primary);
	}

	/* Blog Card */
	.blog-card {
		height: 100%;
		background: white;
		border-radius: 1rem;
		overflow: hidden;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.blog-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
	}

	.blog-card-link {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.blog-card-image {
		position: relative;
		width: 100%;
		height: 220px;
		overflow: hidden;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
	}

	.blog-card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.blog-card:hover .blog-card-image img {
		transform: scale(1.05);
	}

	.blog-card-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
	}

	.blog-card-categories {
		position: absolute;
		top: 1rem;
		left: 1rem;
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.blog-card-categories .badge {
		font-weight: 600;
		padding: 0.4rem 0.8rem;
		font-size: 0.75rem;
		backdrop-filter: blur(10px);
	}

	.blog-card-body {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.blog-card-title {
		font-size: 1.125rem;
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

	.blog-card-excerpt {
		font-size: 0.9rem;
		color: var(--bs-gray-600);
		line-height: 1.6;
		margin-bottom: 1rem;
		flex-grow: 1;
		display: -webkit-box;
		line-clamp: 3;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.blog-card-footer {
		padding-top: 1rem;
		border-top: 1px solid var(--bs-border-color);
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: auto;
	}

	.read-more {
		color: var(--bs-primary);
		font-weight: 600;
		font-size: 0.875rem;
		transition: gap 0.2s ease;
		display: inline-flex;
		align-items: center;
	}

	.blog-card:hover .read-more {
		gap: 0.5rem;
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

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: white;
		border-radius: 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	/* Responsive */
	@media (max-width: 991px) {
		.tag-header {
			padding: 3rem 0 2rem;
			margin-bottom: 2rem;
		}

		.tag-icon {
			font-size: 2.5rem;
		}
	}
</style>
