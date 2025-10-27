<section class="cta-final-section text-white py-5">
	<div class="container py-4">
		<div class="row justify-content-center">
			<div class="col-lg-8 text-center">
				<h2 class="h1 fw-bold mb-4">Jangan Tunda Lagi!</h2>
				<p class="lead mb-4">
					Investasi terbaik adalah investasi untuk diri sendiri. Mulai belajar hari ini dan raih
					masa depan yang lebih cerah.
				</p>
				<a href="/register" class="btn btn-accent btn-lg"> Mulai Sekarang - Gratis! </a>
			</div>
		</div>
	</div>
</section>

<style>
	.cta-final-section {
		background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
		position: relative;
		overflow: hidden;
	}

	.cta-final-section h2 {
		color: #ffffff;
	}

	.cta-final-section p.lead {
		color: #f1f5f9; /* teks lebih jelas di atas biru */
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
		font-weight: 400;
	}

	/* Tombol utama */
	.cta-final-section .btn-accent {
		background-color: #60a5fa; /* biru muda dominan */
		border: none;
		color: #ffffff;
		font-weight: 600;
		padding: 0.75rem 2rem;
		transition:
			transform 0.15s ease,
			background-color 0.15s ease;
	}

	.cta-final-section .btn-accent:hover {
		transform: translateY(-2px);
		background-color: #3b82f6; /* sedikit lebih gelap di hover */
	}

	/* Efek cahaya lembut di background */
	.cta-final-section::before {
		content: '';
		position: absolute;
		top: -80px;
		left: 50%;
		width: 500px;
		height: 500px;
		background: radial-gradient(circle, rgba(147, 197, 253, 0.35) 0%, rgba(37, 99, 235, 0) 70%);
		transform: translateX(-50%);
		filter: blur(100px);
		z-index: 0;
	}

	.cta-final-section .container {
		position: relative;
		z-index: 1;
	}

	/* Responsif */
	@media (max-width: 768px) {
		.cta-final-section h2 {
			font-size: 1.75rem;
		}
		.cta-final-section .lead {
			font-size: 1rem;
		}
	}
</style>
