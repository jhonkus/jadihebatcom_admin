<!-- src/routes/my-courses/+page.svelte -->
<script lang="ts">
	import type { PageData } from '../my-courses/$types';

	import {
		GraduationCap,
		AlertCircle,
		BookOpen,
		Compass,
		Play,
		CheckCircle,
		TrendingUp,
		Search,
		X,
		User,
		Tag,
		BarChart,
		Info
	} from 'lucide-svelte';

	export let data: PageData;

	const iconMap: Record<string, any> = {
		school: GraduationCap,
		library_books: BookOpen,
		menu_book: BookOpen,
		explore: Compass,
		play_circle: Play,
		play_arrow: Play,
		check_circle: CheckCircle,
		trending_up: TrendingUp,
		person: User,
		category: Tag,
		bar_chart: BarChart,
		info: Info
	};

	let filteredEnrollments = data.enrollments;
	let activeFilter: 'all' | 'active' | 'completed' = 'all';
	let searchQuery = '';

	function filterCourses() {
		let result = data.enrollments;

		// Filter by status
		if (activeFilter !== 'all') {
			result = result.filter((e) => e.status === activeFilter);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(e) =>
					(e.course_id as any).title.toLowerCase().includes(query) ||
					(e.course_id as any).short_description?.toLowerCase().includes(query) ||
					(e.course_id as any).category_id?.name.toLowerCase().includes(query)
			);
		}

		filteredEnrollments = result;
	}

	function handleFilterChange(filter: 'all' | 'active' | 'completed') {
		activeFilter = filter;
		filterCourses();
	}

	function handleSearch(e: Event) {
		searchQuery = (e.target as HTMLInputElement).value;
		filterCourses();
	}

	function getProgressColor(progress: number): string {
		if (progress === 0) return '#e2e8f0';
		if (progress < 30) return '#f59e0b';
		if (progress < 70) return '#3b82f6';
		if (progress < 100) return '#2563EB';
		return '#10b981';
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Hari ini';
		if (diffDays === 1) return 'Kemarin';
		if (diffDays < 7) return `${diffDays} hari lalu`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;

		return date.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Kursus Saya - jadihebat</title>
</svelte:head>

<div class="my-courses-page">
	<!-- Hero Section -->
	<section class="hero-section">
		<div class="container">
			<div class="hero-content">
				<h1 class="hero-title">
					<GraduationCap class="hero-icon" size="40" aria-hidden="true" />
					Kursus Saya
				</h1>
				<p class="hero-subtitle">Lanjutkan perjalanan belajar Anda</p>
			</div>
		</div>
	</section>

	<div class="container py-5">
		{#if data.error}
			<!-- Error State -->
				<div class="alert alert-danger d-flex align-items-center" role="alert">
					<AlertCircle class="me-3" size="20" aria-hidden="true" />
				<div>
					<strong>Oops!</strong>
					{data.error}
					<!-- Removed broken link to /my-courses -->
				</div>
			</div>
		{:else if data.enrollments.length === 0}
			<!-- Empty State -->
				<div class="empty-state">
					<div class="empty-icon">
						<BookOpen size="48" aria-hidden="true" />
					</div>
				<h3 class="empty-title">Belum Ada Kursus</h3>
				<p class="empty-text">Mulai perjalanan belajar Anda dengan memilih kursus yang menarik</p>
					<!-- Removed broken link to /courses -->
						<Compass size="18" class="me-2" aria-hidden="true" />
						Jelajahi Kursus
			</div>
		{:else}
			<!-- Stats Cards -->
			<div class="row g-4 mb-5">
				<div class="col-md-3 col-sm-6">
					<div class="stat-card">
						<div class="stat-icon" style="background: rgba(59, 130, 246, 0.1);">
							<BookOpen size="28" style="color: #3B82F6;" aria-hidden="true" />
						</div>
						<div class="stat-content">
							<div class="stat-value">{data.stats.total}</div>
							<div class="stat-label">Total Kursus</div>
						</div>
					</div>
				</div>
				<div class="col-md-3 col-sm-6">
					<div class="stat-card">
						<div class="stat-icon" style="background: rgba(59, 130, 246, 0.1);">
							<Play size="28" style="color: #3b82f6;" aria-hidden="true" />
						</div>
						<div class="stat-content">
							<div class="stat-value">{data.stats.active}</div>
							<div class="stat-label">Sedang Berjalan</div>
						</div>
					</div>
				</div>
				<div class="col-md-3 col-sm-6">
					<div class="stat-card">
						<div class="stat-icon" style="background: rgba(16, 185, 129, 0.1);">
							<CheckCircle size="28" style="color: #10b981;" aria-hidden="true" />
						</div>
						<div class="stat-content">
							<div class="stat-value">{data.stats.completed}</div>
							<div class="stat-label">Selesai</div>
						</div>
					</div>
				</div>
				<div class="col-md-3 col-sm-6">
					<div class="stat-card">
						<div class="stat-icon" style="background: rgba(37, 99, 235, 0.1);">
							<TrendingUp size="28" style="color: #2563EB;" aria-hidden="true" />
						</div>
						<div class="stat-content">
							<div class="stat-value">{data.stats.avgProgress}%</div>
							<div class="stat-label">Rata-rata Progress</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Filters & Search -->
			<div class="filters-section mb-4">
				<div class="row align-items-center g-3">
					<div class="col-md-6">
						<div class="filter-tabs">
							<button
								class="filter-tab {activeFilter === 'all' ? 'active' : ''}"
								onclick={() => handleFilterChange('all')}
							>
								Semua ({data.enrollments.length})
							</button>
							<button
								class="filter-tab {activeFilter === 'active' ? 'active' : ''}"
								onclick={() => handleFilterChange('active')}
							>
								Aktif ({data.stats.active})
							</button>
							<button
								class="filter-tab {activeFilter === 'completed' ? 'active' : ''}"
								onclick={() => handleFilterChange('completed')}
							>
								Selesai ({data.stats.completed})
							</button>
						</div>
					</div>
					<div class="col-md-6">
						<div class="search-box">
							<Search class="search-icon" size="18" aria-hidden="true" />
							<input
								type="text"
								class="form-control search-input"
								placeholder="Cari kursus..."
								oninput={handleSearch}
								bind:value={searchQuery}
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Courses Grid -->
			{#if filteredEnrollments.length === 0}
				<div class="text-center py-5">
					<X class="mb-3" size="64" style="color: #cbd5e1;" aria-hidden="true" />
					<h4 class="text-muted">Tidak ada kursus ditemukan</h4>
					<p class="text-muted">Coba ubah filter atau kata kunci pencarian</p>
				</div>
			{:else}
				<div class="row g-4">
					{#each filteredEnrollments as enrollment (enrollment.id)}
						<div class="col-lg-6">
							<div class="course-card">
								<div class="course-card-header">
									<div
										class="course-icon"
										style="background: {(enrollment.course_id as any).back_color ||
											'rgba(59, 130, 246, 0.1)'};"
									>
										{#if (enrollment.course_id as any).icon_name}
											{#if iconMap[(enrollment.course_id as any).icon_name]}
												<svelte:component this={iconMap[(enrollment.course_id as any).icon_name]} size="28" style="color: {(enrollment.course_id as any).icon_color || '#3B82F6'};" aria-hidden="true" />
											{:else}
												<GraduationCap size="28" style="color: {(enrollment.course_id as any).icon_color || '#3B82F6'};" aria-hidden="true" />
											{/if}
										{:else}
											<GraduationCap size="28" style="color: {(enrollment.course_id as any).icon_color || '#3B82F6'};" aria-hidden="true" />
										{/if}
									</div>
									<div class="flex-grow-1">
										<h3 class="course-title">{(enrollment.course_id as any).title}</h3>
										<div class="course-meta">
											{#if (enrollment.course_id as any).instructor_id}
												<span class="meta-item">
													<User size="14" aria-hidden="true" />
													{(enrollment.course_id as any).instructor_id.first_name || ''}
													{(enrollment.course_id as any).instructor_id.last_name || ''}
												</span>
											{/if}
											{#if (enrollment.course_id as any).category_id}
												<span class="meta-item">
													<Tag size="14" aria-hidden="true" />
													{(enrollment.course_id as any).category_id.name || 'Uncategorized'}
												</span>
											{/if}
											{#if (enrollment.course_id as any).difficulty_level}
												<span class="meta-item">
													<BarChart size="14" aria-hidden="true" />
													{(enrollment.course_id as any).difficulty_level === 'beginner'
														? 'Pemula'
														: (enrollment.course_id as any).difficulty_level === 'intermediate'
															? 'Menengah'
															: 'Lanjutan'}
												</span>
											{/if}
										</div>
									</div>
									<div class="status-badge status-{enrollment.status}">
										{enrollment.status === 'active'
											? 'Aktif'
											: enrollment.status === 'completed'
												? 'Selesai'
												: 'Dibatalkan'}
									</div>
								</div>

								<div class="course-card-body">
									<div class="progress-section">
										<div class="progress-header">
											<span class="progress-label">Progress Belajar</span>
											<span class="progress-value">{enrollment.progress}%</span>
										</div>
										<div class="progress-bar-container">
											<div
												class="progress-bar-fill"
												style="width: {enrollment.progress}%; background: {getProgressColor(
													enrollment.progress
												)};"
											></div>
										</div>
									</div>

									<div class="enrollment-info">
										<div class="info-item">
											<Info size="16" aria-hidden="true" />
											<span>Bergabung {formatDate(enrollment.enrolled_at)}</span>
										</div>
										{#if enrollment.completed_at}
											<div class="info-item">
												<CheckCircle size="16" aria-hidden="true" />
												<span>Selesai {formatDate(enrollment.completed_at)}</span>
											</div>
										{/if}
									</div>
								</div>

								<div class="course-card-footer">
									<button class="btn btn-outline-primary">
										<Info size="16" aria-hidden="true" />
										Detail Kursus
									</button>
									<button class="btn btn-primary gradient-btn">
										<Play size="16" aria-hidden="true" />
										{enrollment.progress === 0 ? 'Mulai Belajar' : 'Lanjutkan'}
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.my-courses-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8f9ff 0%, #fff 100%);
	}

	.hero-section {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		padding: 4rem 0 3rem;
		position: relative;
		overflow: hidden;
	}

	.hero-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
		opacity: 0.1;
	}

	.hero-content {
		position: relative;
		z-index: 1;
		text-align: center;
	}

	.hero-title {
		font-size: 3rem;
		font-weight: 800;
		color: white;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.hero-icon {
		font-size: 3.5rem;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.empty-icon {
		width: 120px;
		height: 120px;
		margin: 0 auto 2rem;
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
		border-radius: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.empty-icon svg {
		width: 64px;
		height: 64px;
	}

	.empty-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: #2d3748;
		margin-bottom: 1rem;
	}

	.empty-text {
		font-size: 1.125rem;
		color: #64748b;
		margin-bottom: 2rem;
	}

	/* Stats Cards */
	.stat-card {
		background: white;
		border-radius: 16px;
		padding: 1.5rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
		display: flex;
		align-items: center;
		gap: 1rem;
		transition: all 0.3s ease;
	}

	.stat-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
	}

	.stat-icon {
		width: 56px;
		height: 56px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stat-icon svg {
		width: 28px;
		height: 28px;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #2d3748;
		line-height: 1;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #64748b;
		margin-top: 0.25rem;
	}

	/* Filters */
	.filters-section {
		background: white;
		border-radius: 16px;
		padding: 1.5rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
	}

	.filter-tabs {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.filter-tab {
		padding: 0.75rem 1.5rem;
		border: 2px solid #e2e8f0;
		background: white;
		border-radius: 12px;
		font-weight: 600;
		color: #64748b;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.filter-tab:hover {
		border-color: #3b82f6;
		color: #3b82f6;
		background: rgba(59, 130, 246, 0.05);
	}

	.filter-tab.active {
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
		color: white;
		border-color: transparent;
	}

	.search-box {
		position: relative;
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: #94a3b8;
		pointer-events: none;
	}

	.search-input {
		padding: 0.75rem 1rem 0.75rem 3rem;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		font-size: 1rem;
		transition: all 0.3s ease;
	}

	.search-input:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
	}

	/* Course Cards */
	.course-card {
		background: white;
		border-radius: 20px;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
		transition: all 0.3s ease;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.course-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
	}

	.course-card-header {
		padding: 1.5rem;
		border-bottom: 1px solid #f1f5f9;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.course-icon {
		width: 56px;
		height: 56px;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.course-icon svg {
		width: 28px;
		height: 28px;
	}

	.course-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #2d3748;
		margin: 0 0 0.5rem 0;
		line-height: 1.4;
	}

	.course-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.875rem;
		color: #64748b;
	}

	.meta-item svg {
		width: 16px;
		height: 16px;
	}

	.status-badge {
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	.status-active {
		background: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
	}

	.status-completed {
		background: rgba(16, 185, 129, 0.1);
		color: #10b981;
	}

	.status-cancelled {
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
	}

	.course-card-body {
		padding: 1.5rem;
		flex-grow: 1;
	}

	.progress-section {
		margin-bottom: 1.5rem;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.progress-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #64748b;
	}

	.progress-value {
		font-size: 1.125rem;
		font-weight: 700;
		color: #2d3748;
	}

	.progress-bar-container {
		height: 8px;
		background: #e2e8f0;
		border-radius: 999px;
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		border-radius: 999px;
		transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.enrollment-info {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #64748b;
	}

	.info-item svg {
		width: 18px;
		height: 18px;
	}

	.course-card-footer {
		padding: 1.5rem;
		border-top: 1px solid #f1f5f9;
		display: flex;
		gap: 0.75rem;
	}

	.course-card-footer .btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.course-card-footer .btn svg {
		width: 20px;
		height: 20px;
	}

	.btn-outline-primary {
		border: 2px solid #3b82f6;
		color: #3b82f6;
		background: white;
	}

	.btn-outline-primary:hover {
		background: #3b82f6;
		color: white;
		transform: translateY(-2px);
	}

	.gradient-btn {
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
		border: none;
		color: white;
	}

	.gradient-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
	}

	svg {
		vertical-align: middle;
	}

	@media (max-width: 768px) {
		.hero-title {
			font-size: 2rem;
		}

		.hero-icon {
			font-size: 2.5rem;
		}

		.stat-value {
			font-size: 1.5rem;
		}

		.filter-tabs {
			width: 100%;
		}

		.filter-tab {
			flex: 1;
			text-align: center;
			padding: 0.625rem 1rem;
			font-size: 0.875rem;
		}

		.course-card-footer {
			flex-direction: column;
		}
	}
</style>
