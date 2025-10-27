<!-- Hero Section -->
<section class="hero-section bg-primary text-white py-5">
	<div class="container">
		<div class="row align-items-center min-vh-75">
			<div class="col-lg-6">
				<h1 class="display-3 fw-bold mb-4">Mulai Karir Tech Impianmu dari Sini</h1>
				<p class="lead mb-4">
					Belajar coding, data science, AI dan blockchain dari nol sampai mahir. Raih karir impian
					dengan skill yang dibutuhkan industri.
				</p>
				<div class="d-flex gap-3 flex-wrap">
					<a href="/register" class="btn btn-accent btn-lg"> Mulai Belajar Gratis </a>
					<a href="/courses" class="btn btn-outline-light btn-lg"> Lihat Kursus </a>
				</div>
			</div>
			<div class="col-lg-6 d-none d-lg-block text-center position-relative">
				<div class="hero-glow"></div>
				<div style="font-size: 20rem; line-height: 1;">🚀</div>
			</div>
		</div>
	</div>
</section>

<style>
	.min-vh-75 {
		min-height: 75vh;
	}

	/* Background gradient */
	.hero-section {
		background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
		overflow: hidden;
		position: relative;
		z-index: 1;
	}

	/* Teks */
	.hero-section h1 {
		color: #ffffff;
	}

	.hero-section .lead {
		color: #cbd5e1;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
		font-weight: 400;
	}

	/* Tombol utama */
	.hero-section .btn-accent {
		background-color: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--bs-gray-900);
		font-weight: 600;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.hero-section .btn-accent:hover {
		transform: translateY(-2px);
		background-color: var(--color-accent-600);
		border-color: var(--color-accent-600);
		color: #fff;
	}

	/* Tombol sekunder outline putih */
	.hero-section .btn-outline-light {
		border-width: 2px;
		color: #ffffff;
		transition:
			transform 0.15s ease,
			background-color 0.15s ease;
	}

	.hero-section .btn-outline-light:hover {
		background-color: rgba(255, 255, 255, 0.15);
		transform: translateY(-2px);
	}

	/* Efek cahaya lembut di belakang 🚀 */
	.hero-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 400px;
		height: 400px;
		background: radial-gradient(circle, rgba(147, 197, 253, 0.6) 0%, rgba(37, 99, 235, 0) 70%);
		transform: translate(-50%, -50%);
		filter: blur(80px);
		z-index: 0;
	}

	.hero-section .col-lg-6:last-child {
		position: relative;
		z-index: 1;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero-section h1 {
			font-size: 2.25rem;
		}
		.hero-section .lead {
			font-size: 1rem;
		}
	}
</style>
