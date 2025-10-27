<script lang="ts">
	import { onMount } from 'svelte';
	import { GraduationCap, ChevronDown, ChevronUp, Clock, CheckCircle } from 'lucide-svelte';
	import type { Course, Section, Lesson } from '$lib/types/course';
	import { getCourseProgress } from '$lib/services/progressService';
	import AnimatedProgressBar from '$lib/components/ui/AnimatedProgressBar.svelte';

	export let course: Course;
	export let sections: Section[];
	export let selectedLesson: Lesson | null;
	export let onSelectLesson: (lesson: Lesson) => void = () => {};

	let completedLessons: Set<string> = new Set();
	let progressPercentage = 0;

	onMount(async () => {
		await loadProgress();
	});

	async function loadProgress() {
		if (course.id) {
			const progress = await getCourseProgress(course.id);
			completedLessons = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));
			calculateProgress();
		}
	}

	function calculateProgress() {
		const totalLessons = sections.reduce((sum, section) => sum + (section.lessons?.length || 0), 0);
		if (totalLessons > 0) {
			progressPercentage = Math.round((completedLessons.size / totalLessons) * 100);
		}
	}

	function isLessonCompleted(lessonId: string): boolean {
		return completedLessons.has(lessonId);
	}

	function calculateSectionProgress(section: Section): number {
		if (!section.lessons || section.lessons.length === 0) return 0;
		const sectionLessons = section.lessons.filter(l => l.is_active);
		const completedInSection = sectionLessons.filter(l => completedLessons.has(l.id)).length;
		return Math.round((completedInSection / sectionLessons.length) * 100);
	}

	function formatDuration(minutes: number): string {
		if (!minutes) return '0m';
		return `${minutes}m`;
	}

	function handleLessonClick(lesson: Lesson, event: Event) {
		event.preventDefault();
		onSelectLesson(lesson);
	}

	// Expose refresh function for parent component
	export async function refreshProgress() {
		await loadProgress();
	}

	// Sort sections by order_index
	$: sortedSections = sections.sort((a, b) => a.order_index - b.order_index);
	$: totalLessons = sections.reduce((acc, section) => acc + (section.lessons?.length || 0), 0);
</script>

