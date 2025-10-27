<script lang="ts">
	import { Search, Folder, Clock } from 'lucide-svelte';
	
	export let data: any;

	$: articles = (data?.articles as any[]) || [];
	$: categories = (data?.categories as any[]) || [];
	$: currentPage = (data?.currentPage as number) || 1;
	$: totalPages = (data?.totalPages as number) || 1;
	$: totalCount = (data?.totalCount as number) || 0;
	$: hasNextPage = (data?.hasNextPage as boolean) || false;
	$: hasPrevPage = (data?.hasPrevPage as boolean) || false;

	const categoryColors = ['primary', 'success', 'info', 'warning', 'danger', 'dark'];

	function getCategoryColor(categoryName: string) {
		let hash = 0;
		for (let i = 0; i < categoryName.length; i++) {
			hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
		}
		const index = Math.abs(hash) % categoryColors.length;
		return categoryColors[index];
	}

	function getPageNumbers(current: number, total: number): number[] {
		const pages: number[] = [];
		const maxVisible = 5;

		if (total <= maxVisible) {
			for (let i = 1; i <= total; i++) {
				pages.push(i);
			}
		} else {
			let start = Math.max(1, current - 2);
			let end = Math.min(total, start + maxVisible - 1);

			if (end - start + 1 < maxVisible) {
				start = Math.max(1, end - maxVisible + 1);
			}

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}
		}

		return pages;
	}
</script>

<svelte:head>
	<title>Blog - Jadi Hebat</title>
	<meta name="description" content="Artikel dan berita terbaru dari Jadi Hebat" />
</svelte:head>

