<!-- lib/components/courses/CourseSorting.svelte -->
<script lang="ts">
	let {
		sortBy = 'newest',
		searchQuery = '',
		selectedCategory = '',
		selectedLevel = '',
		priceRange = ''
	} = $props();

	const sortOptions = [
		{ value: 'newest', label: 'Terbaru' },
		{ value: 'oldest', label: 'Terlama' },
		{ value: 'price-low', label: 'Harga: Rendah ke Tinggi' },
		{ value: 'price-high', label: 'Harga: Tinggi ke Rendah' },
		{ value: 'rating', label: 'Rating Tertinggi' },
		{ value: 'popular', label: 'Paling Populer' },
		{ value: 'title-asc', label: 'Judul: A-Z' },
		{ value: 'title-desc', label: 'Judul: Z-A' }
	];
</script>

<form method="GET" action="/courses" class="d-flex align-items-center gap-3">
	<!-- Hidden inputs to preserve filters -->
	{#if searchQuery}
		<input type="hidden" name="search" value={searchQuery} />
	{/if}
	{#if selectedCategory && selectedCategory !== 'all'}
		<input type="hidden" name="category" value={selectedCategory} />
	{/if}
	{#if selectedLevel && selectedLevel !== 'all'}
		<input type="hidden" name="level" value={selectedLevel} />
	{/if}
	{#if priceRange && priceRange !== 'all'}
		<input type="hidden" name="price" value={priceRange} />
	{/if}

	<label for="sortBySelect" class="form-label mb-0 fw-semibold">Urutkan:</label>
	<select
		id="sortBySelect"
		name="sort"
		class="form-select"
		style="width: auto;"
		value={sortBy}
		onchange={(e) => (e.target as HTMLSelectElement).form?.submit()}
	>
		{#each sortOptions as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</form>
