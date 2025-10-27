// src/routes/logout/+server.ts - PERBAIKI
import { json } from '@sveltejs/kit';
import { API_BASE_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, locals }) => {
	try {
		// console.log('🚪 Logging out user...');

		// ✅ PERBAIKI: Clear SEMUA auth cookies secara eksplisit
		const cookiesToDelete = ['jadihebat_auth', 'jadihebat_refresh', 'jadihebat_user'];

		cookiesToDelete.forEach((cookieName) => {
			cookies.delete(cookieName, {
				path: '/',
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax'
			});
			// // console.log(`✅ Deleted cookie: ${cookieName}`);
		});

		// Optional: Invalidate token di Directus
		if (locals.authToken && API_BASE_URL) {
			try {
				await fetch(`${API_BASE_URL}/auth/logout`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${locals.authToken}`,
						'Content-Type': 'application/json'
					}
				});
				// console.log('✅ Directus token invalidated');
			} catch {
				// console.error('Directus logout failed:', error);
			}
		}

		// console.log('✅ Logout successful - all cookies cleared');
		return json({
			success: true,
			message: 'Logged out successfully'
		});
	} catch {
		// console.error('Logout error:', error);
		return json({ success: false, error: 'Logout failed' }, { status: 500 });
	}
};
