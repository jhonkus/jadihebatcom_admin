<!--
	CommonCourseFeature.svelte
	
	Displays key course information in a horizontal layout with icons.
	Dynamically shows available course features including:
	- Level (GraduationCap icon), Category (FolderOpen icon), Instructor (User icon) - always shown if available
	- Duration (Clock icon), Student count (Users icon), Rating (Star icon) - conditionally shown
	
	Props:
	- course: Course object containing all course data
-->
<script lang="ts">
	import { 
		GraduationCap, 
		FolderOpen, 
		User, 
		Clock, 
		Users, 
		Star 
	} from 'lucide-svelte';
	import type { Course } from '$lib/types/course';

	// Props from parent (course detail page)
	export let course: Course | null = null;

	// Helper function to format instructor name
	function formatInstructorName(instructor: any): string {
		if (!instructor) return '—';
		const firstName = instructor.first_name || '';
		const lastName = instructor.last_name || '';
		return `${firstName}${lastName ? ` ${lastName}` : ''}`.trim() || '—';
	}

	// Helper function to format student count
	function formatStudentCount(count: number | null | undefined): string {
		if (!count || count === 0) return '0 siswa';
		if (count >= 1000) {
			return `${(count / 1000).toFixed(1).replace('.0', '')}k siswa`;
		}
		return `${count} siswa`;
	}

	// Helper function to format rating
	function formatRating(average: string | null | undefined, count: number | null | undefined): string {
		if (!average || !count || count === 0) return '—';
		const rating = parseFloat(average);
		return `${rating.toFixed(1)} (${count} review${count > 1 ? 's' : ''})`;
	}

	// Helper function to capitalize first letter
	function capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	// Compute dynamic course feature list with expanded information
	$: courseFeatures = (() => {
		if (!course) return [];

		const features = [
			{ 
				icon: 'level', 
				label: 'Level', 
				value: course.difficulty_level ? capitalize(course.difficulty_level) : '—' 
			},
			{ 
				icon: 'category', 
				label: 'Kategori', 
				value: course.category_id?.name || '—' 
			},
			{
				icon: 'instructor',
				label: 'Instruktur',
				value: formatInstructorName(course.instructor_id)
			}
		];

		// Add duration if available
		if (course.estimated_duration) {
			features.push({
				icon: 'duration',
				label: 'Durasi',
				value: course.estimated_duration
			});
		}

		// Add student count if available
		if (course.enrollment_count !== undefined && course.enrollment_count !== null) {
			features.push({
				icon: 'students',
				label: 'Siswa',
				value: formatStudentCount(course.enrollment_count)
			});
		}

		// Add rating if available
		if (course.rating_average && course.rating_count) {
			features.push({
				icon: 'rating',
				label: 'Rating',
				value: formatRating(course.rating_average, course.rating_count)
			});
		}

		return features;
	})();
</script>

<div class="course-features-horizontal">
	{#each courseFeatures as item, index (item.icon + item.label)}
		<div class="feature-item">
			<div class="feature-content">
				{#if item.icon === 'level'}
					<GraduationCap size="20" class="feature-icon" aria-hidden="true" />
				{:else if item.icon === 'category'}
					<FolderOpen size="20" class="feature-icon" aria-hidden="true" />
				{:else if item.icon === 'instructor'}
					<User size="20" class="feature-icon" aria-hidden="true" />
				{:else if item.icon === 'duration'}
					<Clock size="20" class="feature-icon" aria-hidden="true" />
				{:else if item.icon === 'students'}
					<Users size="20" class="feature-icon" aria-hidden="true" />
				{:else if item.icon === 'rating'}
					<Star size="20" class="feature-icon" aria-hidden="true" />
				{:else}
					<div class="feature-icon-fallback">•</div>
				{/if}
				<div class="feature-text">
					<span class="feature-label">{item.label}</span>
					<span class="feature-value">{item.value}</span>
				</div>
			</div>
			{#if index < courseFeatures.length - 1}
				<div class="feature-divider" aria-hidden="true"></div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.course-features-horizontal {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem 2rem;
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.feature-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		min-width: 0; /* Allow flex items to shrink */
	}

	.feature-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-width: 0; /* Allow flex items to shrink */
	}

	.feature-content :global(.feature-icon) {
		color: #3b82f6;
		flex-shrink: 0; /* Prevent icon from shrinking */
		stroke-width: 2;
		width: 20px;
		height: 20px;
		display: inline-block;
	}

	.feature-icon-fallback {
		color: #3b82f6;
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		font-weight: bold;
	}

	.feature-text {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0; /* Allow text to shrink */
	}

	.feature-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	.feature-value {
		font-size: 0.95rem;
		font-weight: 600;
		color: #1e293b;
		word-break: break-word;
		line-height: 1.3;
	}

	.feature-divider {
		width: 1px;
		height: 2rem;
		background: #e5e7eb;
		flex-shrink: 0;
	}

	/* Enhanced responsive design */
	@media (max-width: 1024px) {
		.course-features-horizontal {
			padding: 1.25rem 1.5rem;
			gap: 1.25rem;
		}
	}

	@media (max-width: 768px) {
		.course-features-horizontal {
			flex-direction: column;
			justify-content: center;
			gap: 1.5rem;
			align-items: stretch;
			padding: 1.5rem 1rem;
		}

		.feature-item {
			justify-content: flex-start;
			gap: 0;
		}

		.feature-divider {
			display: none;
		}

		.feature-content {
			gap: 0.5rem;
		}

		.feature-value {
			font-size: 0.9rem;
		}
	}

	@media (max-width: 480px) {
		.course-features-horizontal {
			padding: 1rem 0.75rem;
			gap: 1rem;
		}

		.feature-label {
			font-size: 0.7rem;
		}

		.feature-value {
			font-size: 0.85rem;
		}
	}
</style>
