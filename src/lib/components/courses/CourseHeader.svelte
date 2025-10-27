<section class="courses-header text-white">
	<div class="overlay"></div>

	<div class="container position-relative z-2">
		<div class="row align-items-center">
			<div class="col-lg-9">
				<h1 class="display-5 fw-bold mb-3 lh-sm header-title">Jelajahi Semua Kursus Kami</h1>
				<p class="lead mb-0 fs-5 header-subtitle">
					Tingkatkan <span class="fw-semibold text-accent">karirmu</span> dengan pembelajaran yang
					relevan dan mendalam. Akses banyak
					<span class="fw-semibold text-accent">kursus unggulan</span>
					yang diramu oleh praktisi berpengalaman.
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	/* ===== Header Section ===== */
	.courses-header {
		position: relative;
		background: linear-gradient(135deg, var(--bs-primary), var(--color-primary-700));
		padding-top: 5rem;
		padding-bottom: 5rem;
		overflow: hidden;
	}

	/* Decorative overlay (subtle) */
	.courses-header .overlay::before {
		content: '';
		position: absolute;
		top: -15%;
		left: -15%;
		width: 130%;
		height: 130%;
		background:
			radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.15), transparent 60%),
			radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.08), transparent 70%);
		opacity: 0.8;
		animation: slowMove 16s ease-in-out infinite alternate;
	}

	@keyframes slowMove {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-25px);
		}
	}

	/* Text styling */
	.header-title {
		color: #fff;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
		animation: fadeSlideUp 1s ease-out forwards;
	}

	.header-subtitle {
		color: rgba(255, 255, 255, 0.9);
		line-height: 1.8;
		max-width: 720px;
		animation: fadeSlideUp 1.2s ease-out forwards;
		animation-delay: 0.1s;
		opacity: 0;
	}

	.text-accent {
		color: var(--color-accent, #f59e0b);
	}

	@keyframes fadeSlideUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
