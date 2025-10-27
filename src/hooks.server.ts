// src/hooks.server.ts - Hardened authentication middleware
import { redirect, type Handle, type Cookies } from '@sveltejs/kit';
import { API_BASE_URL } from '$env/static/private';

interface TokenResponse {
	access_token: string;
	refresh_token?: string;
	expires: number;
}

interface DirectusUser {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	avatar?: string;
}

interface UserFetchResult {
	user: DirectusUser | null;
	status: number;
}

function sanitizeUserForCookie(user: DirectusUser) {
	// Only include non-sensitive fields for cookies.
	// Do NOT include id or email here to avoid exposing PII to client-side scripts.
	return {
		first_name: user.first_name ?? '',
		last_name: user.last_name ?? '',
		avatar: user.avatar ?? ''
	};
}

function setUserCookie(cookies: Cookies, user: DirectusUser, secure: boolean) {
	const serialized = JSON.stringify(sanitizeUserForCookie(user));

	// Make this cookie httpOnly so client-side JS cannot read it.
	// Server-side loads can still read it via the cookies API.
	cookies.set('jadihebat_user', serialized, {
		path: '/',
		httpOnly: true,
		secure,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30 // 30 days - keep aligned with refresh token
	});
}

function clearAuthCookies(cookies: Cookies) {
	['jadihebat_auth', 'jadihebat_refresh', 'jadihebat_user'].forEach((cookieName) => {
		cookies.delete(cookieName, { path: '/' });
	});
}

async function fetchDirectusUser(token: string): Promise<UserFetchResult> {
	if (!token) {
		return { user: null, status: 401 };
	}

	try {
		const response = await fetch(
			`${API_BASE_URL}/users/me?fields=id,email,first_name,last_name,avatar.filename_disk`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			}
		);

		if (!response.ok) {
			return { user: null, status: response.status };
		}

		const payload = await response.json();
		const data = payload?.data;

		if (!data?.id) {
			return { user: null, status: 500 };
		}

		return {
			user: {
				id: data.id,
				email: data.email ?? '',
				first_name: data.first_name ?? '',
				last_name: data.last_name ?? '',
				avatar: data.avatar?.filename_disk ?? ''
			},
			status: response.status
		};
	} catch {
		return { user: null, status: 0 };
	}
}

async function refreshAccessToken(refreshToken: string): Promise<TokenResponse | null> {
	try {
		const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				refresh_token: refreshToken,
				mode: 'json'
			})
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();

		return {
			access_token: data.data.access_token,
			refresh_token: data.data.refresh_token,
			expires: Date.now() + 15 * 60 * 1000
		};
	} catch {
		return null;
	}
}

const authMiddleware: Handle = async ({ event, resolve }) => {
	const { cookies, url, locals } = event;

	const accessToken = cookies.get('jadihebat_auth');
	const refreshToken = cookies.get('jadihebat_refresh');

	let currentAccessToken: string | undefined = accessToken;
	let currentUser: DirectusUser | null = null;
	const secureCookies = process.env.NODE_ENV === 'production';

	const accessTokenCookieOptions = {
		path: '/',
		httpOnly: true,
		secure: secureCookies,
		sameSite: 'lax' as const,
		maxAge: 30 * 60 // 30 minutes - must match Directus TTL configuration
	};

	const refreshTokenCookieOptions = {
		...accessTokenCookieOptions,
		maxAge: 60 * 60 * 24 * 30 // 30 days - must match Directus TTL configuration
	};

	if (currentAccessToken) {
		const { user, status } = await fetchDirectusUser(currentAccessToken);

		if (user) {
			currentUser = user;
		} else if (status === 401 && refreshToken) {
			const newTokens = await refreshAccessToken(refreshToken);

			if (newTokens) {
				cookies.set('jadihebat_auth', newTokens.access_token, accessTokenCookieOptions);

				if (newTokens.refresh_token) {
					cookies.set('jadihebat_refresh', newTokens.refresh_token, refreshTokenCookieOptions);
				}

				currentAccessToken = newTokens.access_token;
				const refreshed = await fetchDirectusUser(newTokens.access_token);

				if (refreshed.user) {
					currentUser = refreshed.user;
				} else {
					clearAuthCookies(cookies);
					currentAccessToken = undefined;
				}
			} else {
				clearAuthCookies(cookies);
				currentAccessToken = undefined;
			}
		} else if (status === 401) {
			clearAuthCookies(cookies);
			currentAccessToken = undefined;
		} else {
			// Non-401 failures (403, 5xx, network) -> leave tokens but require fresh validation later.
			currentUser = null;
		}
	} else {
		cookies.delete('jadihebat_user', { path: '/' });
	}

	if (currentUser) {
		// Set user cookie with current avatar data (R2 URLs are stable)
		setUserCookie(cookies, currentUser, secureCookies);
	} else if (!currentAccessToken) {
		cookies.delete('jadihebat_user', { path: '/' });
	}

	locals.user = currentUser;
	locals.authToken = currentAccessToken ?? null;

	const isLoggedIn = !!(locals.user && locals.authToken);
	const pathname = url.pathname;

	const protectedRoutes = ['/learning', '/profile', '/admin', '/settings', '/dashboard'];
	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

	const publicRoutes = ['/login', '/register', '/forgot-password'];
	const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

	if (isProtectedRoute && !isLoggedIn) {
		const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}&reason=auth_required`;
		throw redirect(303, redirectUrl);
	}

	if (isPublicRoute && isLoggedIn) {
		throw redirect(303, '/admin/lessons');
	}

	const response = await resolve(event);

	// Add common security headers to every response. Keep values conservative and
	// avoid breaking legitimate features (adjust later if needed).
	try {
		const headers = response.headers;
		// Prevent MIME sniffing
		headers.set('X-Content-Type-Options', 'nosniff');
		// Clickjacking protection
		headers.set('X-Frame-Options', 'DENY');
		// Basic referrer policy
		headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
		// Disable cross-site scripting in older browsers
		headers.set('X-XSS-Protection', '1; mode=block');
		// Content Security Policy (minimal, can be tightened)
		// Allows same-origin scripts/styles and inline styles (if your app uses them).
		// Update this policy if you use external CDNs or inline scripts/styles intentionally.
		if (process.env.NODE_ENV === 'production') {
			headers.set(
				'Content-Security-Policy',
				"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self';"
			);
			// Enforce HTTPS for 6 months
			headers.set('Strict-Transport-Security', 'max-age=15768000; includeSubDomains; preload');
		}
	} catch (e) {
		// If setting headers fails for some reason, don't break the response flow.
		// eslint-disable-next-line no-console
		console.warn('Failed to set security headers:', e);
	}

	return response;
};

export const handle = authMiddleware;
