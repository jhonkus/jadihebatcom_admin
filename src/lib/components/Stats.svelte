<script>
	import { onMount } from 'svelte';

	const stats = [
		{ number: '1+', label: 'Pelajar Aktif' },
		{ number: '1+', label: 'Kursus Tersedia' },
		{ number: '1+', label: 'Instruktur Ahli' },
		{ number: '95%', label: 'Tingkat Kepuasan' }
	];

	let animated = false;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !animated) {
					animated = true;
					animateStats();
				}
			},
			{ threshold: 0.5 }
		);

		const section = document.querySelector('.stats-section');
		if (section) observer.observe(section);

		return () => observer.disconnect();
	});

	function animateStats() {
		const statNumbers = document.querySelectorAll('.stat-number');
		statNumbers.forEach((stat) => {
			const finalValue = stat.textContent;
			const isPercentage = finalValue.includes('%');
			const isPlus = finalValue.includes('+');
			const numericValue = parseInt(finalValue.replace(/[^0-9]/g, ''));

			let current = 0;
			const increment = numericValue / 50;
			const timer = setInterval(() => {
				current += increment;
				if (current >= numericValue) {
					stat.textContent = finalValue;
					clearInterval(timer);
				} else {
					stat.textContent =
						Math.floor(current).toLocaleString() + (isPlus ? '+' : '') + (isPercentage ? '%' : '');
				}
			}, 30);
		});
	}
</script>

<section class="stats-section bg-white py-5 shadow-sm">
	<div class="container">
		<div class="row g-4 text-center">
			{#each stats as stat}
				<div class="col-6 col-md-3">
					<div class="p-3">
						<div class="stat-number display-4 fw-bold gradient-text">{stat.number}</div>
						<div class="text-muted mt-2">{stat.label}</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
