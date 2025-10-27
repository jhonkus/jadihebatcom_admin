<!-- lib/components/ui/Pagination.svelte -->
<script lang="ts">
	let { currentPage, totalPages, totalItems, itemsPerPage } = $props();

	const startItem = $derived((currentPage - 1) * itemsPerPage + 1);
	const endItem = $derived(Math.min(currentPage * itemsPerPage, totalItems));
	const showPagination = $derived(totalPages > 1);

	function getPageNumbers(): (number | string)[] {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		for (
			let i = Math.max(2, currentPage - delta);
			i <= Math.min(totalPages - 1, currentPage + delta);
			i++
		) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push('...', totalPages);
		} else if (totalPages > 1) {
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	}
</script>

<div class="d-flex justify-content-between align-items-center">
	<div class="text-muted small">
		Menampilkan {startItem}-{endItem} dari {totalItems} kursus
	</div>

	{#if showPagination}
		<nav aria-label="Page navigation">
			<ul class="pagination mb-0">
				<!-- Previous Button -->
				<li class="page-item {currentPage === 1 ? 'disabled' : ''}">
					<a
						class="page-link"
						href={currentPage > 1 ? `?page=${currentPage - 1}` : '#'}
						aria-label="Previous"
					>
						&laquo;
					</a>
				</li>

				<!-- Page Numbers -->
				{#each getPageNumbers() as page}
					{#if page === '...'}
						<li class="page-item disabled">
							<span class="page-link">...</span>
						</li>
					{:else}
						<li class="page-item {page === currentPage ? 'active' : ''}">
							<a class="page-link" href={`?page=${page}`}>
								{page}
							</a>
						</li>
					{/if}
				{/each}

				<!-- Next Button -->
				<li class="page-item {currentPage === totalPages ? 'disabled' : ''}">
					<a
						class="page-link"
						href={currentPage < totalPages ? `?page=${currentPage + 1}` : '#'}
						aria-label="Next"
					>
						&raquo;
					</a>
				</li>
			</ul>
		</nav>
	{/if}
</div>
