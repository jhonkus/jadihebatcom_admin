<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Category, Course, Section, Lesson } from '$lib/types/course';
	import { fetchLessonHierarchy } from '$lib/services/lessonAdminService';
	import { browser } from '$app/environment';

	let editor: any = null;
	let quillLib: any = null;

	// Initialize Quill editor (client-side only)
	async function initQuill() {
		if (!browser) return;
		// Clear any previous editor container content
		try {
			const prev = document.getElementById('lesson-content-editor');
			if (prev) prev.innerHTML = '';
		} catch (e) {
			console.warn('[lessons] failed to clear editor container', e);
		}

		// Dynamic import Quill and its CSS
		try {
			const mod = await import('quill');
			quillLib = mod.default || mod;
			await import('quill/dist/quill.snow.css');
		} catch (e) {
			console.error('[lessons] failed to load Quill', e);
			return;
		}

		const el = document.getElementById('lesson-content-editor');
		if (!el) {
			console.warn('[lessons] Quill container missing');
			return;
		}

		const options = {
			theme: 'snow',
			modules: {
				toolbar: [
					[{ header: [1, 2, 3, false] }],
					['bold', 'italic', 'underline', 'strike'],
					[{ color: [] }, { background: [] }],
					[{ list: 'ordered' }, { list: 'bullet' }],
					['link', 'image', 'code-block'],
					['clean']
				]
			}
		};

		try {
			editor = new quillLib(el, options);
			console.log('[lessons] Quill initialized');

			// set content if present
			try {
				if (selectedLesson?.content) {
					editor.clipboard.dangerouslyPasteHTML(selectedLesson.content);
				}
			} catch (e) {
				console.warn('[lessons] failed to set initial Quill content', e);
			}

			// sync back to selectedLesson
			editor.on('text-change', () => {
				try {
					selectedLesson.content = el.querySelector('.ql-editor')?.innerHTML || '';
				} catch (err) {
					console.warn('[lessons] error reading Quill content', err);
				}
			});
		} catch (e) {
			console.error('[lessons] could not create Quill instance', e);
			editor = null;
		}
	}

	// Entry point for initializing the editor after Svelte state updates
	async function initializeEditor() {
		if (!browser) return;
		await tick();
		await initQuill();
	}

	// Cleanup any editor instances and leftover artifacts
	function cleanupEditor() {
		try {
			const el = document.getElementById('lesson-content-editor');
			if (editor) {
				try {
					if (typeof editor.disable === 'function') editor.disable();
				} catch (e) {
					/* ignore */
				}
			}
			if (el) el.innerHTML = '';
			editor = null;

			// nothing else to cleanup
		} catch (e) {
			console.warn('[lessons] cleanupEditor error', e);
		}
	}
	let categories: Category[] = [];
let loading = true;
let error: string | null = null;
let selectedCategoryIndex = -1;
let selectedCourseIndex = -1;
let selectedSectionIndex = -1;

let selectedCategory: Category | null = null;
let selectedCourse: Course | null = null;
let selectedSection: Section | null = null;
let selectedLesson: Lesson | null = null;
let editMode = false;

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
		selectedLesson = null;
		editMode = false;
	}
}

function selectCourse(index: number) {
	if (selectedCategory && index >= 0 && index < selectedCategory.courses.length) {
		selectedCourse = selectedCategory.courses[index];
		selectedCourseIndex = index;
		selectedSection = null;
		selectedSectionIndex = -1;
		selectedLesson = null;
		editMode = false;
	}
}

function selectSection(index: number) {
	if (selectedCourse && index >= 0 && index < selectedCourse.course_sections.length) {
		selectedSection = selectedCourse.course_sections[index];
		selectedSectionIndex = index;
		selectedLesson = null;
		editMode = false;
	}
}

function selectLesson(lesson: Lesson) {
	selectedLesson = { ...lesson };
	editMode = true;
	// Initialize editor after state changes
	setTimeout(() => initializeEditor(), 0);
}

