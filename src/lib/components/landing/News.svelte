<script lang="ts">
	import { buildImageSources } from '$lib/utils/images';
	export let news: any[] = [];

	const categoryColors = ['primary', 'success', 'info', 'warning', 'danger'];

	function getCategoryColor(index: number) {
		return categoryColors[index % categoryColors.length];
	}

	function handleCategoryClick(e: Event, categorySlug: string) {
		e.preventDefault();
		e.stopPropagation();
		window.location.href = `/blog/category/${categorySlug}`;
	}

	function getArticleImageSources(imageUrl: string) {
		return buildImageSources(imageUrl, {
			widths: [360, 540, 720, 960],
			quality: 80
		});
	}
</script>

<section class="py-5">
	<div class="container py-4">
		<div class="text-center mb-5">
			<h2 class="display-5 fw-bold mb-3">Berita & Artikel Terbaru</h2>
			<p class="lead text-secondary">Tips, tutorial, dan inspirasi untuk perjalanan belajarmu</p>
		</div>

		<div class="row g-4">
			{#each news as article}
				<div class="col-md-6 col-lg-4">
					<a href={`/blog/${article.slug}`} class="news-card">
						<div class="news-card-content">
							{#if article.imageUrl}
								{@const articleImage = getArticleImageSources(article.imageUrl)}
								<img
									src={articleImage.src}
									srcset={articleImage.srcset || undefined}
									sizes={articleImage.srcset
										? '(min-width: 1200px) 360px, (min-width: 992px) 300px, (min-width: 768px) 45vw, 90vw'
										: undefined}
									class="card-img-top mb-3"
									alt={article.title}
									loading="lazy"
									decoding="async"
									width="360"
									height="200"
									style="height: 200px; object-fit: cover; border-radius: 0.5rem;"
								/>
							{/if}

							<!-- Display all categories -->
							{#if article.categories && article.categories.length > 0}
								<div class="mb-3">
									{#each article.categories as category, index}
										<span
											class={`badge bg-${getCategoryColor(index)} me-1 category-badge`}
											role="button"
											tabindex="0"
											onclick={(e) => handleCategoryClick(e, category.slug)}
											onkeypress={(e) => e.key === 'Enter' && handleCategoryClick(e, category.slug)}
										>
											{category.name}
										</span>
									{/each}
								</div>
							{/if}

							<h3 class="news-card-title">{article.title}</h3>
							<p class="news-card-excerpt">{article.excerpt}</p>
							<div class="news-card-footer">
								<small class="text-secondary"
									>{article.formattedDateUpdated || article.formattedDate}</small
								>
							</div>
						</div>
					</a>
				</div>
			{/each}
		</div>

		<div class="text-center mt-5">
			<a href="/blog" class="btn btn-outline-primary btn-lg"> Lihat Semua Artikel </a>
		</div>
	</div>
</section>

<style>
	/* News Card */
	.news-card {
		display: block;
		height: 100%;
		background-color: white;
		border: 2px solid var(--bs-border-color);
		border-radius: 0.75rem;
		padding: 1.3rem;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
	}

	.news-card:hover {
		border-color: var(--bs-primary);
		background-color: #f8f9ff;
		transform: translateY(-2px);
	}

	.news-card-content {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.news-card-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--bs-dark);
		margin-bottom: 0.75rem;
		line-height: 1.4;
	}

	.news-card-excerpt {
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

	.news-card-footer {
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid var(--bs-border-color);
	}

	.card-img-top {
		transition: opacity 0.2s ease-in-out;
	}

	.badge {
		font-weight: 500;
		padding: 0.35em 0.65em;
	}

	.category-badge {
		cursor: pointer;
		transition:
			transform 0.2s ease,
			opacity 0.2s ease;
	}

	.category-badge:hover {
		transform: scale(1.05);
		opacity: 0.9;
	}
</style>
