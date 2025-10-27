<script lang="ts">
	import { onMount } from 'svelte';
	import type { Category, Course, Section } from '$lib/types/course';
	import { fetchLessonHierarchy } from '$lib/services/lessonAdminService';
	let categories: Category[] = [];
let loading = true;
let error: string | null = null;
let selectedCategoryIndex = -1;
let selectedCourseIndex = -1;
let selectedSectionIndex = -1;

let selectedCategory: Category | null = null;
let selectedCourse: Course | null = null;
let selectedSection: Section | null = null;

onMount(async () => {
	try {
		categories = await fetchLessonHierarchy();
	} catch (e) {
		error = e.message || 'Failed to load categories';
	} finally {
		loading = false;
	}
});

function selectCategory(index: number) {
	if (index >= 0 && index < categories.length) {
		selectedCategory = categories[index];
		selectedCategoryIndex = index;
		selectedCourse = null;
		selectedCourseIndex = -1;
		selectedSection = null;
		selectedSectionIndex = -1;
	}
}

function selectCourse(index: number) {
	if (selectedCategory && index >= 0 && index < selectedCategory.courses.length) {
		selectedCourse = selectedCategory.courses[index];
		selectedCourseIndex = index;
		selectedSection = null;
		selectedSectionIndex = -1;
	}
}

function selectSection(index: number) {
	if (selectedCourse && index >= 0 && index < selectedCourse.course_sections.length) {
		selectedSection = selectedCourse.course_sections[index];
		selectedSectionIndex = index;
	}
}
</script>

<svelte:head>
	<title>Admin - Lesson Editor</title>
</svelte:head>

<div class="admin-lessons">
	<h1>Lesson Management</h1>
	{#if loading}
		<p>Loading lesson hierarchy...</p>
	{:else if error}
		<p class="text-danger">{error}</p>
	{:else}
		<!-- Category Selection -->
		<div class="mb-3">
			<label for="category-select" class="fw-bold">Category:</label>
			<select id="category-select" class="form-select" bind:value={selectedCategoryIndex} on:change={() => selectCategory(selectedCategoryIndex)}>
				<option value={-1} disabled selected>-- Select Category --</option>
				{#each categories as category, i}
					<option value={i}>{category.name}</option>
				{/each}
			</select>
		</div>

		{#if selectedCategory}
			<!-- Course Selection -->
			<div class="mb-3">
				<label for="course-select" class="fw-bold">Course:</label>
				<select id="course-select" class="form-select" bind:value={selectedCourseIndex} on:change={() => selectCourse(selectedCourseIndex)}>
					<option value={-1} disabled selected>-- Select Course --</option>
					{#each selectedCategory.courses as course, i}
						<option value={i}>{course.title}</option>
					{/each}
				</select>
			</div>

			{#if selectedCourse}
				<div class="mb-3">
					<label for="section-select" class="fw-bold">Section:</label>
					<select id="section-select" class="form-select" bind:value={selectedSectionIndex} on:change={() => selectSection(selectedSectionIndex)}>
						<option value={-1} disabled selected>-- Select Section --</option>
						{#each selectedCourse.course_sections as section, i}
							<option value={i}>{section.title}</option>
						{/each}
					</select>
				</div>
			{/if}
		{/if}

		{#if selectedSection}
			<!-- Lessons Table -->
			<a class="btn btn-primary mb-3" href={`/admin/lessons/new?sectionId=${selectedSection.id}`}>Add New Lesson</a>
			<table class="table table-bordered">
				<thead>
					<tr>
						<th>Title</th>
						<th>Slug</th>
						<th>Order</th>
						<th>Active</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each selectedSection.lessons as lesson}
						<tr>
							<td>{lesson.title}</td>
							<td>{lesson.slug}</td>
							<td>{lesson.order_index}</td>
							<td>{lesson.is_active ? 'Yes' : 'No'}</td>
							<td>
								<a class="btn btn-sm btn-secondary" href={`/admin/lessons/edit/${lesson.id}`}>Edit</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}


	{/if}
</div>

<style>
.admin-lessons {
	max-width: 900px;
	margin: 2rem auto;
	padding: 2rem;
	background: #fff;
	border-radius: 16px;
	box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
</style>