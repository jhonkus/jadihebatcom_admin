<!-- routes/courses/+page.svelte -->
<script lang="ts">
	import CourseHeader from '$lib/components/courses/CourseHeader.svelte';
	import CourseFilters from '$lib/components/courses/CourseFilters.svelte';
	import CourseGrid from '$lib/components/courses/CourseGrid.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	const {
		courses: serverCourses,
		allCategories,
		availableLevels,
		total,
		page: currentPage,
		limit,
		totalPages,
		currentFilters
	} = data;

	// Get categories from allCategories (not from filtered courses)
	const categories = allCategories.map((cat: { name: string }) => cat.name);

	// Get filter values from current filters
	const selectedCategory = currentFilters?.category || 'all';
	const selectedLevel = currentFilters?.level || 'all';
	const priceRange = currentFilters?.price || 'all';
	const searchQuery = currentFilters?.search || '';
</script>

<CourseHeader />

<!-- Main Content -->
<section class="py-5">
	<div class="container">
		<div class="row">
			<!-- Sidebar Filter -->
			<div class="col-lg-3 mb-4">
				<CourseFilters
					{categories}
					{availableLevels}
					{selectedCategory}
					{selectedLevel}
					{priceRange}
					{searchQuery}
					sortBy={currentFilters?.sort || 'newest'}
				/>
			</div>

			<!-- Course Grid -->
			<div class="col-lg-9">
				<CourseGrid
					filteredCourses={serverCourses}
					{currentPage}
					{totalPages}
					totalItems={total}
					itemsPerPage={limit}
					sortBy={currentFilters?.sort || 'newest'}
					{searchQuery}
					{selectedCategory}
					{selectedLevel}
					{priceRange}
				/>
			</div>
		</div>
	</div>
</section>
