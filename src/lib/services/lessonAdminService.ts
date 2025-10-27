import type { Category, Lesson } from '$lib/types/course';

export async function fetchLessonHierarchy(): Promise<Category[]> {
	const res = await fetch('/api/lessons/hierarchy');
	if (!res.ok) throw new Error('Failed to fetch lesson hierarchy');
	const data = await res.json();
	return data.categories as Category[];
}

export async function saveLesson(lesson: Partial<Lesson>): Promise<void> {
	const method = lesson.id ? 'PUT' : 'POST';
	const response = await fetch('/api/lessons', {
		method,
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(lesson),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to save lesson');
	}
}
