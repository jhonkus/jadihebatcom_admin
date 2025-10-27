<script>
	let features = [
		{
			icon: '📚',
			title: 'Materi Text Komprehensif',
			description:
				'Konten pembelajaran mendalam berbasis text yang mudah dipahami dan dapat diakses kapan saja.'
		},
		{
			icon: '🧪',
			title: 'Quiz Interaktif',
			description: 'Uji pemahaman Anda dengan quiz yang menarik dan memberikan feedback instan.'
		},
		{
			icon: '💻',
			title: 'Panduan Praktek',
			description: 'Panduan praktek yang disusun secara step by step mudah diikuti.'
		},
		{
			icon: '📱',
			title: 'Akses Multi-Device',
			description: 'Belajar dari desktop, laptop atau tablet tidak dianjurkan dari HP.'
		},
		{
			icon: '🎯',
			title: 'Learning Path Terstruktur',
			description: 'Modul yang disusun secara bertahap untuk memastikan pembelajaran yang efektif.'
		},
		{
			icon: '🏆',
			title: 'Sertifikat Penyelesaian',
			description:
				'Dapatkan sertifikat dari kami  setelah menyelesaikan kursus untuk meningkatkan portofolio Kamu.'
		}
	];
</script>

<section class="py-5 bg-light">
	<div class="container">
		<div class="text-center mb-5">
			<h2 class="display-5 fw-bold mb-3">Fitur Unggulan</h2>
			<p class="lead text-muted">Platform pembelajaran yang dirancang untuk efektivitas maksimal</p>
		</div>

		<div class="row g-4">
			{#each features as feature}
				<div class="col-md-6 col-lg-4">
					<div class="card h-100 border-0">
						<div class="card-body text-center p-4">
							<div class="display-6 text-primary mb-3">{feature.icon}</div>
							<h5 class="card-title h5 mb-3">{feature.title}</h5>
							<p class="card-text text-muted">{feature.description}</p>
						</div>
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
