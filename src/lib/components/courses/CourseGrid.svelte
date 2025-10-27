<!-- lib/components/courses/CourseGrid.svelte -->
<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import CourseCard from './CourseCard.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import CourseSorting from './CourseSorting.svelte';

	let {
		filteredCourses = [],
		currentPage = 1,
		totalPages = 1,
		totalItems = 0,
		itemsPerPage = 12,
		sortBy = 'newest',
		searchQuery = '',
		selectedCategory = '',
		selectedLevel = '',
		priceRange = ''
	} = $props();

	const displayText = `Menampilkan ${filteredCourses.length} dari ${totalItems} kursus`;
</script>

<!-- Results Header -->
<div class="results-header">
	<div class="d-flex justify-content-between align-items-center">
		<div class="results-info">
			<h5 class="mb-0 results-count">
				{displayText}
			</h5>
			{#if searchQuery}
				<small class="text-muted">
					Pencarian: "<strong>{searchQuery}</strong>"
				</small>
			{/if}
		</div>
		<CourseSorting {sortBy} {searchQuery} {selectedCategory} {selectedLevel} {priceRange} />
	</div>
</div>

{#if filteredCourses.length === 0}
	<!-- Empty State -->
	<div class="empty-state">
		<div class="text-center py-5">
			<div class="empty-icon">🔍</div>
			<h4 class="mt-3 empty-title">Tidak Ada Kursus Ditemukan</h4>
			<p class="text-secondary empty-description">Coba ubah filter atau kata kunci pencarian</p>
			<a href="/courses" class="btn btn-primary mt-3 reset-button">
				<i class="bi bi-arrow-counterclockwise me-2"></i>
				Reset Filter
			</a>
		</div>
	</div>
{:else}
	<!-- Courses Grid -->
	<div class="courses-grid" transition:fade={{ duration: 200 }}>
		<div class="row g-4 mb-5">
			{#each filteredCourses as course (course.id)}
				<div class="col-md-6 col-lg-4 course-item" transition:slide={{ duration: 150 }}>
					<CourseCard {course} />
				</div>
			{/each}
		</div>
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="pagination-container">
			<Pagination {currentPage} {totalPages} {totalItems} {itemsPerPage} />
		</div>
	{/if}
{/if}

<style>
	.results-header {
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e9ecef;
	}

	.results-info {
		flex: 1;
	}

	.results-count {
		color: #2d3748;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.empty-state {
		min-height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.empty-icon {
		font-size: 4rem;
		opacity: 0.6;
	}

	.empty-title {
		color: #4a5568;
		font-weight: 600;
	}

	.empty-description {
		font-size: 1rem;
		margin-bottom: 0;
	}

	.reset-button {
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.reset-button:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
	}

	.courses-grid {
		animation: fadeIn 0.3s ease-in-out;
	}

	.course-item {
		animation: slideIn 0.4s ease-out;
		animation-fill-mode: both;
	}

	.course-item:nth-child(1) {
		animation-delay: 0.05s;
	}
	.course-item:nth-child(2) {
		animation-delay: 0.1s;
	}
	.course-item:nth-child(3) {
		animation-delay: 0.15s;
	}
	.course-item:nth-child(4) {
		animation-delay: 0.2s;
	}
	.course-item:nth-child(5) {
		animation-delay: 0.25s;
	}
	.course-item:nth-child(6) {
		animation-delay: 0.3s;
	}

	.pagination-container {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid #e9ecef;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.results-header {
			margin-bottom: 1.5rem;
		}

		.results-info {
			margin-bottom: 1rem;
		}

		.empty-state {
			min-height: 300px;
		}

		.empty-icon {
			font-size: 3rem;
		}

		.course-item {
			margin-bottom: 1rem;
		}
	}
</style>