<div class="blog-page">
	<!-- Hero Header -->
	<div class="blog-header">
		<div class="container">
			<div class="row">
				<div class="col-lg-8 mx-auto text-center">
					<h1 class="display-4 fw-bold mb-3">Blog jadihebat</h1>
					<p class="lead text-white">
						Temukan berita, tips dan inspirasi menarik untuk perjalanan belajarmu.
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
						<p class="text-muted">Artikel baru akan segera hadir!</p>
					</div>
				{:else}
					<!-- Articles Grid -->
					<div class="row g-4">
						{#each articles as article}
							<div class="col-md-6">
								<article class="blog-card">
									<a href={`/blog/${article?.slug ?? ''}`} class="blog-card-link">
										<div class="blog-card-image">
											{#if article?.imageUrl}
												<img src={article?.imageUrl} alt={article?.title ?? ''} loading="lazy" />
											{:else}
												<div class="blog-card-placeholder">
													<i class="bi bi-image fs-1 text-white-50"></i>
												</div>
											{/if}

											<!-- Categories overlay -->
											{#if (article?.categories ?? []).length > 0}
												<div class="blog-card-categories">
													{#each (article?.categories ?? []).slice(0, 2) as category}
														<span class={`badge bg-${getCategoryColor(category.name)} shadow-sm`}>
															{category.name}
														</span>
													{/each}
													{#if (article?.categories ?? []).length > 2}
														<span class="badge bg-secondary shadow-sm">
															+{(article?.categories ?? []).length - 2}
														</span>
													{/if}
												</div>
											{/if}
										</div>

										<div class="blog-card-body">
											<h5 class="blog-card-title">{article?.title ?? ''}</h5>
											<p class="blog-card-excerpt">{article?.excerpt ?? ''}</p>

											<div class="blog-card-footer">
												<div class="d-flex align-items-center gap-3">
													<small class="text-muted">
														<i class="bi bi-calendar3 me-1"></i>
														{article?.formattedDate ?? ''}
													</small>
													<!-- {#if article?.authorName}
														<small class="text-muted">
															<i class="bi bi-person me-1"></i>
															{article?.authorName}
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
						{/each}
					</div>

					<!-- Pagination -->
					{#if totalPages > 1}
						<div class="pagination-container">
							<div class="pagination-info">
								<span class="text-muted">
									Menampilkan {articles.length} dari {totalCount} artikel
								</span>
							</div>

							<nav aria-label="Blog pagination">
								<ul class="pagination">
									<!-- Previous Button -->
									<li class={`page-item ${!hasPrevPage ? 'disabled' : ''}`}>
										<a
											class="page-link"
											href={hasPrevPage ? `/blog?page=${currentPage - 1}` : '#'}
											aria-label="Previous"
											aria-disabled={!hasPrevPage}
										>
											<i class="bi bi-chevron-left"></i>
											<span class="d-none d-sm-inline ms-1">Sebelumnya</span>
										</a>
									</li>

									<!-- Page Numbers -->
									{#each getPageNumbers(currentPage, totalPages) as pageNum}
										<li class={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
											<a class="page-link" href={`/blog?page=${pageNum}`}>
												{pageNum}
											</a>
										</li>
									{/each}

									<!-- Next Button -->
									<li class={`page-item ${!hasNextPage ? 'disabled' : ''}`}>
										<a
											class="page-link"
											href={hasNextPage ? `/blog?page=${currentPage + 1}` : '#'}
											aria-label="Next"
											aria-disabled={!hasNextPage}
										>
											<span class="d-none d-sm-inline me-1">Selanjutnya</span>
											<i class="bi bi-chevron-right"></i>
										</a>
									</li>
								</ul>
							</nav>

							{#if totalPages > 5}
								<div class="pagination-jumper">
									<form class="d-flex gap-2 align-items-center" action="/blog" method="get">
										<label for="page-input" class="form-label mb-0 text-muted small">
											Halaman:
										</label>
										<input
											type="number"
											id="page-input"
											name="page"
											class="form-control form-control-sm"
											min="1"
											max={totalPages}
											value={currentPage}
											style="width: 70px;"
										/>
										<button type="submit" class="btn btn-outline-primary btn-sm"> Go </button>
									</form>
								</div>
							{/if}
						</div>
					{/if}
				{/if}
			</div>

			<!-- Sidebar -->
			<div class="col-lg-4">
				<!-- Search Widget -->
				<div class="sidebar-card mb-4">
					<h5 class="sidebar-title">
						<Search class="me-2" size="20" aria-hidden="true" />
						Cari Artikel
					</h5>
					<form action="/blog/search" method="get">
						<div class="search-box">
							<input
								type="search"
								name="q"
								class="form-control"
								placeholder="Ketik kata kunci..."
								aria-label="Search"
								required
							/>
							<button class="btn btn-primary" type="submit" aria-label="Cari Artikel">
								<Search size="18" aria-hidden="true" />
							</button>
						</div>
					</form>
				</div>

				<!-- Categories Widget -->
				{#if categories.length > 0}
					<div class="sidebar-card mb-4">
						<h5 class="sidebar-title">
							<Folder class="me-2" size="20" aria-hidden="true" />
							Kategori
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
					</div>
				{/if}

				<!-- Recent Posts Widget -->
				{#if articles.length > 0}
					<div class="sidebar-card">
						<h5 class="sidebar-title">
							<Clock class="me-2" size="20" aria-hidden="true" />
							Artikel Terbaru
						</h5>
						<div class="recent-posts">
							{#each articles.slice(0, 5) as article}
								{#if article}
									<a href={`/blog/${article.slug ?? ''}`} class="recent-post-item">
										{#if article.imageUrl}
											<img
												src={article.imageUrl}
												alt={article.title ?? ''}
												class="recent-post-thumb"
												loading="lazy"
											/>
										{:else}
											<div class="recent-post-thumb-placeholder">
												<i class="bi bi-image"></i>
											</div>
										{/if}
										<div class="recent-post-content">
											<h6 class="recent-post-title">{article.title ?? ''}</h6>
											<small class="text-muted">
												<i class="bi bi-calendar3 me-1"></i>
												{article.formattedDate ?? ''}
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
	/* Blog Header */
	.blog-header {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: white;
		padding: 4rem 0 3rem;
		margin-bottom: 3rem;
	}

	.blog-header h1 {
		color: white;
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
		-webkit-line-clamp: 2;
		line-clamp: 2;
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
		-webkit-line-clamp: 3;
		line-clamp: 3;
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

	.sidebar-title svg {
		width: 1.3rem;
		height: 1.3rem;
	}

	/* Search Box */
	.search-box {
		display: flex;
		gap: 0.5rem;
	}

	.search-box .form-control {
		border-radius: 0.5rem;
		border: 2px solid var(--bs-border-color);
		padding: 0.625rem 1rem;
	}

	.search-box .form-control:focus {
		border-color: var(--bs-primary);
		box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
	}

	.search-box .btn {
		border-radius: 0.5rem;
		padding: 0.625rem 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.search-box .btn svg {
		width: 1.2rem;
		height: 1.2rem;
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
	.pagination-container {
		margin-top: 3rem;
		padding: 2rem 0;
		border-top: 1px solid var(--bs-border-color);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.pagination-info {
		font-size: 0.9rem;
		color: var(--bs-gray-600);
	}

	.pagination {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
		gap: 0.25rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.pagination .page-item {
		margin: 0;
	}

	.pagination .page-link {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		height: 44px;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 2px solid var(--bs-border-color);
		background: white;
		color: var(--bs-dark);
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
		font-size: 0.9rem;
	}

	.pagination .page-link:hover:not(.disabled) {
		background: var(--bs-primary);
		border-color: var(--bs-primary);
		color: white;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.pagination .page-item.active .page-link {
		background: var(--bs-primary);
		border-color: var(--bs-primary);
		color: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.pagination .page-item.disabled .page-link {
		background: var(--bs-gray-100);
		border-color: var(--bs-gray-300);
		color: var(--bs-gray-400);
		cursor: not-allowed;
		opacity: 0.6;
	}

	.pagination .page-link:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
	}

	.pagination-jumper {
		margin-top: 0.5rem;
	}

	.pagination-jumper .form-control {
		border-radius: 0.375rem;
		border: 1px solid var(--bs-border-color);
		font-size: 0.875rem;
	}

	.pagination-jumper .form-control:focus {
		border-color: var(--bs-primary);
		box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
	}

	.pagination-jumper .btn {
		border-radius: 0.375rem;
		font-weight: 500;
		padding: 0.25rem 0.75rem;
	}

	/* Responsive */
	@media (max-width: 991px) {
		.blog-header {
			padding: 3rem 0 2rem;
			margin-bottom: 2rem;
		}

		.pagination-container {
			margin-top: 2rem;
			padding: 1.5rem 0;
		}

		.pagination .page-link {
			min-width: 40px;
			height: 40px;
			padding: 0.375rem 0.5rem;
			font-size: 0.85rem;
		}

		.pagination-jumper {
			margin-top: 1rem;
		}

		.pagination-jumper .d-flex {
			flex-direction: column;
			align-items: stretch !important;
			gap: 0.5rem !important;
		}

		.pagination-jumper input {
			width: 100% !important;
		}
	}

	@media (max-width: 576px) {
		.pagination {
			gap: 0.125rem;
		}

		.pagination .page-link {
			min-width: 36px;
			height: 36px;
			padding: 0.25rem 0.375rem;
			font-size: 0.8rem;
		}

		.pagination-info {
			font-size: 0.8rem;
			text-align: center;
		}
	}
</style>
