<!-- lib/components/courses/CourseFilters.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		categories = [],
		availableLevels = [],
		selectedCategory = 'all',
		selectedLevel = 'all',
		priceRange = 'all',
		searchQuery = '',
		sortBy = 'newest'
	} = $props();

	// Local state for form reference
	let formRef: HTMLFormElement;

	// Create level options from available levels
	const levelOptions = [
		{ value: 'all', label: 'Semua Level' },
		...availableLevels.map((level) => ({
			value: level,
			label: level.charAt(0).toUpperCase() + level.slice(1)
		}))
	];

	// Trim search on form submit
	function handleFormSubmit(event: Event) {
		const form = event.target as HTMLFormElement;
		const searchInput = form.querySelector<HTMLInputElement>('#courseSearch');
		if (searchInput) {
			searchInput.value = searchInput.value.trim();
		}
	}

	const priceOptions = [
		{ value: 'all', label: 'Semua Harga' },
		{ value: 'free', label: 'Gratis' },
		{ value: 'low', label: '< Rp 250.000' },
		{ value: 'medium', label: 'Rp 250.000 - 350.000' },
		{ value: 'high', label: '> Rp 350.000' }
	];

	// Check if any filters are active
	const hasActiveFilters =
		selectedCategory !== 'all' ||
		selectedLevel !== 'all' ||
		priceRange !== 'all' ||
		searchQuery !== '';
</script>

