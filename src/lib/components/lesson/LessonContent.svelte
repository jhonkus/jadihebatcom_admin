<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Markdown from './Markdown.svelte';
	import AnimatedProgressBar from '$lib/components/ui/AnimatedProgressBar.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import type { Course, Lesson, Section } from '$lib/types/course';
	import {
		markLessonComplete,
		markLessonIncomplete,
		isLessonCompleted
	} from '$lib/services/progressService';
	import { fetchCurrentUser } from '$lib/utils/auth';
	import { ArrowLeft, Clock, CheckCircle, FileText, Info } from 'lucide-svelte';

	export let course: Course;
	export let selectedLesson: Lesson;
	export let sections: Section[];
	export let onProgressUpdate: () => void = () => {}; // Callback when progress changes
	export let hasQuiz: boolean = false;

	let isCompleted = false;
	let isUpdating = false;
	let user: { id: string } | null = null;
	let bestScore: { score: number; passed: boolean } | null = null;
	let loadingBestScore = false;
	
	// Reading progress tracking
	let readingProgress = 0;
	let contentContainer: HTMLElement;
	let scrollTimeout: ReturnType<typeof setTimeout>;
	onMount(async () => {
		user = await fetchCurrentUser();
		// Reactive statement will handle initial check
		setupScrollTracking();
	});

	onDestroy(() => {
		if (scrollTimeout) {
			clearTimeout(scrollTimeout);
		}
	});

	function setupScrollTracking() {
		if (!contentContainer) return;
		
		const handleScroll = () => {
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}
			
			scrollTimeout = setTimeout(() => {
				calculateReadingProgress();
			}, 100);
		};

		contentContainer.addEventListener('scroll', handleScroll);
		
		// Initial calculation
		setTimeout(() => calculateReadingProgress(), 500);
		
		return () => {
			contentContainer?.removeEventListener('scroll', handleScroll);
		};
	}

	function calculateReadingProgress() {
		if (!contentContainer) return;
		
		const scrollTop = contentContainer.scrollTop;
		const scrollHeight = contentContainer.scrollHeight;
		const clientHeight = contentContainer.clientHeight;
		
		if (scrollHeight <= clientHeight) {
			readingProgress = 100;
			return;
		}
		
		const maxScroll = scrollHeight - clientHeight;
		const progress = Math.min((scrollTop / maxScroll) * 100, 100);
		const newProgress = Math.round(progress);
		
		// Trigger celebration effect when reaching 100% for the first time
		if (newProgress === 100 && readingProgress < 100) {
			triggerCelebration();
		}
		
		readingProgress = newProgress;
	}

	function triggerCelebration() {
		// Add a subtle visual celebration
		const progressContainer = document.querySelector('.reading-progress-container');
		if (progressContainer) {
			progressContainer.classList.add('celebration');
			setTimeout(() => {
				progressContainer.classList.remove('celebration');
			}, 1000);
		}
	}

	async function toggleLessonCompletion() {
		if (!user || isUpdating) return;

		isUpdating = true;

		const result = isCompleted
			? await markLessonIncomplete(selectedLesson.id, course.id)
			: await markLessonComplete(selectedLesson.id, course.id);

		if (result.success) {
			isCompleted = !isCompleted;
			onProgressUpdate(); // Notify parent to refresh progress
		} else {
			alert(result.error || 'Failed to update progress');
		}

		isUpdating = false;
	}

	// Reactive updates when lesson changes - properly handle async
	$: if (selectedLesson && user) {
		(async () => {
			isCompleted = await isLessonCompleted(selectedLesson.id);
		})();
	}

	// Fetch best quiz score when lesson or user changes
	$: if (selectedLesson && user) {
		(async () => {
			loadingBestScore = true;
			try {
				const response = await fetch('/api/quiz/best-score', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ lessonId: selectedLesson.id })
				});
				const data = await response.json();

				if (data.success) {
					bestScore = data.bestScore;
				} else {
					console.error('Failed to fetch best score:', data.error);
					bestScore = null;
				}
			} catch (error) {
				console.error('Error fetching best score:', error);
				bestScore = null;
			} finally {
				loadingBestScore = false;
			}
		})();
	}

	$: currentSection = sections.find((section) =>
		section.lessons?.some((lesson) => lesson.id === selectedLesson.id)
	);
</script>

