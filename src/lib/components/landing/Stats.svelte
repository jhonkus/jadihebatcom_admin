<script>
	export let stats = [
		{ number: '10K+', label: 'Students Enrolled' },
		{ number: '500+', label: 'Courses Available' },
		{ number: '1K+', label: 'Expert Instructors' },
		{ number: '50+', label: 'Countries Reached' }
	];
</script>

<section class="py-5 bg-light">
	<div class="container">
		<div class="row g-4">
			{#each stats as stat}
				<div class="col-6 col-md-3">
					<div class="text-center">
						<div class="h1 fw-bold text-primary mb-2">{stat.number}</div>
						<div class="h6 text-muted">{stat.label}</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	section {
		scroll-margin-top: 2rem;
	}
</style>
