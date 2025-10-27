<script lang="ts">
	import type { Category } from '$lib/types/course';

	export let categories: Category[] = [];
</script>

<!-- Category Section -->
<section class="py-5 bg-light">
	<div class="container py-4">
		<div class="text-center mb-5">
			<h2 class="display-5 fw-bold mb-3">Jelajahi Kategori Kursus</h2>
			<p class="lead text-secondary">Pilih jalur karir yang sesuai dengan minat dan tujuanmu</p>
		</div>

		<div class="row g-3">
			{#each categories as category}
				<div class="col-sm-6 col-md-4 col-lg-3">
					<!-- Link to category landing page -->
					<a href={`/categories/${category.slug}`} class="category-card">
						<div class="d-flex align-items-center gap-3">
							<!-- Devicon with custom color from DB -->
							<i
								class={`devicon-${category.icon_name} category-icon`}
								style={`color: ${category.icon_color};`}
							></i>
							<div class="flex-grow-1">
								<h3 class="category-title mb-0">
									{category.name}
								</h3>
								<small class="text-secondary">{category.totalCourses} Kursus</small>
							</div>
						</div>
					</a>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.category-card {
		display: block;
		padding: 1.25rem;
		background-color: white;
		border: 2px solid var(--bs-border-color);
		border-radius: 0.75rem;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
	}

	.category-card:hover {
		border-color: var(--bs-primary);
		background-color: #f8f9ff;
		transform: translateY(-2px);
	}

	.category-icon {
		font-size: 2.5rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.category-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--bs-dark);
		margin-bottom: 0.125rem;
	}
</style>
