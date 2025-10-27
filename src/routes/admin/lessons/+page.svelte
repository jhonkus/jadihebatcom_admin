<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Category, Course, Section, Lesson } from '$lib/types/course';
	import { fetchLessonHierarchy } from '$lib/services/lessonAdminService';
	import { browser } from '$app/environment';

	// TinyMCE configuration
	const TINYMCE_API_KEY = '2nvms11dslnngrljimctrmszuebr1j7gwqnxwpdlf01y6ckc';
	let editor: any = null;
	let tinymce: any = null; // will reference window.tinymce when loaded

	function loadScript(src: string) {
		return new Promise<void>((resolve, reject) => {
			const existing = document.querySelector(`script[src="${src}"]`);
			if (existing) {
				existing.addEventListener('load', () => resolve());
				existing.addEventListener('error', () => reject(new Error('Failed to load script')));
				return;
			}
			const s = document.createElement('script');
			s.src = src;
			s.referrerPolicy = 'origin';
			s.onload = () => resolve();
			s.onerror = () => reject(new Error('Failed to load script'));
			document.head.appendChild(s);
		});
	}

	async function initTinyMCE() {
		if (!browser) return; // never run on server

		// If a global tinymce already exists (maybe from another script), use it
		if ((window as any).tinymce) {
			tinymce = (window as any).tinymce;
		}

		// Prefer dynamic imports from the npm package so Vite bundles plugins/themes/icons
		if (!tinymce) {
			try {
				// Core
				await import('tinymce/tinymce');
				// Icons & theme
				await import('tinymce/icons/default');
				await import('tinymce/themes/silver');
				// Skin CSS (UI and content)
				await import('tinymce/skins/ui/oxide/skin.min.css');
				await import('tinymce/skins/content/default/content.min.css');

				// Plugins we use
				const plugins = [
					'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
					'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
					'insertdatetime', 'media', 'table', 'help', 'wordcount',
					'emoticons', 'paste', 'textcolor', 'colorpicker'
				];

				await Promise.all(plugins.map(p => import(`tinymce/plugins/${p}/plugin`)));

				// Now the tinymce global should be present
				if ((window as any).tinymce) tinymce = (window as any).tinymce;
			} catch (err) {
				// If bundling/importing fails (module not found), fall back to CDN loader
				console.warn('npm-based TinyMCE import failed, falling back to CDN:', err);
				try {
					const cdn = `https://cdn.tiny.cloud/1/${TINYMCE_API_KEY}/tinymce/6/tinymce.min.js`;
					await loadScript(cdn);
					if ((window as any).tinymce) tinymce = (window as any).tinymce;
				} catch (cdnErr) {
					console.error('Failed to load TinyMCE from CDN as fallback', cdnErr);
				}
			}
		}

		// Only initialize if tinymce is available
		if (!tinymce) return;

		// Remove any existing editor instance
		if (editor) {
			tinymce.remove('#lesson-content-editor');
		}

			tinymce.init({
			selector: '#lesson-content-editor',
			apiKey: '2nvms11dslnngrljimctrmszuebr1j7gwqnxwpdlf01y6ckc',
			height: 500,
			menubar: false,
			plugins: [
				'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
				'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
				'insertdatetime', 'media', 'table', 'help', 'wordcount',
				'emoticons', 'paste', 'textcolor', 'colorpicker'
			],
			toolbar: 'undo redo | blocks | ' +
				'bold italic underline strikethrough | forecolor backcolor | ' +
				'alignleft aligncenter alignright alignjustify | ' +
				'bullist numlist outdent indent | ' +
				'link image media table | ' +
				'code | ' +
				'emoticons charmap | ' +
				'removeformat fullscreen preview help',
			content_style: `
				body {
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
					font-size: 14px;
					line-height: 1.6;
					color: #374151;
				}
				h1, h2, h3, h4, h5, h6 {
					color: #111827;
					font-weight: 600;
					margin-top: 1.5em;
					margin-bottom: 0.5em;
				}
				h1 { font-size: 2em; }
				h2 { font-size: 1.5em; }
				h3 { font-size: 1.25em; }
				p { margin-bottom: 1em; }
				blockquote {
					border-left: 4px solid #e5e7eb;
					padding-left: 1em;
					margin: 1em 0;
					color: #6b7280;
					font-style: italic;
				}
				code {
					background: #f3f4f6;
					padding: 0.125em 0.25em;
					border-radius: 0.25em;
					font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
					font-size: 0.875em;
				}
				pre {
					background: #f3f4f6;
					padding: 1em;
					border-radius: 0.5em;
					overflow-x: auto;
					margin: 1em 0;
				}
				pre code {
					background: none;
					padding: 0;
				}
			`,
			placeholder: 'Start writing your lesson content...',
			branding: false,
			promotion: false,
			paste_data_images: true,
			image_advtab: true,
			image_title: true,
			link_default_target: '_blank',
			link_assume_external_targets: true,
				/* called when the editor instance is created and ready */
				init_instance_callback: (ed: any) => {
					console.log('[lessons] tinymce instance ready', ed.id);
					// ensure the editor has the lesson content
					try {
						ed.setContent(selectedLesson?.content || '');
						console.log('[lessons] tinymce setContent called (init_callback)');
					} catch (e) {
						console.warn('[lessons] tinymce failed to set content in init callback', e);
					}
				},
				setup: (ed: any) => {
					editor = ed;
					console.log('[lessons] tinymce setup, editor assigned');
					ed.on('init', () => {
						console.log('[lessons] editor init event');
						// safe guard: set content when the editor fires its init event
						try {
							ed.setContent(selectedLesson?.content || '');
							console.log('[lessons] tinymce setContent called (init event)');
						} catch (e) {
							console.warn('[lessons] tinymce failed to set content on init event', e);
						}
					});
					ed.on('change', () => {
						if (selectedLesson) {
							selectedLesson.content = ed.getContent();
						}
					});
				}
		});
	}

	function updateEditorContent(content: string) {
		if (editor) {
			editor.setContent(content || '');
		}
	}

	// Initialize TinyMCE when edit mode is activated
	async function initializeEditor() {
		if (editMode && selectedLesson) {
			// Wait for DOM to update
			await tick();
			// Check if element exists
			const editorElement = document.getElementById('lesson-content-editor');
			if (editorElement) {
				console.log('[lessons] initializing TinyMCE...');
				await initTinyMCE();
				// wait for the editor instance to be assigned by the setup/init callbacks
				const start = Date.now();
				while (!editor && Date.now() - start < 3000) {
					await new Promise((r) => setTimeout(r, 50));
				}
				if (editor) {
					console.log('[lessons] editor available after init, setting content');
					updateEditorContent(selectedLesson.content);
				} else {
					console.warn('[lessons] editor did not become available within timeout');
				}
			}
		}
	}

	// Clean up TinyMCE when edit mode is deactivated
	function cleanupEditor() {
		if (!editMode && editor && browser && tinymce) {
			tinymce.remove('#lesson-content-editor');
			editor = null;
		}
	}	let categories: Category[] = [];
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
							<!-- The editor container must exist on the client so TinyMCE can attach to it -->
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

/* TinyMCE Custom Styling */
:global(.tox-tinymce) {
	border: 1px solid #d1d5db !important;
	border-radius: 0.5rem !important;
	box-shadow: none !important;
}
:global(.tox-tinymce:focus-within) {
	border-color: #6366f1 !important;
	box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
}
:global(.tox .tox-toolbar) {
	border-bottom: 1px solid #e5e7eb !important;
	background: #f9fafb !important;
}
:global(.tox .tox-toolbar button) {
	color: #374151 !important;
}
:global(.tox .tox-toolbar button:hover) {
	background: #e5e7eb !important;
}
:global(.tox .tox-toolbar button[aria-pressed="true"]) {
	background: #6366f1 !important;
	color: white !important;
}
</style>