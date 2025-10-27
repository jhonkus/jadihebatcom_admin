<!-- lib/components/courses/CourseCard.svelte -->
<script lang="ts">
	import { Clock } from 'lucide-svelte';
	let { course } = $props();
	function truncateText(text: string, maxLength: number = 100): string {
		if (!text) return '';
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}
	function formatPrice(price: string, isFree: boolean): string {
		if (isFree) return 'Gratis';
		if (!price) return 'Rp 0';
		return `Rp ${parseInt(price).toLocaleString('id-ID')}`;
	}

	function getCategoryColor(categoryName: string): string {
		let hash = 0;
		for (let i = 0; i < categoryName.length; i++) {
			hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
		}
		const colors = [
			'#2563EB',
			'#00d991',
			'#0084ff',
			'#ff6b6b',
			'#4ecdc4',
			'#ff3b3b',
			'#a8e6cf',
			'#ffb700'
		];
		return colors[Math.abs(hash) % colors.length];
	}
</script>

<article class="course-card">
	<a href="/courses/{course.slug}" class="course-card-link">
		<div class="course-thumbnail">
			{#if course.thumbnail_url}
				<img
					src={course.thumbnail_url}
					alt={course.title}
					loading="lazy"
					decoding="async"
					width="320"
					height="200"
				/>
			{:else}
				<div
					class="thumbnail-placeholder"
					style="background: linear-gradient(135deg, {getCategoryColor(
						course.category_id?.name || 'Default'
					)} 0%, {getCategoryColor(course.category_id?.name || 'Default')}dd 100%);"
				>
					<i class="bi bi-book fs-1 text-white opacity-75"></i>
				</div>
			{/if}

			<div class="category-overlay">
				<span
					class="badge category-badge"
					style="background-color: {getCategoryColor(course.category_id?.name || 'Default')};"
				>
					{course.category_id?.name || 'Uncategorized'}
				</span>
			</div>

			{#if !course.is_free}
				<div class="price-overlay">
					<span class="price-tag">
						{formatPrice(course.price, course.is_free)}
					</span>
				</div>
			{:else}
				<div class="price-overlay">
					<span class="price-tag free"> Gratis </span>
				</div>
			{/if}
		</div>

		<div class="course-card-body">
			<h3 class="course-title">
				{course.title}
			</h3>

			<p class="course-description">
				{truncateText(course.short_description || '')}
			</p>

			<div class="course-meta">
				<div class="meta-items">
					<span class="meta-item level-badge">
						<i class="bi bi-signal"></i>
						{course.difficulty_level}
					</span>
					<span class="meta-item">
						<Clock size="16" class="feature-icon" aria-hidden="true" />
						{course.estimated_duration ?? 'tidak tersedia'}
					</span>
				</div>
			</div>
		</div>
	</a>
</article>

<style>
	.course-card {
		height: 100%;
		background: white;
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
	}

	.course-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
	}

	.meta-item svg {
		width: 1rem;
		height: 1rem;
	}
	.course-card-link {
		display: flex;
		flex-direction: column;
		height: 100%;
		text-decoration: none;
		color: inherit;
	}

	/* Thumbnail */
	.course-thumbnail {
		position: relative;
		width: 100%;
		height: 200px;
		overflow: hidden;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	}

	.course-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.course-card:hover .course-thumbnail img {
		transform: scale(1.05);
	}

	.thumbnail-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Category Badge */
	.category-overlay {
		position: absolute;
		top: 1rem;
		left: 1rem;
		z-index: 2;
	}

	.category-badge {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.4rem 0.8rem;
		border-radius: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(10px);
	}

	/* Price Tag */
	.price-overlay {
		position: absolute;
		top: 1rem;
		right: 1rem;
		z-index: 2;
	}

	.price-tag {
		display: inline-block;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 0.4rem 0.8rem;
		border-radius: 0.5rem;
		font-weight: 700;
		font-size: 0.9rem;
		backdrop-filter: blur(10px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.price-tag.free {
		background: linear-gradient(135deg, #00d991 0%, #00b372 100%);
	}

	/* Card Body */
	.course-card-body {
		display: flex;
		flex-direction: column;
		padding: 1.25rem;
		flex: 1;
	}

	.course-title {
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

	.course-description {
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
	}

	/* Meta Info */
	.course-meta {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-bottom: 0rem;
		padding-top: 1rem;
		border-top: 1px solid var(--bs-border-color);
	}

	.meta-items {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.meta-item {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.8rem;
		color: var(--bs-gray-600);
	}

	.meta-item i {
		font-size: 0.875rem;
	}

	.level-badge {
		background: #e6f4ff;
		color: #0084ff;
		padding: 0.35rem 0.75rem;
		border-radius: 0.5rem;
		font-weight: 600;
	}

	/* Responsive */
	@media (max-width: 991px) {
		.course-thumbnail {
			height: 180px;
		}
	}

	@media (max-width: 767px) {
		.course-thumbnail {
			height: 160px;
		}

		.meta-items {
			gap: 0.5rem;
		}
	}
</style>
