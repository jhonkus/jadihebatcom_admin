/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable svelte/no-navigation-without-resolve */
// $lib/services/enrollmentService.ts
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export interface EnrollmentResponse {
	success: boolean;
	enrollment?: any;
	error?: string;
}

/**
 * Check if user already enrolled in a course (Client-side only)
 * NOTE: This is a passive check - it should NOT redirect on auth failure
 * Let the user view the course page even if not authenticated
 */
export async function checkEnrollment(courseId: string): Promise<boolean> {
	if (!browser) return false;

	try {
		const response = await fetch(`/api/enrollments/check?courseId=${courseId}`);

		// FIXED: Don't redirect on 401 - this is just checking enrollment status
		// The course page should be viewable by everyone
		// Only redirect to login when user actually clicks "Enroll"
		if (response.status === 401 || !response.ok) {
			return false; // Not enrolled (or can't check)
		}

		const data = await response.json();
		return data.enrolled;
	} catch {
		// console.error('Check enrollment error:', error);
		return false; // Fail silently
	}
}

/**
 * Enroll user to a free course (Client-side only)
 */
export async function enrollFreeCourse(courseId: string): Promise<EnrollmentResponse> {
	if (!browser) {
		return {
			success: false,
			error: 'This action requires browser environment'
		};
	}

	try {
		const response = await fetch('/api/enrollments/enroll', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				course_id: courseId
			})
		});

		// Handle unauthorized
		if (response.status === 401) {
			goto('/login');
			return {
				success: false,
				error: 'Please login to enroll'
			};
		}

		const data = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: data.error || 'Enrollment failed'
			};
		}

		return {
			success: true,
			enrollment: data.enrollment
		};
	} catch (error: any) {
		// console.error('Enrollment error:', error);
		return {
			success: false,
			error: error.message || 'Failed to enroll'
		};
	}
}
