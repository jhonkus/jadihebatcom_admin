<!-- src/routes/learning/+layout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	
	// Simple layout for focused learning - no main navigation
	// Enable theming for learning interface
	onMount(() => {
		document.body.classList.add('enable-theming');
		
		// Cleanup on unmount
		return () => {
			document.body.classList.remove('enable-theming');
		};
	});
</script>

<!-- Pure learning layout - no admin header or main sidebar -->
<div class="learning-layout">
	<slot />
</div>

<style>
	.learning-layout {
		min-height: 100vh;
		background: var(--learning-bg, #f8fafc);
		/* Allow the learning pages to scroll vertically */
		overflow-y: auto;
		color: var(--theme-text, #1e293b);
		transition: background-color 0.3s ease, color 0.3s ease;
	}

	/* Do not globally lock body scrolling; keep resets only in app.html */
</style>
