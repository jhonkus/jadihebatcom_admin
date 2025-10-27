// routes/login/+page.server.ts - Professional Setup
import { fail, redirect } from '@sveltejs/kit';
import { config } from '$lib/server/directus-admin';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies, fetch, getClientAddress }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim();
		const password = formData.get('password')?.toString().trim();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const remember = formData.get('remember') === 'on';

		// Enhanced validation
		if (!email || !password) {
			return fail(400, {
				error: 'Email dan password wajib diisi',
				email
			});
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, {
				error: 'Format email tidak valid',
				email
			});
		}

		// Rate limiting check (basic)
		const loginAttempts = cookies.get('login_attempts') || '0';
		if (parseInt(loginAttempts) > 5) {
			return fail(429, {
				error: 'Terlalu banyak percobaan login. Coba lagi nanti.'
			});
		}

		try {
			// Authenticate with server
			const response = await fetch(`${config.baseUrl}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Forwarded-For': getClientAddress()
				},
				body: JSON.stringify({
					email,
					password,
					mode: 'json'
				})
			});

			const data = await response.json();

			if (!response.ok) {
				// Increment failed attempts
				cookies.set('login_attempts', (parseInt(loginAttempts) + 1).toString(), {
					path: '/',
					maxAge: 60 * 15 // 15 minutes
				});

				const errorMessage = data.errors?.[0]?.message || 'Login gagal';

				if (errorMessage.toLowerCase().includes('invalid credentials')) {
					return fail(401, {
						error: 'Email atau password salah',
						email
					});
				}

				return fail(400, {
					error: errorMessage,
					email
				});
			}

			// Reset login attempts on success
			cookies.delete('login_attempts', { path: '/' });

			if (!data.data?.access_token) {
				return fail(500, {
					error: 'Server tidak mengembalikan token',
					email
				});
			}

			// Professional cookie settings
			const baseCookieOptions = {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax' as const
			};

			// Access Token - 30 minutes (aligned with Directus TTL)
			// IMPORTANT: Must match Directus "Access Token TTL" setting
			cookies.set('jadihebat_auth', data.data.access_token, {
				...baseCookieOptions,
				maxAge: 30 * 60 // 30 minutes
			});

			// Refresh Token - 30 days (aligned with Directus TTL)
			// IMPORTANT: Must match Directus "Refresh Token TTL" setting
			if (data.data.refresh_token) {
				cookies.set('jadihebat_refresh', data.data.refresh_token, {
					...baseCookieOptions,
					maxAge: 60 * 60 * 24 * 30 // 30 days
				});
			}

			// Get user info with new token
			try {
				const userResponse = await fetch(`${config.baseUrl}/users/me`, {
					headers: {
						Authorization: `Bearer ${data.data.access_token}`,
						'Content-Type': 'application/json'
					}
				});

				if (userResponse.ok) {
					const userData = await userResponse.json();

					// User data cookie - store only non-sensitive fields and mark httpOnly
					// so client-side scripts cannot access PII.
					cookies.set(
						'jadihebat_user',
						JSON.stringify({
							first_name: userData.data.first_name,
							last_name: userData.data.last_name,
							avatar: userData.data.avatar ?? ''
						}),
						{
							...baseCookieOptions,
							httpOnly: true,
							maxAge: 60 * 60 * 24 * 30 // 30 days - matches refresh token
						}
					);

					// Log login success (optional)
					// console.log(`✅ User ${userData.data.email} logged in successfully`);
				}
			} catch {
				// console.error('Failed to fetch user info:', e);
			}

			throw redirect(303, '/my-courses');

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			// console.error('Login error:', error);

			if (error.status === 303) throw error;

			return fail(500, {
				error: 'Terjadi kesalahan sistem. Silakan coba lagi.',
				email
			});
		}
	}
};
