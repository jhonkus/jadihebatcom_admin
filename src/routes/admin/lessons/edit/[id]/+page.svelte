<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import type { Lesson } from '$lib/types/course';

    import LessonEditor from '../../LessonEditor.svelte';

    export let data: { lesson: Lesson | null };

    let selectedLesson: Lesson | null = data?.lesson || null;
    let loading = false;
    let error: string | null = null;

    async function saveLesson() {
        if (!selectedLesson) return;
        loading = true;
        try {
            const method = selectedLesson.id ? 'PUT' : 'POST';
            const res = await fetch('/api/lessons', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedLesson),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Failed to save lesson');
            }

            // return to list and attempt to restore section context
            goto(`/admin/lessons${selectedLesson.section_id ? `?sectionId=${selectedLesson.section_id}` : ''}`);
        } catch (e) {
            error = (e as Error).message || 'Unknown error';
        } finally {
            loading = false;
        }
    }

    function cancel() { goto('/admin/lessons'); }
</script>

<svelte:head>
    <title>Admin - Edit Lesson</title>
</svelte:head>

<div class="admin-lessons">
    <h1>Edit Lesson</h1>

    {#if !selectedLesson}
        <p class="text-danger">Lesson not found.</p>
        <a class="btn btn-secondary" href="/admin/lessons">Back to lessons</a>
    {:else}
        {#if error}
            <p class="text-danger">{error}</p>
        {/if}

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
                        <LessonEditor bind:lesson={selectedLesson} />
                    {:else}
                        <textarea class="form-control" bind:value={selectedLesson.content} rows="10"></textarea>
                    {/if}
                </div>

            <div class="mb-2">
                <label for="lesson-order">Order Index</label>
                <input id="lesson-order" type="number" class="form-control" bind:value={selectedLesson.order_index} min="0" />
            </div>

            <div class="mb-2">
                <label for="lesson-active">Active</label>
                <input id="lesson-active" type="checkbox" bind:checked={selectedLesson.is_active} />
            </div>

            <button class="btn btn-success me-2" type="submit" disabled={loading}>Save</button>
            <button class="btn btn-secondary" type="button" on:click={cancel} disabled={loading}>Cancel</button>
        </form>
    {/if}
</div>

<style>
.admin-lessons { max-width: 900px; margin: 2rem auto; padding: 2rem; background: #fff; border-radius: 16px; }
:global(.ql-toolbar) { border-bottom: 1px solid #e5e7eb !important; }
:global(.ql-container) { border: 1px solid #d1d5db !important; border-radius: 0.5rem !important; }
</style>