function newLesson() {
	if (!selectedSection) return;
	selectedLesson = {
		id: '',
		title: '',
		slug: '',
		content: '',
		order_index: 0,
		estimated_duration: 0,
		is_free: false,
		is_active: true,
		section_id: selectedSection.id
	};
	editMode = true;
	// Initialize editor after state changes
	setTimeout(() => initializeEditor(), 0);
}

async function saveLesson() {
	if (!selectedLesson) return;
	loading = true;
	try {
		const method = selectedLesson.id ? 'PUT' : 'POST';
		const res = await fetch('/api/lessons', {
			method,
			body: JSON.stringify(selectedLesson),
			headers: { 'Content-Type': 'application/json' }
		});
		if (!res.ok) throw new Error('Failed to save lesson');
		// Refresh hierarchy
		categories = await fetchLessonHierarchy();
		selectedLesson = null;
		editMode = false;
		cleanupEditor();
	} catch (e) {
		error = e.message || 'Unknown error';
	} finally {
		loading = false;
	}
}

function cancelEdit() {
	selectedLesson = null;
	editMode = false;
	cleanupEditor();
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
			<button class="btn btn-primary mb-3" on:click={newLesson}>Add New Lesson</button>
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
								<button class="btn btn-sm btn-secondary" on:click={() => selectLesson(lesson)}>Edit</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}

		{#if editMode && selectedLesson}
			<div class="lesson-editor mt-4">
				<h2>{selectedLesson.id ? 'Edit Lesson' : 'Add Lesson'}</h2>
				<form on:submit|preventDefault={saveLesson}>
					<div class="mb-2">
						<label for="lesson-title">Title</label>
						<input id="lesson-title" class="form-control" bind:value={selectedLesson.title} required />
					</div>
					<div class="mb-2">
						<label for="lesson-slug">Slug</label>
						<input id="lesson-slug" class="form-control" bind:value={selectedLesson.slug} required />
					</div>
					<div class="mb-2">
						<label for="lesson-content-editor">Content</label>
						{#if browser}
							<!-- The editor container must exist on the client so the rich editor (Quill) can attach to it -->
							<div id="lesson-content-editor"></div>
							<!-- Keep a fallback textarea visible until the editor instance is ready so users can still edit -->
							{#if !editor}
								<textarea id="lesson-content-fallback" class="form-control" bind:value={selectedLesson.content} rows="10"></textarea>
							{/if}
						{:else}
							<!-- SSR fallback: render textarea for server-side rendered pages -->
							<textarea id="lesson-content-fallback" class="form-control" bind:value={selectedLesson.content} rows="10"></textarea>
						{/if}
					</div>
					<div class="mb-2">
						<label for="lesson-order">Order Index</label>
						<input id="lesson-order" type="number" class="form-control" bind:value={selectedLesson.order_index} min="0" />
					</div>
					<div class="mb-2">
						<label for="lesson-duration">Estimated Duration (min)</label>
						<input id="lesson-duration" type="number" class="form-control" bind:value={selectedLesson.estimated_duration} min="0" />
					</div>
					<div class="mb-2">
						<label for="lesson-active">Active</label>
						<input id="lesson-active" type="checkbox" bind:checked={selectedLesson.is_active} />
					</div>
					<div class="mb-2">
						<label for="lesson-free">Free Lesson</label>
						<input id="lesson-free" type="checkbox" bind:checked={selectedLesson.is_free} />
					</div>
					<button class="btn btn-success me-2" type="submit">Save</button>
					<button class="btn btn-secondary" type="button" on:click={cancelEdit}>Cancel</button>
				</form>
			</div>
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
.lesson-editor {
	background: #f8f9fa;
	padding: 1.5rem;
	border-radius: 12px;
	box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

/* Editor custom styling (Quill) */
:global(.ql-toolbar) {
	border-bottom: 1px solid #e5e7eb !important;
}
:global(.ql-container) {
	border: 1px solid #d1d5db !important;
	border-radius: 0.5rem !important;
}
</style>