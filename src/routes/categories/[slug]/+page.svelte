<script lang="ts">
	import CourseCard from '$lib/components/courses/CourseCard.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const { category, featuredCourses, stats } = data;

	// Fungsi untuk menghasilkan gradasi dinamis
	function generateGradient(baseColor: string) {
		if (!baseColor) return 'linear-gradient(135deg, #5b6bff 0%, #8058d3 100%)';
		const darker = shadeColor(baseColor, -30);
		return `linear-gradient(135deg, ${baseColor} 0%, ${darker} 100%)`;
	}

	// Utility: membuat warna lebih gelap
	function shadeColor(color: string, percent: number) {
		const f = parseInt(color.slice(1), 16);
		const t = percent < 0 ? 0 : 255;
		const p = Math.abs(percent) / 100;
		const R = f >> 16;
		const G = (f >> 8) & 0x00ff;
		const B = f & 0x0000ff;
		const newColor =
			'#' +
			(
				0x1000000 +
				(Math.round((t - R) * p) + R) * 0x10000 +
				(Math.round((t - G) * p) + G) * 0x100 +
				(Math.round((t - B) * p) + B)
			)
				.toString(16)
				.slice(1);
		return newColor;
	}
</script>

<svelte:head>
	<title>{category.name} - Kursus Terbaik | jadihebat.com</title>
	<meta
		name="description"
		content={`Jelajahi ${stats.totalCourses}+ kursus ${category.name} terbaik. ${category.description || ''}`}
	/>
</svelte:head>

<!-- Hero Section -->
<section class="category-hero" style={`background: ${generateGradient('#2563eb')};`}>
	<div class="container py-5">
		<div class="row align-items-center">
			<div class="col-lg-8">
				<div class="d-flex align-items-center gap-4 mb-4">
					<div class="category-icon-wrapper">
						<i class={`devicon-${category.icon_name}`} style={`color: ${category.icon_color};`}></i>
					</div>
					<div>
						<h1 class="display-5 fw-bold mb-1 text-white">Kursus {category.name}</h1>
						{#if category.description}
							<p class="lead text-light opacity-75 mb-0">{category.description}</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Stats Section -->
<!-- <section class="py-4 bg-light border-top border-bottom">
  <div class="container">
    <div class="row g-4 text-center">
      <div class="col-6 col-md-3">
        <div class="stat-item">
          <div class="stat-value">{stats.totalCourses}</div>
          <div class="stat-label">Total Kursus</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-item">
          <div class="stat-value">⭐ {stats.avgRating}</div>
          <div class="stat-label">Rating Rata-rata</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-item">
          <div class="stat-value">{stats.freeCourses}</div>
          <div class="stat-label">Kursus Gratis</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-item">
          <div class="stat-value">{stats.totalStudents.toLocaleString('id-ID')}</div>
          <div class="stat-label">Total Siswa</div>
        </div>
      </div>
    </div>
  </div>
</section> -->

<!-- Featured Courses -->
<section class="py-5">
	<div class="container">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<h2 class="h3 fw-bold mb-0">Kursus pada kategori ini.</h2>
			<a
				href={`/courses?category=${encodeURIComponent(category.name)}`}
				class="btn btn-outline-primary"
			>
				Lihat Semua
			</a>
		</div>

		{#if featuredCourses.length > 0}
			<div class="row g-4">
				{#each featuredCourses as course}
					<div class="col-md-6 col-lg-3">
						<CourseCard {course} />
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-5">
				<div style="font-size: 4rem;">📚</div>
				<h4 class="mt-3">Belum Ada Kursus</h4>
				<p class="text-secondary">Kursus untuk kategori ini akan segera hadir!</p>
			</div>
		{/if}
	</div>
</section>

<!-- CTA Section -->
<section class="py-5">
	<div class="container">
		<div class="cta-box">
			<div class="row align-items-center">
				<div class="col-lg-8">
					<h3 class="fw-bold mb-2">Siap Mulai Belajar {category.name}?</h3>
					<p class="text-secondary mb-0">
						Bergabung dengan {stats.totalStudents.toLocaleString('id-ID')}+ siswa yang sudah belajar {category.name}
					</p>
				</div>
				<div class="col-lg-4 text-lg-end mt-3 mt-lg-0">
					<a
						href={`/courses?category=${encodeURIComponent(category.name)}`}
						class="btn btn-primary btn-lg"
					>
						Mulai Belajar Sekarang
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.category-hero {
		color: white;
		min-height: 360px;
		display: flex;
		align-items: center;
		overflow: hidden;
		position: relative;
	}

	.category-icon-wrapper {
		width: 100px;
		height: 100px;
		background: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
	}

	.category-icon-wrapper i {
		font-size: 3rem;
	}

	.stat-item {
		padding: 1rem;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: var(--bs-primary);
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--bs-secondary);
		font-weight: 500;
	}

	.cta-box {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: white;
		padding: 3rem;
		border-radius: 1rem;
		box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
	}

	@media (max-width: 991.98px) {
		.category-icon-wrapper {
			width: 70px;
			height: 70px;
		}
		.category-icon-wrapper i {
			font-size: 2rem;
		}
		.category-hero h1 {
			font-size: 2rem;
		}
		.cta-box {
			padding: 2rem;
			text-align: center;
		}
	}
</style>