<div class="h-100 d-flex flex-column">
	<!-- Header Modern -->
	<div class="p-4 border-bottom bg-gradient-primary text-white">
		<div class="d-flex align-items-center mb-3">
			<GraduationCap size="24" class="me-3" aria-hidden="true" />
			<div class="flex-grow-1">
				<h6 class="mb-1 fw-bold">{course.title}</h6>
				<small class="opacity-75">
					{sections.length} section • {totalLessons} lessons
				</small>
			</div>
		</div>
		
		<!-- Enhanced Progress Section -->
		<div class="progress-section">
			<div class="d-flex justify-content-between align-items-center mb-2">
				<span class="small opacity-75">Course Progress</span>
				<span class="fw-bold">{progressPercentage}%</span>
			</div>
			
			<AnimatedProgressBar 
				progress={progressPercentage} 
				variant="success"
				size="md"
				animated={true}
				showPercentage={false}
			/>
			
			<div class="d-flex justify-content-between mt-2 small">
				<span class="opacity-75">{completedLessons.size} completed</span>
				<span class="opacity-75">{totalLessons - completedLessons.size} remaining</span>
			</div>
		</div>
	</div>

	<!-- Sections & Lessons Modern -->
	<div class="sidebar-content-area flex-grow-1 overflow-auto">
		<div class="accordion" id="sidebarAccordion">
			{#each sortedSections as section, index (section.id)}
				{#if section.is_active}
					<div class="accordion-item border-0 section-item">
						<h2 class="accordion-header">
							<button
								class="accordion-button section-button shadow-sm {index > 0
									? 'collapsed'
									: ''} rounded-0 border-bottom ps-2"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#collapse-{section.id}"
							>
								<div class="d-flex align-items-center w-100 me-3">
									<div class="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
										{#if index > 0}
											<ChevronDown size="20" class="sidebar-section-icon" aria-hidden="true" />
										{:else}
											<ChevronUp size="20" class="sidebar-section-icon" aria-hidden="true" />
										{/if}
									</div>
									<div class="flex-grow-1 text-start">
										<div class="fw-semibold sidebar-section-title small mb-1">{section.title}</div>
										<!-- Section Progress Bar -->
										<div class="section-progress-wrapper">
											<AnimatedProgressBar 
												progress={calculateSectionProgress(section)} 
												variant="primary"
												size="sm"
												animated={true}
												showPercentage={false}
											/>
										</div>
									</div>
									<div class="text-end">
										<span class="badge bg-primary rounded-pill mb-1">{section.lessons?.length || 0}</span>
										<div class="small sidebar-progress-text">{calculateSectionProgress(section)}%</div>
									</div>
								</div>
							</button>
						</h2>
						<div
							id="collapse-{section.id}"
							class="accordion-collapse collapse {index === 0 ? 'show' : ''} section-lessons"
							data-bs-parent="#sidebarAccordion"
						>
							<div class="accordion-body p-0">
								{#each section.lessons?.sort((a, b) => a.order_index - b.order_index) || [] as lesson (lesson.id)}
									{#if lesson.is_active}
										{@const completed = isLessonCompleted(lesson.id)}
										{@const isSelected = selectedLesson?.id === lesson.id}
										<!-- Lesson Item - Text-based content -->
										<button
											type="button"
											class="lesson-item d-flex align-items-center gap-3 py-3 px-3 text-decoration-none
                                                {isSelected ? 'active' : ''}
                                                {completed && !isSelected ? 'completed' : ''}"
											onclick={(e) => handleLessonClick(lesson, e)}
											aria-label={`Open lesson ${lesson.title}`}
										>
											<!-- Icon -->
											<div class="lesson-icon-wrapper">
												{#if completed}
													<CheckCircle size="20" class="lesson-status-icon" aria-hidden="true" />
												{:else}
													<Clock size="20" class="lesson-status-icon" aria-hidden="true" />
												{/if}
											</div>

											<!-- Content -->
											<div class="flex-grow-1 text-start">
												<div class="lesson-title">{lesson.title}</div>
												<div class="lesson-meta">
													<Clock size="14" aria-hidden="true" />
													<span>{formatDuration(lesson.estimated_duration)}</span>
												</div>
											</div>

											<!-- Status Badge (optional) -->
											{#if completed && !isSelected}
												<div class="lesson-badge">
													<CheckCircle size="16" aria-hidden="true" />
												</div>
											{/if}
										</button>
									{/if}
								{/each}
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<style>
	.accordion-button:not(.collapsed) {
		background-color: var(--theme-surface, #fff) !important;
		color: inherit;
		box-shadow: none;
		border-bottom: 1px solid var(--theme-border, #dee2e6) !important;
	}

	.accordion-button:focus {
		box-shadow: none;
		border-color: var(--theme-border, #dee2e6);
	}

	.accordion-body {
		padding: 0 !important;
	}

	/* Lesson Item - Modern Clean Design */
	.lesson-item {
		width: 100%;
		background: var(--theme-surface);
		color: var(--theme-text);
		border: none;
		border-left: 3px solid transparent;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		cursor: pointer;
		text-align: left;
	}

	/* Override Bootstrap button styles for lesson items */
	.lesson-item:focus,
	.lesson-item:focus-visible {
		outline: none;
		box-shadow: none;
	}

	.lesson-item:hover {
		background-color: var(--theme-surface-hover) !important;
		border-left-color: var(--primary-color, #3b82f6);
		transform: translateX(2px);
	}

	/* Active/Selected Lesson - Use higher specificity and force override */
	button.lesson-item.active {
		background: linear-gradient(135deg, #475569 0%, #334155 100%) !important;
		color: #ffffff !important;
		border-left-color: #1e293b !important;
		box-shadow: 0 2px 8px rgba(51, 65, 85, 0.25);
	}

	/* Force white text for all elements inside active lesson button */
	button.lesson-item.active * {
		color: #ffffff !important;
	}

	/* Make lesson meta slightly transparent for active lessons */
	button.lesson-item.active .lesson-meta,
	button.lesson-item.active .lesson-meta * {
		color: rgba(255, 255, 255, 0.85) !important;
	}

	button.lesson-item.active:hover {
		transform: none;
		/* Keep the same styling when hovering over active lesson */
		background: linear-gradient(135deg, #475569 0%, #334155 100%) !important;
		color: #ffffff !important;
	}

	/* Completed Lesson */
	.lesson-item.completed {
		background-color: var(--badge-success-bg, #f0fdf4) !important;
	}

	.lesson-item.completed:hover {
		background-color: var(--badge-success-bg-alt, #dcfce7) !important;
	}

	/* Icon Wrapper */
	.lesson-icon-wrapper {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		background: var(--theme-bg-tertiary, #f1f5f9);
		transition: all 0.2s ease;
	}

	.lesson-item:hover .lesson-icon-wrapper {
		background: var(--theme-border, #e2e8f0);
	}

	.lesson-item.active .lesson-icon-wrapper {
		background: rgba(255, 255, 255, 0.2);
	}

	.lesson-item.completed .lesson-icon-wrapper {
		background: var(--badge-success-border, #d1fae5);
	}

	/* Icons */
	.lesson-status-icon {
		font-size: 1.25rem !important;
		color: var(--theme-text-muted, #64748b);
		transition: all 0.2s ease;
	}

	.lesson-item:hover .lesson-status-icon {
		color: var(--primary-color, #3b82f6);
	}

	.lesson-item.active .lesson-status-icon {
		color: var(--theme-text-inverse, white) !important;
	}

	.lesson-item.completed .lesson-status-icon {
		color: var(--badge-success-icon, #10b981) !important;
	}

	/* Lesson Title */
	.lesson-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: #1e293b; /* Dark text for better contrast on light sidebar */
		line-height: 1.4;
		margin-bottom: 0.25rem;
	}

	/* Dark mode override for lesson title */
	:global([data-theme="dark"]) .lesson-title {
		color: #f1f5f9 !important;
	}

	/* Lesson Meta (duration) */
	.lesson-meta {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: var(--theme-text-muted, #64748b); /* Use theme variable for better contrast */
	}

	/* Dark mode override for lesson meta */
	:global([data-theme="dark"]) .lesson-meta {
		color: #94a3b8 !important;
	}

	/* Sidebar-specific text classes for better contrast */
	.sidebar-section-title {
		color: #1e293b !important; /* Dark text for light sidebar */
		font-weight: 600;
	}

	.sidebar-section-icon {
		color: #3b82f6 !important; /* Blue icon color */
	}

	.sidebar-progress-text {
		color: #64748b !important; /* Muted but readable text */
	}

	/* Dark mode overrides for sidebar text */
	:global([data-theme="dark"]) .sidebar-section-title {
		color: #f1f5f9 !important;
	}

	:global([data-theme="dark"]) .sidebar-section-icon {
		color: #60a5fa !important;
	}

	:global([data-theme="dark"]) .sidebar-progress-text {
		color: #94a3b8 !important;
	}

	.lesson-meta svg {
		width: 0.875rem;
		height: 0.875rem;
	}

	/* Completion Badge */
	.lesson-badge {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--badge-success-icon, #10b981);
		border-radius: 50%;
	}

	.lesson-badge svg {
		width: 1rem;
		height: 1rem;
		color: var(--theme-text-inverse, white);
	}

	.bg-gradient-primary {
		background: linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, var(--primary-color, #1d4ed8) 100%);
	}

	/* Dark Mode Support for Sidebar */
	.sidebar-content-area {
		background: var(--learning-sidebar-bg);
	}

	.section-item {
		background: transparent;
	}

	.section-button {
		background: var(--theme-surface) !important;
		color: var(--theme-text) !important;
		border-color: var(--theme-border) !important;
	}

	.section-lessons {
		background: var(--theme-surface);
		color: var(--theme-text);
	}

	/* Enhanced Progress Styles */
	.progress-section {
		margin-top: 0.5rem;
	}

	.section-progress-wrapper {
		max-width: 120px;
	}

	/* Make sure progress bars have the right styling within the white background */
	:global(.section-progress-wrapper .progress-track) {
		background-color: var(--learning-progress-track, #f1f5f9) !important;
		border-color: var(--theme-border, #e2e8f0) !important;
	}
</style>
