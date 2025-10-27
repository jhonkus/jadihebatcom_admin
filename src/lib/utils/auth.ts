// lib/utils/auth.ts
import { browser } from '$app/environment';

export function getCurrentUser() {
	// Prefer server-provided session info via /api/session because cookies are httpOnly.
	// This function returns null synchronously; use fetchCurrentUser() to asynchronously
	// obtain the current user in browser code.
	return null;
}

export async function fetchCurrentUser() {
	if (!browser) return null;

	try {
		const res = await fetch('/api/session');
		if (!res.ok) return null;
		const payload = await res.json();
		return payload.user || null;
	} catch {
		return null;
	}
}

export async function isLoggedIn() {
	const u = await fetchCurrentUser();
	return !!u;
}

export function getAuthToken() {
	// Auth token is stored in an httpOnly cookie; client-side code cannot read it.
	// Use server-side endpoints or let the browser send cookies automatically with fetch.
	return null;
}
