<script lang="ts">
	export let reasons: any[] = [];
</script>

<section class="py-5">
	<div class="container py-4">
		<div class="text-center mb-5">
			<h2 class="display-5 fw-bold mb-3">Kenapa Memilih Kami?</h2>
			<p class="lead text-secondary">
				Kami berkomitmen memberikan pengalaman belajar terbaik untuk kesuksesan karirmu
			</p>
		</div>

		<div class="row g-4">
			{#each reasons as reason}
				<div class="col-md-6 col-lg-4">
					<div class="text-center">
						<div class="mb-3" style="font-size: 4rem;">
							{reason.icon}
						</div>
						<h3 class="h5 fw-bold mb-3">{reason.title}</h3>
						<p class="text-secondary mb-0">{reason.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
