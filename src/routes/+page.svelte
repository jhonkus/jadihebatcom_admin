<script>
	import Categories from '$lib/components/landing/Categories.svelte';
	import CTA from '$lib/components/landing/CTA.svelte';
	import FeaturedCourses from '$lib/components/landing/FeaturedCourses.svelte';
	import FinalCTA from '$lib/components/landing/FinalCTA.svelte';
	import Hero from '$lib/components/landing/Hero.svelte';
	import News from '$lib/components/landing/News.svelte';

	export let data;
	const { categories, courses, formattedArticles } = data;
</script>

<!-- Hero Section -->
<Hero />
<!-- Category Section -->
<Categories {categories} />

<!-- Featured Courses Section -->
<FeaturedCourses featuredCourses={courses} />

<!-- Why Choose Us Section -->
<!-- <WhyChooseUs reasons={reasons}/> -->

<!-- CTA Section -->
<CTA />

<!-- Testimonial Section -->
<!-- <Testimonials testimonials={testimonials}/> -->

<!-- News Section -->
<News news={formattedArticles} />

<!-- Final CTA Section -->
<FinalCTA />
