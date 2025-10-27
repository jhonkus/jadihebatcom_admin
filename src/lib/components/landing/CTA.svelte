<section class="cta-section text-white py-5">
	<div class="container py-4">
		<div class="row justify-content-center">
			<div class="col-lg-8 text-center">
				<h2 class="display-5 fw-bold mb-4">Siap Memulai Perjalanan Belajarmu?</h2>
				<p class="lead mb-4">
					Bergabunglah dengan ribuan pelajar yang sudah mengubah karir mereka. Daftar sekarang dan
					dapatkan akses ke kursus pilihan gratis!
				</p>
				<div class="d-flex gap-3 justify-content-center flex-wrap">
					<a href="/register" class="btn btn-accent btn-lg"> Daftar Sekarang Gratis </a>
					<a href="/courses" class="btn btn-outline-light btn-lg"> Lihat Kursus </a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.cta-section {
		background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
		position: relative;
		overflow: hidden;
	}

	.cta-section h2 {
		color: #ffffff;
	}

	.cta-section p.lead {
		color: #f1f5f9;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
		font-weight: 400;
	}

	/* Tombol utama – sama seperti Hero */
	.cta-section .btn-accent {
		background-color: #60a5fa; /* biru muda */
		border: none;
		color: #ffffff;
		font-weight: 600;
		transition:
			transform 0.15s ease,
			background-color 0.15s ease;
	}

	.cta-section .btn-accent:hover {
		transform: translateY(-2px);
		background-color: #3b82f6; /* sedikit lebih gelap saat hover */
	}

	/* Tombol outline putih */
	.cta-section .btn-outline-light {
		border: 2px solid rgba(255, 255, 255, 0.9);
		color: #ffffff;
		transition:
			transform 0.15s ease,
			background-color 0.15s ease;
	}

	.cta-section .btn-outline-light:hover {
		background-color: rgba(255, 255, 255, 0.15);
		transform: translateY(-2px);
	}

	/* cahaya lembut opsional di belakang */
	.cta-section::before {
		content: '';
		position: absolute;
		top: -50px;
		left: 50%;
		width: 500px;
		height: 500px;
		background: radial-gradient(circle, rgba(147, 197, 253, 0.35) 0%, rgba(37, 99, 235, 0) 70%);
		transform: translateX(-50%);
		filter: blur(100px);
		z-index: 0;
	}

	.cta-section .container {
		position: relative;
		z-index: 1;
	}
</style>
