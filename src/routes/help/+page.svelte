<script>
	// Data untuk panduan singkat (contoh)
	const guides = [
		{
			title: 'Memulai Kursus',
			description:
				'Pelajari cara mendaftar, mengakses materi, dan memulai pembelajaran Anda di platform kami.'
		},
		{
			title: 'Manajemen Akun',
			description: 'Panduan untuk mengelola profil, kata sandi, dan pengaturan akun Anda.'
		},
		{
			title: 'Sertifikat dan Penilaian',
			description: 'Informasi tentang cara menyelesaikan kursus dan mendapatkan sertifikat.'
		}
	];
</script>

<svelte:head>
	<title>Bantuan - Kursus Online</title>
</svelte:head>

<div class="container my-5">
	<div class="row justify-content-center">
		<div class="col-lg-10">
			<!-- Header -->
			<h1 class="text-center mb-4">Pusat Bantuan</h1>
			<p class="text-center text-muted mb-5">
				Temukan panduan, sumber daya, atau hubungi kami untuk bantuan lebih lanjut.
			</p>
			<section class="mb-5">
				<h2 class="mb-4">Panduan Singkat</h2>
				<div class="row">
					{#each guides as guide}
						<div class="col-md-4 mb-3">
							<div class="card h-100">
								<div class="card-body">
									<h5 class="card-title">{guide.title}</h5>
									<p class="card-text">{guide.description}</p>
									<a href="/" class="btn btn-outline-primary">Pelajari Lebih Lanjut</a>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		</div>
	</div>
</div>

<style>
	.card {
		transition: transform 0.2s;
	}
	.card:hover {
		transform: translateY(-5px);
	}
</style>
