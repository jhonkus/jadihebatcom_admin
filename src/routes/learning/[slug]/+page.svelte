<!-- src/routes/learning/[slug]/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import type { Course, Section, Lesson } from '$lib/types/course';
	import LessonSidebar from '$lib/components/lesson/LessonSidebar.svelte';
	import LessonContent from '$lib/components/lesson/LessonContent.svelte';
	import { AlertCircle, ArrowLeft, RefreshCw, BookOpen, List } from 'lucide-svelte';

	// HANYA GANTI INI: terima data dari server, bukan fetch sendiri
	export let data: PageData;

	// Extract data (semua logic tetap sama)
	let course: Course | null = data.course;
	let sections: Section[] = data.sections;
	let error: string | null = data.error || null;
	// let isEnrolled = data.isEnrolled;
	let selectedLesson: Lesson | null = data.selectedLesson;
	let hasQuiz = data.hasQuiz;

	// State untuk interactivity (TETAP SAMA)
	let contentLoading = false;
	let lessonSidebarCollapsed = false;
	let sidebarComponent: any;

	// Semua function TETAP SAMA seperti versi CSR
	async function handleSelectLesson(lesson: Lesson) {
		contentLoading = true;
		selectedLesson = lesson;

		// Check if the new lesson has a quiz
		try {
			const response = await fetch('/api/quiz/exists', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lessonId: lesson.id })
			});
			if (response.ok) {
				const result = await response.json();
				hasQuiz = result.quizExists;
			} else {
				hasQuiz = false; // Assume no quiz on error
			}
		} catch {
			hasQuiz = false;
		}

		contentLoading = false;

		// For mobile: hide the offcanvas sidebar after selection
		if (typeof window !== 'undefined') {
			const offcanvasElement = document.getElementById('mobileLessonSidebar');
			if (offcanvasElement) {
				const bsOffcanvas = (window as any).bootstrap?.Offcanvas?.getInstance(offcanvasElement);
				if (bsOffcanvas) {
					bsOffcanvas.hide();
				}
			}
		}
	}

	function toggleLessonSidebar() {
		lessonSidebarCollapsed = !lessonSidebarCollapsed;
	}

	async function handleProgressUpdate() {
		if (sidebarComponent?.refreshProgress) {
			await sidebarComponent.refreshProgress();
		}
	}
</script>

<svelte:head>
	<title>{course ? `${course.title} - Belajar` : 'Loading...'} | jadihebat</title>
</svelte:head>

