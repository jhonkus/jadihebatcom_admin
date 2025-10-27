<script>
	export let data;

	$: articles = data.articles || [];
	$: currentCategory = data.currentCategory;
	$: allCategories = data.allCategories || [];
	$: currentPage = data.currentPage || 1;

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
</script>

<svelte:head>
	<title>{currentCategory.name} - Blog Jadi Hebat</title>
	<meta name="description" content="Artikel dalam kategori {currentCategory.name}" />
</svelte:head>

<div class="category-page">
	<!-- Category Header -->
	<div class={`category-header bg-${getCategoryColor(currentCategory.name)}`}>
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
								<a href="/blog" class="text-white-50">Blog jadihebat</a>
							</li>
							<li class="breadcrumb-item active text-white" aria-current="page">
								{currentCategory.name}
							</li>
						</ol>
					</nav>

					<div class="category-icon mb-3">
						<i class="bi bi-folder-fill"></i>
					</div>
					<h1 class="display-4 fw-bold mb-3">{currentCategory.name}</h1>
					<p class="lead text-white">
						{articles.length} artikel ditemukan dalam kategori ini
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
							Belum ada artikel dalam kategori <strong>{currentCategory.name}</strong>
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
														{#if article.categories.length > 2}
															<span class="badge bg-secondary shadow-sm">
																+{article.categories.length - 2}
															</span>
														{/if}
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

					<!-- Pagination -->
					{#if articles.length >= data.limit}
						<nav aria-label="Category pagination" class="mt-5">
							<ul class="pagination justify-content-center">
								<li class={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
									<a
										class="page-link"
										href={`/blog/category/${currentCategory.slug}?page=${currentPage - 1}`}
										aria-label="Previous"
									>
										<i class="bi bi-chevron-left"></i>
									</a>
								</li>

								{#each Array(5) as i (i)}
									{@const pageNum = currentPage - 2 + i}
									{#if pageNum > 0 && pageNum <= currentPage + 2}
										<li class={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
											<a
												class="page-link"
												href={`/blog/category/${currentCategory.slug}?page=${pageNum}`}
											>
												{pageNum}
											</a>
										</li>
									{/if}
								{/each}

								<li class={`page-item ${articles.length < data.limit ? 'disabled' : ''}`}>
									<a
										class="page-link"
										href={`/blog/category/${currentCategory.slug}?page=${currentPage + 1}`}
										aria-label="Next"
									>
										<i class="bi bi-chevron-right"></i>
									</a>
								</li>
							</ul>
						</nav>
					{/if}
				{/if}
			</div>

			<!-- Sidebar -->
			<div class="col-lg-4">
				<!-- Current Category Info -->
				<div
					class={`sidebar-card mb-4 category-info-card bg-${getCategoryColor(currentCategory.name)}`}
				>
					<div class="text-white">
						<!-- <h5 class="mb-3">
              <i class="bi bi-info-circle me-2"></i>
              Tentang Kategori Ini
            </h5> -->
						<!-- <h4 class="fw-bold mb-2">{currentCategory.name}</h4> -->
						<p class="mb-0 text-white-50">
							Ada {articles.length} artikel menarik seputar {currentCategory.name.toLowerCase()}
						</p>
					</div>
				</div>

				<!-- Other Categories Widget -->
				{#if allCategories.length > 0}
					<div class="sidebar-card mb-4">
						<h5 class="sidebar-title">
							<i class="bi bi-folder me-2"></i>
							Kategori Lainnya
						</h5>
						<div class="category-list">
							{#each allCategories as category}
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

				<!-- Recent from this Category -->
				{#if articles.length > 0}
					<div class="sidebar-card">
						<h5 class="sidebar-title">
							<i class="bi bi-clock-history me-2"></i>
							Terbaru di {currentCategory.name}
						</h5>
						<div class="recent-posts">
							{#each articles.slice(0, 5) as article}
								{#if article}
									<a href={`/blog/${article.slug}`} class="recent-post-item">
										{#if article.imageUrl}
											<img src={article.imageUrl} alt={article.title} class="recent-post-thumb" />
										{:else}
											<div class="recent-post-thumb-placeholder">
												<i class="bi bi-image"></i>
											</div>
										{/if}
										<div class="recent-post-content">
											<h6 class="recent-post-title">{article.title}</h6>
											<small class="text-muted">
												<i class="bi bi-calendar3 me-1"></i>
												{article.formattedDate}
											</small>
										</div>
									</a>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	/* Category Header */
	.category-header {
		color: white;
		padding: 4rem 0 3rem;
		margin-bottom: 3rem;
		position: relative;
		overflow: hidden;
	}

	.category-header::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%);
		pointer-events: none;
	}

	.category-header .container {
		position: relative;
		z-index: 1;
	}

	.category-icon {
		font-size: 3rem;
		opacity: 0.9;
	}

	.category-header h1 {
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

	/* Category Info Card */
	.category-info-card {
		position: relative;
		overflow: hidden;
	}

	.category-info-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
		pointer-events: none;
	}

	.category-info-card > div {
		position: relative;
		z-index: 1;
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

	/* Recent Posts */
	.recent-posts {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.recent-post-item {
		display: flex;
		gap: 1rem;
		text-decoration: none;
		color: inherit;
		padding: 0.75rem;
		border-radius: 0.5rem;
		transition: background 0.2s ease;
	}

	.recent-post-item:hover {
		background: var(--bs-gray-100);
	}

	.recent-post-thumb {
		width: 70px;
		height: 70px;
		border-radius: 0.5rem;
		object-fit: cover;
		flex-shrink: 0;
	}

	.recent-post-thumb-placeholder {
		width: 70px;
		height: 70px;
		border-radius: 0.5rem;
		background: var(--bs-gray-200);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--bs-gray-400);
		flex-shrink: 0;
	}

	.recent-post-content {
		flex: 1;
		min-width: 0;
	}

	.recent-post-title {
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		line-height: 1.4;
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: white;
		border-radius: 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	/* Pagination */
	.pagination {
		gap: 0.5rem;
	}

	.pagination .page-link {
		border-radius: 0.5rem;
		border: 2px solid var(--bs-border-color);
		color: var(--bs-dark);
		font-weight: 600;
		padding: 0.5rem 1rem;
	}

	.pagination .page-item.active .page-link {
		background: var(--bs-primary);
		border-color: var(--bs-primary);
	}

	.pagination .page-link:hover {
		background: var(--bs-gray-100);
		border-color: var(--bs-primary);
	}

	/* Responsive */
	@media (max-width: 991px) {
		.category-header {
			padding: 3rem 0 2rem;
			margin-bottom: 2rem;
		}

		.category-icon {
			font-size: 2.5rem;
		}
	}
</style>
