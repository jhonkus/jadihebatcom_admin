<script lang="ts">
	import { onMount } from 'svelte';
	import { BookOpen, FileText, Clock, Lock, Info } from 'lucide-svelte';
	import type { Section } from '$lib/types/course';

	export let sections: Section[] = [];

	let activeSectionId: string | null = null;

	onMount(() => {
		const savedId = localStorage.getItem('activeSectionId');
		if (savedId) {
			activeSectionId = savedId;
		}
	});

	function toggleSection(id: string) {
		if (activeSectionId === id) {
			activeSectionId = null;
			localStorage.removeItem('activeSectionId');
		} else {
			activeSectionId = id;
			localStorage.setItem('activeSectionId', id);
		}
	}

	// Convert total minutes to hr | min display
	function formatDuration(minutes: number): string {
		const h = Math.floor(minutes / 60);
		const m = Math.round(minutes % 60);
		const parts = [];
		if (h) parts.push(`${h} hr`);
		if (m) parts.push(`${m} min`);
		return parts.join(' | ') || '—';
	}

	// Sum all estimated_duration values for section
	function totalDuration(section: Section): string {
		if (!section.lessons || section.lessons.length === 0) return '—';
		const totalMinutes = section.lessons.reduce(
			(sum, lesson) => sum + (lesson.estimated_duration || 0),
			0
		);
		return formatDuration(totalMinutes);
	}
</script>

<div class="course-content-container">
	<h3 class="bd-course-details-content-title mb-4">Course Content</h3>

	<div class="bd-course-curriculum-accordion">
		<div
			class="accordion-common-style accordion-transparent accordion-sl-number accordion-item-margin"
		>
			<div class="accordion" id="accordionCourseContent">
				{#each sections as section (section.id)}
					<div class="accordion-item">
						<h2 class="accordion-header" id={`heading${section.id}`}>
							<button
								class="accordion-button {activeSectionId === section.id ? '' : 'collapsed'}"
								type="button"
								onclick={() => toggleSection(section.id)}
								data-bs-toggle="collapse"
								data-bs-target={`#collapse${section.id}`}
								aria-expanded={activeSectionId === section.id ? 'true' : 'false'}
								aria-controls={`collapse${section.id}`}
							>
								<span
									class="accordion-button-title d-flex justify-content-between w-100 me-3 align-items-center"
								>
									<div class="d-flex align-items-center gap-2">
										<BookOpen size="20" class="section-icon" aria-hidden="true" />
										<span>{section.title}</span>
									</div>
									<span class="lesson-count-badge">
										{section.lessons?.length || 0} lessons | {totalDuration(section)}
									</span>
								</span>
							</button>
						</h2>

						<div
							id={`collapse${section.id}`}
							class="accordion-collapse collapse {activeSectionId === section.id ? 'show' : ''}"
							aria-labelledby={`heading${section.id}`}
							data-bs-parent="#accordionCourseContent"
						>
							<div class="accordion-body">
								{#if section.lessons && section.lessons.length > 0}
									<div class="lessons-list">
										{#each section.lessons as lesson, index (lesson.id)}
											<button
												type="button"
												class="lesson-item d-flex justify-content-between align-items-center {index ===
												section.lessons.length - 1
													? 'last-lesson'
													: ''}"
												aria-label={`Open lesson ${lesson.title}`}
											>
												<div class="lesson-info d-flex align-items-center gap-3">
													<!-- Lesson icon -->
													<FileText size="20" class="lesson-icon" aria-hidden="true" />
													<p class="lesson-title mb-0">{lesson.title}</p>
												</div>
												<div class="lesson-meta d-flex align-items-center gap-3">
													<div class="duration-badge">
														<Clock size="16" class="duration-icon" aria-hidden="true" />
														<span class="duration-text">
															{lesson.estimated_duration ? `${lesson.estimated_duration} min` : '—'}
														</span>
													</div>
													<span class="status">
														<Lock size="16" class="lock-icon" aria-hidden="true" />
													</span>
												</div>
											</button>
										{/each}
									</div>
								{:else}
									<div class="no-lessons-message">
										<Info size="20" aria-hidden="true" />
										<p class="mb-0">Belum ada pelajaran tersedia untuk bagian ini.</p>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.section-icon {
		background: linear-gradient(45deg, #3b82f6, #2563eb);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
	}

	.lesson-icon {
		background: linear-gradient(45deg, #2563eb, #3b82f6);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
	}

	.accordion-button {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		font-weight: 600;
	}

	.accordion-button:not(.collapsed) {
		background: linear-gradient(135deg, #eff6ff, #dbeafe);
		color: #1e293b;
		border-color: #bfdbfe;
	}

	.lesson-count-badge {
		font-size: 0.875rem;
		font-weight: 500;
		color: #475569;
		background: rgba(255, 255, 255, 0.7);
		padding: 0.25rem 0.75rem;
		border-radius: 0.375rem;
		white-space: nowrap;
	}

	.accordion-button:not(.collapsed) .lesson-count-badge {
		background: rgba(255, 255, 255, 0.9);
		color: #334155;
	}

	/* Lessons List Container */
	.lessons-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	/* Individual Lesson Item */
	.lesson-item {
		width: 100%;
		padding: 1rem;
		border: none;
		border-bottom: 1px solid #e5e7eb;
		background: transparent;
		text-align: left;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.lesson-item:hover {
		background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
		padding-left: 1.25rem;
	}

	.lesson-item.last-lesson {
		border-bottom: none;
	}

	.lesson-info {
		flex: 1;
		min-width: 0;
	}

	.lesson-title {
		color: #1e293b;
		font-weight: 500;
		font-size: 0.95rem;
	}

	.lesson-meta {
		flex-shrink: 0;
	}

	.lock-icon {
		font-size: 18px;
		color: #94a3b8;
	}

	/* Duration Badge */
	.duration-badge {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
		padding: 0.375rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid #cbd5e1;
	}

	.duration-icon {
		font-size: 16px;
		background: linear-gradient(45deg, #64748b, #475569);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
	}

	.duration-text {
		font-size: 0.875rem;
		font-weight: 600;
		color: #334155;
		white-space: nowrap;
	}

	/* No Lessons Message */
	.no-lessons-message {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, #fef3c7, #fde68a);
		border-radius: 0.5rem;
		border: 1px solid #fcd34d;
	}

	.no-lessons-message svg {
		color: #d97706;
		width: 24px;
		height: 24px;
	}

	.no-lessons-message p {
		color: #92400e;
		font-weight: 500;
	}

	/* Course Content Container - Same as WhatYouLearn */
	.course-content-container {
		background: linear-gradient(135deg, #f8fafc, #f1f5f9);
		border: 2px solid #e2e8f0;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.course-content-container {
			padding: 1.5rem;
		}
	}
</style>
