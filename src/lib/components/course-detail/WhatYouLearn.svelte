<script lang="ts">
	import { marked } from 'marked';
	import { Lightbulb, CheckCircle, Star, Heart, Rocket, Award, BookOpen, Smile, Flame, ThumbsUp } from 'lucide-svelte';
	import type { CourseInfo, Course } from '$lib/types/course';

	export let courseInfo: CourseInfo | null = null;
	export let course: Course | null = null;

	// Parse markdown and extract list items
	$: learningPoints = (() => {
		// Try courseInfo.what_learn first, then course.what_will_learn
		const content = courseInfo?.what_learn || course?.what_will_learn;
		if (!content) return [];

		try {
			const html = marked(content) as string;
			// Extract list items from HTML
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = html;
			const listItems = tempDiv.querySelectorAll('li');
			const points = Array.from(listItems).map((li) => li.textContent || '');
			if (points.length > 0) return points;
		} catch {
			// Ignore error, fall back to manual parsing
		}

		// Fallback: split by line breaks and clean up
		return content
			.split('\n')
			.filter((line) => line.trim())
			.map((line) => line.replace(/^[-*•]\s*/, '').trim());
	})();
</script>

{#if learningPoints.length > 0}
	<div class="bd-course-feature-box mt-5" id="details">
		<div class="section-header mb-4">
			<div class="header-icon">
				<Lightbulb size="28" aria-hidden="true" />
			</div>
			<h3 class="bd-course-details-content-title mb-0">Apa yang akan Anda pelajari</h3>
		</div>

		<div class="learning-container">
			 <div class="learning-grid">
				 {#each learningPoints as point, index (index)}
					 <div class="learning-item" style="animation-delay: {index * 0.05}s">
						 <div class="point-icon">
							 {#if index % 10 === 0}
								 <Star size="24" color="#f59e0b" aria-hidden="true" />
							 {:else if index % 10 === 1}
								 <Heart size="24" color="#ef4444" aria-hidden="true" />
							 {:else if index % 10 === 2}
								 <Rocket size="24" color="#6366f1" aria-hidden="true" />
							 {:else if index % 10 === 3}
								 <Award size="24" color="#fbbf24" aria-hidden="true" />
							 {:else if index % 10 === 4}
								 <BookOpen size="24" color="#10b981" aria-hidden="true" />
							 {:else if index % 10 === 5}
								 <Smile size="24" color="#f472b6" aria-hidden="true" />
							 {:else if index % 10 === 6}
								 <Flame size="24" color="#fb7185" aria-hidden="true" />
							 {:else if index % 10 === 7}
								 <ThumbsUp size="24" color="#3b82f6" aria-hidden="true" />
							 {:else if index % 10 === 8}
								 <Lightbulb size="24" color="#fde047" aria-hidden="true" />
							 {:else}
								 <CheckCircle size="24" color="#059669" aria-hidden="true" />
							 {/if}
						 </div>
						 <p class="learning-text">{point}</p>
					 </div>
				 {/each}
			 </div>
		</div>
	</div>
{/if}

<style>
	.section-header {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.header-icon {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #fef3c7, #fde047);
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(250, 204, 21, 0.2);
	}

	.header-icon :global(svg) {
		background: linear-gradient(45deg, #f59e0b, #d97706);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
	}

	.learning-container {
		background: linear-gradient(135deg, #f8fafc, #f1f5f9);
		border: 2px solid #e2e8f0;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
	}

	.learning-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.learning-item {
		display: flex;
		align-items: flex-start;
		gap: 0.875rem;
		padding: 1rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		transition: all 0.3s ease;
		animation: fadeInUp 0.6s ease-out forwards;
		opacity: 0;
	}

	.learning-item:hover {
		transform: translateY(-4px);
		box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
		border: 1px solid #bfdbfe;
	}

	   .point-icon {
		   flex-shrink: 0;
		   width: 24px;
		   height: 24px;
		   display: flex;
		   align-items: center;
		   justify-content: center;
		   margin-top: 2px;
	   }
	   .point-icon :global(svg) {
		   filter: drop-shadow(0 1px 2px rgba(0,0,0,0.08));
	   }

	.learning-text {
		margin: 0;
		color: #334155;
		font-size: 0.95rem;
		line-height: 1.6;
		font-weight: 500;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.learning-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.learning-container {
			padding: 1.5rem;
		}

		.section-header {
			gap: 0.75rem;
		}

		.header-icon {
			width: 40px;
			height: 40px;
		}

		.header-icon :global(svg) {
			width: 24px;
			height: 24px;
		}
	}
</style>