<div class="lesson-page h-100 d-flex flex-column">
	<!-- Header -->
	<div class="lesson-header border-bottom lesson-header-bg shadow-sm">
		<!-- Quiz Best Score Display - Only show if quiz exists -->
		{#if loadingBestScore}
			<div class="quiz-score-loading mb-4">
				<div class="loading-line"></div>
			</div>
		{/if}

		<!-- Metadata Row with Action Button -->
		<div class="lesson-controls-group">
			<!-- Back Button -->
			<a href="/my-courses" class="back-btn" title="Kembali ke Kursus Saya">
				<ArrowLeft size="20" class="me-1" aria-hidden="true" />
				<span class="d-none d-sm-inline">Kembali</span>
			</a>

			<!-- Duration Badge -->
			{#if selectedLesson.estimated_duration}
				<div class="lesson-meta-badge duration-badge">
					<Clock size="18" class="me-2" aria-hidden="true" />
					<span class="fw-semibold">{selectedLesson.estimated_duration} menit</span>
				</div>
			{/if}

			<!-- Completion Status Badge -->
			{#if isCompleted}
				<div class="lesson-meta-badge completed-badge">
					<CheckCircle size="18" class="me-2" aria-hidden="true" />
					<span class="fw-semibold">Selesai</span>
				</div>
			{/if}

			<!-- Quiz Button and Score - Only show if quiz exists -->
			{#if hasQuiz}
				<!-- Compact Quiz Score Badge - Only show if we have a score and not loading -->
				{#if bestScore && !loadingBestScore}
					<div class="compact-quiz-score {bestScore.passed ? 'passed' : 'failed'}">
						<FileText size="18" class="score-icon" aria-hidden="true" />
						<span class="score-text">{bestScore.score}%</span>
					</div>
				{/if}
				
				<a
					href="/learning/{course.slug}/{selectedLesson.slug}/quiz"
					class="btn btn-warning rounded-pill px-4 flex-shrink-0"
				>
					<FileText size="16" class="me-2" aria-hidden="true" />
					Kuis
				</a>
			{/if}

			<!-- Mark Complete Button -->
			<button
				class="btn {isCompleted
					? 'btn-outline-success'
					: 'btn-success'} rounded-pill px-4 flex-shrink-0"
				onclick={toggleLessonCompletion}
				disabled={isUpdating}
			>
				{#if isUpdating}
					<div class="button-loading-dots me-2"></div>
					Menyimpan...
					{:else if isCompleted}
					<CheckCircle size="16" class="me-2" aria-hidden="true" />
					Tandai Belum Selesai
				{:else}
					<CheckCircle size="16" class="me-2" aria-hidden="true" />
					Tandai Selesai
				{/if}
			</button>

			<!-- Theme Toggle -->
			<ThemeToggle size="md" variant="switch" />
		</div>
	</div>

	<!-- Reading Progress Indicator -->
	<div class="reading-progress-container">
		<AnimatedProgressBar 
			progress={readingProgress} 
			variant="info"
			size="sm"
			animated={true}
			showPercentage={false}
			label="Reading Progress"
			showLabel={false}
		/>
	</div>

	<!-- Lesson Content -->
	<div class="lesson-content-container flex-grow-1 overflow-auto" bind:this={contentContainer}>
		<div class="lesson-content-wrapper">
			{#if selectedLesson.content}
				<div class="lesson-content">
					<Markdown content={selectedLesson.content} />
				</div>
			{:else}
			<div class="alert alert-info border-0 shadow-sm mt-4">
				<div class="d-flex align-items-center">
					<Info class="me-3 theme-text-info" size="24" aria-hidden="true" />
					<div>
						<h6 class="alert-heading mb-1">Konten Sedang Dipersiapkan</h6>
						<p class="mb-0">Lesson ini sedang dalam pengembangan dan akan segera tersedia.</p>
					</div>
				</div>
			</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Previous styles remain the same */
	.lesson-page {
		background-color: var(--learning-bg);
		color: var(--theme-text);
	}

	.lesson-header,
	.lesson-content-wrapper {
		padding-left: 2rem;
		padding-right: 2rem;
	}

	@media (min-width: 992px) {
		.lesson-header,
		.lesson-content-wrapper {
			padding-left: 5rem;
			padding-right: 5rem;
		}
	}

	.lesson-header {
		padding-top: 5px;
		padding-bottom: 5px;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.lesson-header-bg {
		background-color: var(--learning-header-bg, rgba(255, 255, 255, 0.95));
		backdrop-filter: blur(10px);
		border-color: var(--theme-border, #dee2e6);
	}

	/* Lesson Controls Group - Centered */
	.lesson-controls-group {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
		padding: 0.75rem 0;
	}

	/* Back Button */
	.back-btn {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1rem;
		background: var(--theme-border-secondary, #6c757d);
		color: var(--theme-text-inverse, white);
		text-decoration: none;
		border-radius: 12px;
		font-size: 0.95rem;
		font-weight: 500;
		transition: all 0.2s ease;
		gap: 0.25rem;
	}

	.back-btn:hover {
		background: var(--theme-border-hover, #5a6268);
		color: var(--theme-text-inverse, white);
		text-decoration: none;
		transform: translateY(-1px);
	}

	/* Reading Progress Indicator */
	.reading-progress-container {
		position: sticky;
		top: 0;
		z-index: 1000;
		background: var(--learning-header-bg);
		backdrop-filter: blur(10px);
		padding: 0.5rem 1rem;
		border-bottom: 1px solid var(--theme-border);
		margin-bottom: 0.5rem;
		transition: all 0.3s ease;
	}

	:global(.reading-progress-container.celebration) {
		background: rgba(16, 185, 129, 0.1);
		border-bottom-color: rgba(16, 185, 129, 0.3);
		animation: celebrateGlow 1s ease-in-out;
	}

	@keyframes celebrateGlow {
		0%, 100% {
			box-shadow: 0 0 0 rgba(16, 185, 129, 0);
		}
		50% {
			box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
		}
	}

	/* Lesson Content Container */
	.lesson-content-container {
		background: var(--learning-content-bg, #ffffff);
		color: var(--theme-text, #1e293b);
	}

	.lesson-content-wrapper {
		padding-top: 5px;
		padding-bottom: 5px;
		display: flex;
		justify-content: center;
		background: var(--learning-content-bg, #ffffff);
		color: var(--theme-text, #1e293b);
	}

	.lesson-content {
		max-width: 960px;
		width: 100%;
		text-align: left;
		color: var(--theme-text, #1e293b);
		font-size: 1rem;
		line-height: 1.85;
		letter-spacing: -0.01em;
	}

	/* Ensure all text elements inherit theme colors */
	.lesson-content :global(*) {
		color: inherit;
	}

	.lesson-content :global(p),
	.lesson-content :global(div),
	.lesson-content :global(span),
	.lesson-content :global(li),
	.lesson-content :global(td) {
		color: var(--theme-text, #1e293b) !important;
	}

	.lesson-content :global(h1),
	.lesson-content :global(h2),
	.lesson-content :global(h3),
	.lesson-content :global(h4),
	.lesson-content :global(h5),
	.lesson-content :global(h6) {
		color: var(--theme-text, #1e293b) !important;
	}

	/* Ensure markdown content inherits theme colors */
	.lesson-content :global(.markdown-content) {
		color: var(--theme-text, #1e293b) !important;
	}

	.lesson-content :global(.markdown-content *) {
		color: inherit !important;
	}

	/* Override Bootstrap font weight classes to ensure theme color inheritance */
	.fw-semibold {
		color: inherit !important;
	}

	/* Override any remaining Bootstrap text classes */
	:global(.lesson-content .fw-semibold),
	:global(.lesson-content .fw-bold),
	:global(.lesson-content .text-*) {
		color: var(--theme-text, #1e293b) !important;
	}

	.btn {
		transition: all 0.2s ease-in-out;
	}

	.btn:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	svg {
		width: 20px;
		height: 20px;
		vertical-align: middle;
	}

	/* Lesson Metadata Badges - More Prominent */
	.lesson-meta-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1rem;
		border-radius: 12px;
		font-size: 0.95rem;
		transition: all 0.2s ease;
	}

	.duration-badge {
		background: linear-gradient(135deg, var(--badge-info-bg, #eff6ff) 0%, var(--badge-info-bg-alt, #dbeafe) 100%);
		color: var(--badge-info-text, #1e40af);
		border: 1px solid var(--badge-info-border, #bfdbfe);
	}

	.duration-badge svg {
		color: var(--badge-info-icon, #3b82f6);
		width: 1.25rem;
		height: 1.25rem;
	}

	.completed-badge {
		background: linear-gradient(135deg, var(--badge-success-bg, #f0fdf4) 0%, var(--badge-success-bg-alt, #dcfce7) 100%);
		color: var(--badge-success-text, #166534);
		border: 1px solid var(--badge-success-border, #bbf7d0);
	}

	.completed-badge svg {
		color: var(--badge-success-icon, #10b981);
		width: 1.25rem;
		height: 1.25rem;
	}

	/* Quiz Best Score Display - Compact version */
	.compact-quiz-score {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		border-radius: 25px;
		background: var(--theme-surface, white);
		border: 2px solid var(--theme-border, #e2e8f0);
		font-weight: 600;
		font-size: 1rem;
		min-height: 42px; /* Match button height */
		color: var(--theme-text, #1e293b);
	}

	.compact-quiz-score.passed {
		border-color: var(--badge-success-icon, #10b981);
		background: var(--badge-success-bg, #f0fdf4);
		color: var(--badge-success-text, #065f46);
	}

	.compact-quiz-score.failed {
		border-color: var(--badge-error-icon, #ef4444);
		background: var(--badge-error-bg, #fef2f2);
		color: var(--badge-error-text, #991b1b);
	}

	.compact-quiz-score .score-icon {
		font-size: 1.25rem;
	}

	.compact-quiz-score.passed .score-icon {
		color: var(--badge-success-icon, #10b981);
	}

	.compact-quiz-score.failed .score-icon {
		color: var(--badge-error-icon, #ef4444);
	}

	.score-text {
		font-weight: 700;
		line-height: 1;
		font-size: 1rem;
	}

	.quiz-score-loading {
		height: 4px;
		background: var(--theme-bg-tertiary, #f1f5f9);
		border-radius: 2px;
		overflow: hidden;
		margin: 0.5rem 0;
	}

	.loading-line {
		height: 100%;
		background: linear-gradient(90deg, var(--primary-color, #3b82f6) 0%, var(--primary-color, #1d4ed8) 50%, var(--primary-color, #3b82f6) 100%);
		background-size: 200% 100%;
		animation: loading-slide 1.5s ease-in-out infinite;
		border-radius: 2px;
	}

	@keyframes loading-slide {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	/* Button loading dots */
	.button-loading-dots {
		width: 20px;
		height: 4px;
		background: currentColor;
		border-radius: 2px;
		opacity: 0.6;
		animation: button-loading 1.2s ease-in-out infinite;
	}

	@keyframes button-loading {
		0%, 20% {
			transform: scaleX(0.3);
		}
		50% {
			transform: scaleX(1);
		}
		80%, 100% {
			transform: scaleX(0.3);
		}
	}

	/* Theme classes */
	.theme-text-info {
		color: var(--badge-info-icon, #3b82f6) !important;
	}

	/* Bootstrap Alert Theme Overrides */
	.alert-info {
		background-color: var(--badge-info-bg, #eff6ff) !important;
		border-color: var(--badge-info-border, #bfdbfe) !important;
		color: var(--badge-info-text, #1e40af) !important;
	}

	.alert-heading {
		color: var(--theme-text, #1e293b) !important;
	}

	.alert p {
		color: var(--theme-text-secondary, #475569) !important;
	}

	/* Bootstrap Button Theme Overrides */
	.btn-warning {
		background-color: var(--bs-warning, #ffc107) !important;
		border-color: var(--bs-warning, #ffc107) !important;
		color: var(--theme-text-inverse, #000) !important;
	}

	.btn-success {
		background-color: var(--badge-success-icon, #10b981) !important;
		border-color: var(--badge-success-icon, #10b981) !important;
		color: var(--theme-text-inverse, white) !important;
	}

	.btn-outline-success {
		border-color: var(--badge-success-icon, #10b981) !important;
		color: var(--badge-success-icon, #10b981) !important;
		background-color: transparent !important;
	}

	.btn-outline-success:hover {
		background-color: var(--badge-success-icon, #10b981) !important;
		color: var(--theme-text-inverse, white) !important;
	}

	/* Responsive adjustments */
	@media (max-width: 767.98px) {
		.lesson-controls-group {
			gap: 0.75rem;
			padding: 0.5rem 0;
		}

		.btn.rounded-pill {
			font-size: 0.85rem;
			padding: 0.5rem 1rem !important;
		}

		.lesson-meta-badge {
			font-size: 0.85rem;
			padding: 0.4rem 0.8rem;
		}
	}
</style>
