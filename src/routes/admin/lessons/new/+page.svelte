<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import type { Lesson } from '$lib/types/course';

    import LessonEditor from '../LessonEditor.svelte';

    let selectedLesson: Partial<Lesson> = {
        id: '',
        title: '',
        slug: '',
        content: '',
        order_index: 0,
        estimated_duration: 0,
        is_free: false,
        is_active: true,
        section_id: ''
    };

    let loading = false;
    let error: string | null = null;

    // read sectionId from query param so user returns to the same section after save
    onMount(() => {
        if (browser) {
            try {
                const params = new URLSearchParams(location.search);
                const sid = params.get('sectionId');
                if (sid) selectedLesson.section_id = sid;
            } catch { /* ignore */ }
        }
    });

    async function saveLesson() {
        loading = true;
        try {
            const res = await fetch('/api/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedLesson),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Failed to create lesson');
            }

            // return to list and try to restore section context
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
    <title>Admin - New Lesson</title>
</svelte:head>

<div class="admin-lessons">
    <h1>New Lesson</h1>

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

        <button class="btn btn-success me-2" type="submit" disabled={loading}>Create</button>
        <button class="btn btn-secondary" type="button" on:click={cancel} disabled={loading}>Cancel</button>
    </form>
</div>

<style>
.admin-lessons { max-width: 900px; margin: 2rem auto; padding: 2rem; background: #fff; border-radius: 16px; }
:global(.ql-toolbar) { border-bottom: 1px solid #e5e7eb !important; }
:global(.ql-container) { border: 1px solid #d1d5db !important; border-radius: 0.5rem !important; }
</style>
