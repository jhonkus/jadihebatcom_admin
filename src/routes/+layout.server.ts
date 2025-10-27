// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const authToken = cookies.get('jadihebat_auth');
	const userCookie = cookies.get('jadihebat_user');

	let user = null;

	if (authToken && userCookie) {
		try {
			user = JSON.parse(userCookie);
		} catch {
			// console.error('Failed to parse user cookie:', e);
		}
	}

	// Only return non-sensitive user data to client
	// Full user data is available server-side via locals.user
	return {
		user: user
			? {
					first_name: user.first_name,
					last_name: user.last_name
					// Do NOT include: id, email, or other sensitive data
				}
			: null,
		isAuthenticated: !!authToken
	};
};
