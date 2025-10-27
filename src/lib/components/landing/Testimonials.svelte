<script lang="ts">
	export let testimonials: any[] = [];
</script>

<section class="py-5 bg-light">
	<div class="container py-4">
		<div class="text-center mb-5">
			<h2 class="display-5 fw-bold mb-3">Apa Kata Mereka?</h2>
			<p class="lead text-secondary">
				Dengar cerita sukses dari alumni kami yang sudah berkarir di perusahaan ternama
			</p>
		</div>

		<div class="row g-4">
			{#each testimonials as testimonial}
				<div class="col-md-6 col-lg-4">
					<div class="card h-100">
						<div class="card-body">
							<div class="d-flex align-items-center mb-3">
								<div class="me-3" style="font-size: 3rem;">
									{testimonial.avatar}
								</div>
								<div>
									<h5 class="card-title mb-0 fw-bold">{testimonial.name}</h5>
									<p class="text-secondary mb-0 small">
										{testimonial.role} at {testimonial.company}
									</p>
								</div>
							</div>

							<div class="mb-3">
								<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
								{#each Array(testimonial.rating) as _}
									<span class="text-warning">⭐</span>
								{/each}
							</div>

							<p class="card-text text-secondary">
								"{testimonial.text}"
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="text-center mt-5">
			<a href="/" class="btn btn-outline-primary btn-lg"> Lihat Semua Testimoni </a>
		</div>
	</div>
</section>
