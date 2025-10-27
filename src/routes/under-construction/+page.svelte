<script lang="ts">
	import { onMount } from 'svelte';

	// Animated icon rotation
	let rotation = 0;

	onMount(() => {
		const interval = setInterval(() => {
			rotation = (rotation + 1) % 360;
		}, 30);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Under Construction - jadihebat.com</title>
</svelte:head>

<div class="construction-container">
	<div class="content-box">
		<!-- Animated Icon -->
		<div class="icon-wrapper">
			<div class="icon-circle" style="transform: rotate({rotation}deg)">
				<span class="icon">🚧</span>
			</div>
		</div>

		<!-- Content -->
		<h1 class="title">Halaman Sedang Dibangun</h1>
		<p class="description">
			Maaf atas ketidaknyamanannya. Kami sedang menyiapkan sesuatu yang istimewa untuk kamu!
		</p>

		<!-- Buttons -->
		<div class="button-group">
			<a href="/" class="btn btn-primary btn-lg"> Kembali ke Beranda </a>
			<a href="/courses" class="btn btn-outline-primary btn-lg"> Lihat Kursus </a>
		</div>
	</div>
</div>

<style>
	.construction-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
		padding: 2rem;
	}

	.content-box {
		text-align: center;
		max-width: 600px;
	}

	/* Icon Animation */
	.icon-wrapper {
		margin-bottom: 2rem;
	}

	.icon-circle {
		width: 150px;
		height: 150px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		background: white;
		border-radius: 50%;
		border: 3px solid var(--bs-primary);
		position: relative;
	}

	.icon-circle::before {
		content: '';
		position: absolute;
		width: 170px;
		height: 170px;
		border-radius: 50%;
		border: 2px dashed var(--bs-primary);
		opacity: 0.3;
	}

	.icon {
		font-size: 4rem;
		display: block;
	}

	/* Text */
	.title {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--bs-dark);
		margin-bottom: 1rem;
		background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.description {
		font-size: 1.125rem;
		color: var(--bs-gray-700);
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	/* Buttons */
	.button-group {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.icon-circle {
			width: 120px;
			height: 120px;
		}

		.icon-circle::before {
			width: 140px;
			height: 140px;
		}

		.icon {
			font-size: 3rem;
		}

		.title {
			font-size: 2rem;
		}

		.description {
			font-size: 1rem;
		}

		.button-group {
			flex-direction: column;
		}

		.button-group .btn {
			width: 100%;
		}
	}
</style>