{#if error}
	<div class="error-screen">
		<div class="error-content">
			<AlertCircle class="error-icon" size="80" aria-hidden="true" />
			<h3 class="mb-3">Oops! Terjadi Kesalahan</h3>
			<p class="theme-text-muted mb-4">{error}</p>
			<div class="d-flex gap-3 justify-content-center">
				<a href="/my-courses" class="btn btn-outline-primary">
					<ArrowLeft class="me-2" size="18" aria-hidden="true" />
					Kembali ke Kursus Saya
				</a>
				<button class="btn btn-primary" onclick={() => window.location.reload()}>
					<RefreshCw class="me-2" size="18" aria-hidden="true" />
					Muat Ulang
				</button>
			</div>
		</div>
	</div>
{:else if course}
	<!-- Focused Learning Layout -->
	<div class="focused-learning">
		<!-- Learning Content Area -->
		<div class="learning-content">
			<div class="learning-layout {lessonSidebarCollapsed ? 'sidebar-hidden' : ''}">
				<!-- Main Lesson Content - Now on the left -->
				<main class="lesson-main">
					{#if contentLoading}
						<div class="content-loading">
							<div class="spinner-border text-primary mb-3" role="status">
								<span class="visually-hidden">Loading...</span>
							</div>
							<p class="theme-text-muted">Memuat konten lesson...</p>
						</div>
					{:else if selectedLesson}
						<LessonContent
							{course}
							{selectedLesson}
							{sections}
							{hasQuiz}
							onProgressUpdate={handleProgressUpdate}
						/>
					{:else}
						<div class="empty-lesson">
							<BookOpen class="empty-icon" size="80" aria-hidden="true" />
							<h4 class="mb-3">Pilih Lesson untuk Mulai Belajar</h4>
							<p class="theme-text-muted mb-4">
								Pilih lesson dari sidebar untuk melihat konten pembelajaran
							</p>
							<button
								class="btn btn-primary d-lg-none"
								type="button"
								data-bs-toggle="offcanvas"
								data-bs-target="#mobileLessonSidebar"
							>
								<List class="me-2" size="18" aria-hidden="true" />
								Lihat Daftar Lesson
							</button>
						</div>
					{/if}
				</main>

				<!-- Lesson Sidebar - Now on the right -->
				<aside class="lesson-sidebar d-none d-lg-block">
					<div class="sidebar-content">
						<LessonSidebar
							bind:this={sidebarComponent}
							{course}
							{sections}
							{selectedLesson}
							onSelectLesson={handleSelectLesson}
						/>
					</div>
				</aside>
			</div>
		</div>
	</div>

	<!-- Mobile Lesson Sidebar Offcanvas -->
	<div
		class="offcanvas offcanvas-start"
		tabindex="-1"
		id="mobileLessonSidebar"
		aria-labelledby="mobileLessonSidebarLabel"
	>
		<div class="offcanvas-header bg-gradient-primary text-white">
			<div>
				<h5 class="offcanvas-title fw-bold" id="mobileLessonSidebarLabel">Lessons</h5>
				<small class="opacity-75">
					{sections.length} Section • 
					{sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)} Lessons
				</small>
			</div>
			<button
				type="button"
				class="btn-close btn-close-white"
				data-bs-dismiss="offcanvas"
				aria-label="Close"
			></button>
		</div>
		<div class="offcanvas-body p-0">
			<LessonSidebar {course} {sections} {selectedLesson} onSelectLesson={handleSelectLesson} />
		</div>
	</div>
{/if}

<style>
	/* Focused Learning Layout */
	.focused-learning {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--learning-bg);
		color: var(--theme-text);
		transition: background-color 0.3s ease, color 0.3s ease;
	}

	/* Error Screen */
	.error-screen {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--theme-bg);
		padding: 2rem;
	}

	.error-content {
		text-align: center;
		padding: 3rem;
		background: var(--theme-surface);
		border-radius: 20px;
		box-shadow: 0 10px 40px var(--theme-shadow-lg);
		max-width: 500px;
		width: 100%;
		color: var(--theme-text);
	}

	.error-icon {
		width: 80px;
		height: 80px;
		color: #dc3545;
		margin-bottom: 1.5rem;
	}

	/* Learning Layout */
	.learning-content {
		flex: 1;
		overflow: hidden;
		background: var(--learning-bg);
	}

	.learning-layout {
		display: grid;
		grid-template-columns: 1fr 350px;
		height: 100vh; /* Full viewport height since no header */
		transition: grid-template-columns 0.3s ease;
	}

	.learning-layout.sidebar-hidden {
		grid-template-columns: 1fr 0;
	}

	/* Lesson Sidebar - Now on the right */
	.lesson-sidebar {
		background: var(--learning-sidebar-bg);
		border-left: 1px solid var(--theme-border);
		overflow: hidden;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		box-shadow: -1px 0 3px var(--theme-shadow);
	}

	.sidebar-hidden .lesson-sidebar {
		width: 0;
		border-left: none;
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		width: 350px;
	}

	/* Lesson Main Content */
	.lesson-main {
		background: var(--learning-content-bg);
		overflow: auto;
		position: relative;
		color: var(--theme-text);
	}

	.content-loading,
	.empty-lesson {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 3rem 2rem;
	}

	.empty-icon {
		width: 80px;
		height: 80px;
		color: #3b82f6;
		margin-bottom: 1rem;
		opacity: 0.8;
	}

	/* Mobile Offcanvas */
	.offcanvas {
		width: 350px !important;
	}

	.bg-gradient-primary {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
	}

	/* Responsive Design */
	@media (max-width: 991.98px) {
		.learning-layout {
			grid-template-columns: 1fr;
		}

		.offcanvas {
			width: 320px !important;
		}
	}

	@media (max-width: 767.98px) {
		.offcanvas {
			width: 300px !important;
		}
	}

	/* Scrollbar Styles */
	.sidebar-content::-webkit-scrollbar,
	.lesson-main::-webkit-scrollbar {
		width: 4px;
	}

	.sidebar-content::-webkit-scrollbar-track,
	.lesson-main::-webkit-scrollbar-track {
		background: var(--theme-bg-secondary, #f8fafc);
	}

	.sidebar-content::-webkit-scrollbar-thumb,
	.lesson-main::-webkit-scrollbar-thumb {
		background: var(--theme-border-secondary, #cbd5e1);
		border-radius: 2px;
	}

	.sidebar-content::-webkit-scrollbar-thumb:hover,
	.lesson-main::-webkit-scrollbar-thumb:hover {
		background: var(--theme-border-hover, #94a3b8);
	}

	svg {
		vertical-align: middle;
	}

	/* Theme text muted class */
	.theme-text-muted {
		color: var(--theme-text-muted) !important;
	}

	/* Smooth transitions */
	* {
		transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
	}
</style>
