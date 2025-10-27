<script lang="ts">
	import { GraduationCap, TrendingUp, Clock } from 'lucide-svelte';
	import type { Course } from '$lib/types/course';

	export let featuredCourses: Course[] = [];

	// Dynamic category color generation (consistent for same category)
	function getCategoryColor(categoryName: string): string {
		let hash = 0;
		for (let i = 0; i < categoryName.length; i++) {
			hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
		}

		// Generate vibrant colors
		const colors = [
			'#2563EB', // Blue
			'#00d991', // Green
			'#0084ff', // Blue
			'#ff6b6b', // Red
			'#4ecdc4', // Teal
			'#ff3b3b', // Bright Red
			'#a8e6cf', // Light Green
			'#ffb700', // Orange
			'#3B82F6', // Blue
			'#e74c3c', // Red
			'#3498db', // Blue
			'#2ecc71', // Green
			'#f39c12', // Yellow
			'#1abc9c', // Turquoise
			'#e67e22', // Orange
			'#1D4ED8' // Dark Blue
		];

		const index = Math.abs(hash) % colors.length;
		return colors[index];
	}

	// Level icon mapping (Material Icons)
	function getLevelIcon(level: string): string {
		const icons: Record<string, string> = {
			Beginner: 'star',
			Intermediate: 'stars',
			Advanced: 'military_tech'
		};
		return icons[level] || 'school';
	}
</script>

<section class="py-5">
	<div class="container py-4">
		<div class="text-center mb-5">
			<h2 class="display-5 fw-bold mb-3">Kursus Unggulan</h2>
			<p class="lead text-secondary">
				Kursus terpopuler dan paling banyak diminati oleh para pelajar
			</p>
		</div>

		<div class="row g-4">
			{#each featuredCourses as course}
				<div class="col-md-6 col-lg-3">
					<a href="/courses/{course.slug}" class="featured-course-card">
						<!-- Thumbnail -->
						<div class="course-thumbnail">
							{#if course.thumbnail_url}
								<img
									src={course.thumbnail_url}
									alt={course.title}
									loading="lazy"
									decoding="async"
									width="320"
									height="180"
								/>
							{:else}
								<div
									class="thumbnail-placeholder"
									style="background: linear-gradient(135deg, {getCategoryColor(
										course.category_id.name
									)} 0%, {getCategoryColor(course.category_id.name)}dd 100%);"
								>
									<GraduationCap size="48" class="placeholder-icon" aria-hidden="true" />
								</div>
							{/if}

							<!-- Category Badge on Image -->
							<div class="category-badge-overlay">
								<span
									class="badge category-badge"
									style="background-color: {getCategoryColor(
										course.category_id.name
									)}; color: white;"
								>
									{course.category_id.name}
								</span>
							</div>
						</div>

						<div class="featured-course-content">
							<!-- Title -->
							<h3 class="featured-course-title">
								{course.title}
							</h3>

							<!-- Description (max 2 lines) -->
							<p class="featured-course-description">
								{course.short_description}
							</p>

							<!-- Level & Duration -->
							<div class="featured-course-meta">
								<span class="level-badge">
									<TrendingUp size="16" class="feature-icon" aria-hidden="true" />
									<span>{course.difficulty_level}</span>
								</span>
								<span class="duration-badge">
									<Clock size="16" class="feature-icon" aria-hidden="true" />
									<span>{course.estimated_duration}</span>
								</span>
							</div>
						</div>
					</a>
				</div>
			{/each}
		</div>

		<div class="text-center mt-5">
			<a href="/courses" class="btn btn-outline-primary btn-lg"> Lihat Semua Kursus → </a>
		</div>
	</div>
</section>

<style>
	/* Featured Course Card */
	.featured-course-card {
		display: block;
		height: 100%;
		background-color: white;
		border-radius: 1rem;
		text-decoration: none;
		color: inherit;
		transition: all 0.3s ease;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.featured-course-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
	}

	/* Thumbnail */
	.course-thumbnail {
		position: relative;
		width: 100%;
		height: 180px;
		overflow: hidden;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
	}

	.course-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.featured-course-card:hover .course-thumbnail img {
		transform: scale(1.05);
	}

	.thumbnail-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.placeholder-icon {
		font-size: 4rem;
		color: rgba(255, 255, 255, 0.8);
	}

	/* Category Badge Overlay */
	.category-badge-overlay {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		z-index: 1;
	}

	.category-badge {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.4rem 0.8rem;
		border-radius: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(10px);
	}

	/* Content */
	.featured-course-content {
		display: flex;
		flex-direction: column;
		height: calc(100% - 180px);
		padding: 1.25rem;
	}

	.featured-course-title {
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

	/* Description with 2 lines max */
	.featured-course-description {
		font-size: 0.875rem;
		color: var(--bs-gray-600);
		line-height: 1.5;
		margin-bottom: 1rem;
		flex-grow: 1;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.featured-course-meta {
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid var(--bs-border-color);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.8rem;
	}

	/* Level Badge with Icon */
	.level-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background-color: #e6f4ff;
		color: #0084ff;
		padding: 0.35rem 0.75rem;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.75rem;
	}

	.level-badge svg {
		width: 1rem;
		height: 1rem;
	}

	/* Duration Badge with Icon */
	.duration-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--bs-gray-600);
		font-size: 0.75rem;
	}

	.duration-badge svg {
		width: 1rem;
		height: 1rem;
	}

	/* Responsive */
	@media (max-width: 991px) {
		.course-thumbnail {
			height: 160px;
		}

		.featured-course-content {
			height: calc(100% - 160px);
		}
	}
</style>
