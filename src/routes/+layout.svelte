<script>
	import { onMount } from 'svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import { page } from '$app/stores';
	import { theme } from '$lib/stores/theme';
	
	export let data;

	// Check if current route is learning route
	$: isLearningRoute = $page.route.id?.startsWith('/learning');

	onMount(() => {
		// Initialize theme system only for learning routes
		if (isLearningRoute) {
			theme.init();
		}
	});

	// Watch for route changes and initialize theme when entering learning routes
	$: if (isLearningRoute && typeof window !== 'undefined') {
		theme.init();
	}
</script>

<div class="app" class:enable-theming={isLearningRoute}>
	<!-- Hide Navbar on learning routes for focused learning experience -->
	{#if !isLearningRoute}
		<!-- @ts-ignore - TypeScript issue with user prop type -->
		<Navbar user={data.user} isAuthenticated={data.isAuthenticated} />
	{/if}
	
	<main class:learning-main={isLearningRoute}>
		<slot />
	</main>

	{#if !isLearningRoute}
		<Footer />
	{/if}
</div>
