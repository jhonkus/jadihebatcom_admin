<script>
	import { page } from '$app/stores';

	$: status = $page.status;
	$: message = $page.error?.message || 'Terjadi kesalahan';

	// Different messages based on error type
	$: errorTitle =
		status === 404
			? 'Halaman Tidak Ditemukan'
			: status === 500
				? 'Server Error'
				: 'Terjadi Kesalahan';

	$: errorDescription =
		status === 404
			? 'Maaf, halaman yang kamu cari tidak ditemukan atau sudah dipindahkan.'
			: status === 500
				? 'Terjadi kesalahan pada server. Tim kami sedang memperbaikinya.'
				: message;

	$: errorIcon =
		status === 404 ? 'bi-compass' : status === 500 ? 'bi-exclamation-triangle' : 'bi-x-circle';
</script>

<svelte:head>
	<title>{errorTitle} - Jadi Hebat</title>
</svelte:head>

<div class="error-page">
	<div class="container">
		<div class="row">
			<div class="col-lg-6 mx-auto text-center">
				<!-- Error Icon -->
				<div class="error-icon mb-4">
					<i class="bi {errorIcon}"></i>
				</div>

				<!-- Error Code -->
				<h1 class="error-code mb-3">{status}</h1>

				<!-- Error Title -->
				<h2 class="error-title mb-3">{errorTitle}</h2>

				<!-- Error Description -->
				<p class="error-description mb-4">
					{errorDescription}
				</p>

				<!-- Actions -->
				<div class="error-actions">
					<a href="/" class="btn btn-primary btn-lg me-2">
						<i class="bi bi-house-door me-2"></i>
						Kembali ke Beranda
					</a>
					<a href="/courses" class="btn btn-outline-primary btn-lg">
						<i class="bi bi-journal-text me-2"></i>
						Lihat Kursus
					</a>
				</div>

				<!-- Quick Links -->
				{#if status === 404}
					<div class="quick-links mt-5">
						<h5 class="mb-3">Halaman Populer</h5>
						<div class="d-flex flex-wrap justify-content-center gap-2">
							<a href="/" class="link-item">Beranda</a>
							<a href="/blog" class="link-item">Blog</a>
							<a href="/courses" class="link-item">Kursus</a>
							<a href="/faq" class="link-item">FAQ</a>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.error-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4rem 0;
		/* Beautiful blue gradient - Ocean theme */
		background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%);
		/* Alternative: Sky blue gradient */
		/* background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%); */
		/* Alternative: Deep ocean blue */
		/* background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); */
		position: relative;
		overflow: hidden;
	}

	/* Decorative background elements */
	.error-page::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
		background-size: 50px 50px;
		animation: moveBackground 20s linear infinite;
	}

	/* Floating bubbles effect */
	.error-page::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image:
			radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
			radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
			radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
		pointer-events: none;
	}

	@keyframes moveBackground {
		0% {
			transform: translate(0, 0);
		}
		100% {
			transform: translate(50px, 50px);
		}
	}

	.container {
		position: relative;
		z-index: 1;
	}

	.error-icon {
		font-size: 6rem;
		color: white;
		animation: bounce 2s ease-in-out infinite;
		filter: drop-shadow(0 4px 20px rgba(255, 255, 255, 0.3));
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-20px);
		}
	}

	.error-code {
		font-size: 8rem;
		font-weight: 900;
		color: white;
		line-height: 1;
		text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		background: linear-gradient(to bottom, #ffffff 0%, #e0f2fe 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.error-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: white;
		margin-bottom: 1rem;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	}

	.error-description {
		font-size: 1.25rem;
		color: rgba(255, 255, 255, 0.95);
		max-width: 500px;
		margin: 0 auto;
		text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
	}

	.error-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}

	.btn {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
		font-weight: 600;
	}

	.btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
	}

	.btn-primary {
		background: white;
		color: #1e3c72;
		border-color: white;
	}

	.btn-primary:hover {
		background: rgba(255, 255, 255, 0.95);
		color: #1e3c72;
		border-color: rgba(255, 255, 255, 0.95);
	}

	.btn-outline-primary {
		border-color: white;
		color: white;
		border-width: 2px;
	}

	.btn-outline-primary:hover {
		background: white;
		color: #1e3c72;
		border-color: white;
	}

	.quick-links {
		background: rgba(255, 255, 255, 0.15);
		padding: 2rem;
		border-radius: 1rem;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.quick-links h5 {
		color: white;
		font-weight: 600;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	}

	.link-item {
		display: inline-block;
		padding: 0.5rem 1.25rem;
		background: rgba(255, 255, 255, 0.2);
		color: white;
		text-decoration: none;
		border-radius: 2rem;
		font-weight: 500;
		transition: all 0.2s ease;
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.link-item:hover {
		background: white;
		color: #1e3c72;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	/* Responsive */
	@media (max-width: 767px) {
		.error-code {
			font-size: 5rem;
		}

		.error-title {
			font-size: 2rem;
		}

		.error-description {
			font-size: 1.125rem;
		}

		.error-icon {
			font-size: 4rem;
		}

		.error-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.btn {
			width: 100%;
			margin: 0;
		}
	}
</style>