<!-- Professional Sidebar Filter -->
<div class="filter-sidebar">
	<div class="filter-header">
		<div class="d-flex justify-content-between align-items-center">
			<h5 class="filter-title mb-0">
				<i class="bi bi-funnel-fill me-2"></i>
				Filter Kursus
			</h5>
			{#if hasActiveFilters}
				<a href="/courses" class="btn btn-sm btn-outline-primary reset-btn">
					<i class="bi bi-arrow-counterclockwise me-1"></i>
					Reset
				</a>
			{/if}
		</div>
	</div>

	<form
		bind:this={formRef}
		method="GET"
		action="/courses"
		class="filter-content"
		onsubmit={handleFormSubmit}
		use:enhance
	>
		<!-- Search -->
		<div class="filter-section">
			<label for="courseSearch" class="filter-label">
				<i class="bi bi-search me-2"></i>
				Cari Kursus
			</label>
			<div class="search-input-wrapper">
				<input
					id="courseSearch"
					type="text"
					name="search"
					class="form-control search-input"
					placeholder="Ketik judul kursus..."
					value={searchQuery}
				/>
				{#if searchQuery}
					<a href="/courses" class="search-clear-btn" aria-label="Clear search">
						<i class="bi bi-x"></i>
					</a>
				{/if}
			</div>
			<button type="submit" class="btn btn-primary btn-sm mt-2 w-100">
				<i class="bi bi-search me-1"></i> Cari
			</button>
		</div>

		<!-- Hidden inputs to preserve sort when using other filters -->
		{#if sortBy && sortBy !== 'newest'}
			<input type="hidden" name="sort" value={sortBy} />
		{/if}

		<!-- Category Filter -->
		<div class="filter-section">
			<label for="categoryFilter" class="filter-label">
				<i class="bi bi-grid me-2"></i>
				Kategori
			</label>
			<select
				id="categoryFilter"
				name="category"
				class="form-select filter-select"
				value={selectedCategory}
				onchange={(e) => (e.target as HTMLSelectElement).form?.submit()}
			>
				<option value="all">Semua Kategori</option>
				{#each categories as category (category)}
					{#if category !== 'all'}
						<option value={category}>{category}</option>
					{/if}
				{/each}
			</select>
		</div>

		<!-- Level Filter -->
		<fieldset class="filter-section">
			<legend class="filter-label" id="levelFilterLabel">
				<i class="bi bi-bar-chart me-2"></i>
				Level Kesulitan
			</legend>
			<div class="radio-group" role="radiogroup" aria-labelledby="levelFilterLabel">
				{#each levelOptions as level (level.value)}
					<div class="radio-option">
						<input
							class="form-check-input"
							type="radio"
							name="level"
							id={`level-${level.value}`}
							value={level.value}
							checked={selectedLevel === level.value}
							onchange={(e) => (e.target as HTMLInputElement).form?.submit()}
						/>
						<label class="form-check-label radio-label" for={`level-${level.value}`}>
							{level.label}
						</label>
					</div>
				{/each}
			</div>
		</fieldset>

		<!-- Price Filter -->
		<fieldset class="filter-section">
			<legend class="filter-label" id="priceFilterLabel">
				<i class="bi bi-cash me-2"></i>
				Kisaran Harga
			</legend>
			<div class="radio-group" role="radiogroup" aria-labelledby="priceFilterLabel">
				{#each priceOptions as price (price.value)}
					<div class="radio-option">
						<input
							class="form-check-input"
							type="radio"
							name="price"
							id={`price-${price.value}`}
							value={price.value}
							checked={priceRange === price.value}
							onchange={(e) => (e.target as HTMLInputElement).form?.submit()}
						/>
						<label class="form-check-label radio-label" for={`price-${price.value}`}>
							{price.label}
						</label>
					</div>
				{/each}
			</div>
		</fieldset>
	</form>
</div>

<style>
	.filter-sidebar {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		border: 1px solid #e9ecef;
		overflow: hidden;
		position: sticky;
		top: 20px;
	}

	.filter-header {
		background: #f8fafc;
		border-bottom: 1px solid #e2e8f0;
		padding: 1.25rem 1.5rem;
	}

	.filter-title {
		color: #1a202c;
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
	}

	.reset-btn {
		color: #4a5568;
		border-color: #cbd5e0;
		background-color: transparent;
		font-size: 0.85rem;
		padding: 0.375rem 0.75rem;
		transition: all 0.2s ease;
	}

	.reset-btn:hover {
		background-color: #e2e8f0;
		border-color: #a0aec0;
		color: #2d3748;
	}

	.filter-content {
		padding: 1.5rem;
	}

	.filter-section {
		margin-bottom: 1.75rem;
		border: 0;
		padding: 0;
	}

	.filter-section legend {
		padding: 0;
	}

	.filter-section:last-child {
		margin-bottom: 0;
	}

	.filter-label {
		display: block;
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 0.75rem;
		font-size: 0.95rem;
	}

	.search-input-wrapper {
		position: relative;
	}

	.search-input {
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		font-size: 0.9rem;
		transition: all 0.2s ease;
		padding-right: 2.5rem;
	}

	.search-input:focus {
		border-color: #4a5568;
		box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.1);
		outline: none;
	}

	.search-clear-btn {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: #a0aec0;
		font-size: 1.1rem;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.search-clear-btn:hover {
		color: #4a5568;
		background-color: rgba(74, 85, 104, 0.1);
	}

	.filter-select {
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		font-size: 0.9rem;
		transition: all 0.2s ease;
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
		background-position: right 0.75rem center;
		background-repeat: no-repeat;
		background-size: 1rem;
		padding-right: 2.5rem;
	}

	.filter-select:focus {
		border-color: #4a5568;
		box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.1);
		outline: none;
	}

	.radio-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.radio-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		border-radius: 6px;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.radio-option:hover {
		background-color: #f8fafc;
	}

	.form-check-input {
		margin: 0;
		width: 1.1rem;
		height: 1.1rem;
		border: 2px solid #cbd5e0;
		transition: all 0.2s ease;
	}

	.form-check-input:checked {
		background-color: #4a5568;
		border-color: #4a5568;
	}

	.form-check-input:focus {
		border-color: #4a5568;
		box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.1);
	}

	.radio-label {
		margin: 0;
		font-size: 0.9rem;
		color: #4a5568;
		cursor: pointer;
		font-weight: 500;
	}

	/* Responsive adjustments */
	@media (max-width: 991px) {
		.filter-sidebar {
			position: static;
			margin-bottom: 2rem;
		}

		.filter-header {
			padding: 1rem 1.25rem;
		}

		.filter-content {
			padding: 1.25rem;
		}
	}

	@media (max-width: 576px) {
		.filter-title {
			font-size: 1rem;
		}

		.reset-btn {
			font-size: 0.8rem;
			padding: 0.25rem 0.5rem;
		}

		.filter-content {
			padding: 1rem;
		}

		.filter-section {
			margin-bottom: 1.5rem;
		}
	}
</style>
