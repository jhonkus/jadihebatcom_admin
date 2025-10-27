/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/services/progressService.ts - CLIENT SIDE ONLY
export interface LessonProgress {
	id: string;
	user_id: string;
	lesson_id: string;
	course_id: string;
	completed: boolean;
	completed_at?: string;
}

/**
 * Get all lesson progress for a user in a specific course
 */
export async function getCourseProgress(courseId: string): Promise<LessonProgress[]> {
	try {
		const response = await fetch(`/api/progress/course/${courseId}`);

		if (response.status === 401) {
			throw new Error('Unauthorized');
		}

		if (!response.ok) {
			throw new Error('Failed to fetch progress');
		}

		const data = await response.json();
		return data.progress || [];
	} catch {
		// console.error('Get course progress error:', error);
		return [];
	}
}

/**
 * Mark a lesson as complete
 */
export async function markLessonComplete(
	lessonId: string,
	courseId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch('/api/progress/lesson/complete', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				lessonId,
				courseId
			})
		});

		if (response.status === 401) {
			return { success: false, error: 'Unauthorized' };
		}

		if (!response.ok) {
			const data = await response.json();
			return { success: false, error: data.error || 'Failed to mark lesson as complete' };
		}

		return { success: true };
	} catch (error: any) {
		// console.error('Mark lesson complete error:', error);
		return {
			success: false,
			error: error.message || 'Failed to mark lesson as complete'
		};
	}
}

/**
 * Mark a lesson as incomplete
 */
export async function markLessonIncomplete(
	lessonId: string,
	courseId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch('/api/progress/lesson/incomplete', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				lessonId,
				courseId
			})
		});

		if (response.status === 401) {
			return { success: false, error: 'Unauthorized' };
		}

		if (!response.ok) {
			const data = await response.json();
			return { success: false, error: data.error || 'Failed to mark lesson as incomplete' };
		}

		return { success: true };
	} catch (error: any) {
		// console.error('Mark lesson incomplete error:', error);
		return {
			success: false,
			error: error.message || 'Failed to mark lesson as incomplete'
		};
	}
}

/**
 * Check if a specific lesson is completed
 */
export async function isLessonCompleted(lessonId: string): Promise<boolean> {
	try {
		const response = await fetch(`/api/progress/lesson/${lessonId}/completed`);

		if (response.status === 401) {
			return false;
		}

		if (!response.ok) {
			return false;
		}

		const data = await response.json();
		return data.completed || false;
	} catch {
		// console.error('Check lesson completed error:', error);
		return false;
	}
}

/**
 * Get course completion statistics
 */
export async function getCourseStats(courseId: string): Promise<{
	totalLessons: number;
	completedLessons: number;
	progressPercentage: number;
}> {
	try {
		const response = await fetch(`/api/progress/course/${courseId}/stats`);

		if (response.status === 401) {
			throw new Error('Unauthorized');
		}

		if (!response.ok) {
			throw new Error('Failed to fetch course stats');
		}

		const data = await response.json();
		return data;
	} catch {
		// console.error('Get course stats error:', error);
		return {
			totalLessons: 0,
			completedLessons: 0,
			progressPercentage: 0
		};
	}
}
