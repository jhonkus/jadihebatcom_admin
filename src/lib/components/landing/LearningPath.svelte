<script>
	let learningPaths = [
		{
			category: 'Web Development',
			courses: ['HTML/CSS Fundamentals', 'JavaScript Modern', 'React Mastery', 'Node.js Backend']
		},
		{
			category: 'Data Science',
			courses: [
				'Python untuk Pemula',
				'Pandas & Data Analysis',
				'Machine Learning Dasar',
				'Visualisasi Data'
			]
		},
		{
			category: 'Mobile Development',
			courses: ['Flutter Cross-Platform', 'React Native', 'Android Kotlin', 'iOS Swift']
		}
	];
</script>

<section class="py-5">
	<div class="container">
		<div class="text-center mb-5">
			<h2 class="display-5 fw-bold mb-3">Learning Path Populer</h2>
			<p class="lead text-muted">Jalur pembelajaran terstruktur untuk karir di bidang teknologi</p>
		</div>

		<div class="row g-4">
			{#each learningPaths as path}
				<div class="col-lg-4">
					<div class="card h-100 border-0 card-course">
						<div class="card-header bg-transparent border-bottom-0 pb-0">
							<h5 class="card-title text-primary">{path.category}</h5>
						</div>
						<div class="card-body">
							<ul class="list-unstyled">
								{#each path.courses as course}
									<li class="d-flex align-items-center mb-2">
										<span class="badge badge-primary me-2">→</span>
										<span>{course}</span>
									</li>
								{/each}
							</ul>
						</div>
						<div class="card-footer bg-transparent border-top-0">
							<a href="/courses" class="btn btn-outline-primary btn-sm">Jelajahi Path</a>
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

	.card-course {
		transition:
			transform 0.3s,
			box-shadow 0.3s;
	}

	.card-course:hover {
		transform: translateY(-10px);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
	}
</style>
