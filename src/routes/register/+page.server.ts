// routes/register/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { directusAdmin } from '$lib/server/directus-admin';
import { createUser } from '@directus/sdk';
import { API_DEFAULT_ROLE_ID } from '$env/static/private'; // ✅ CARA YANG BENAR
import type { Actions, PageServerLoad } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		// Redirect jika sudah login
		const userCookie = cookies.get('jadihebat_user');
		if (userCookie) {
			throw redirect(303, '/');
		}

		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim();
		const password = formData.get('password')?.toString().trim();
		const full_name = formData.get('full_name')?.toString().trim();
		const last_name = formData.get('last_name')?.toString().trim() || '';

		// Validation
		if (!email || !password || !full_name) {
			return fail(400, {
				error: 'Semua field wajib diisi',
				email,
				full_name
			});
		}

		if (password.length < 8) {
			return fail(400, {
				error: 'Password harus minimal 8 karakter',
				email,
				full_name
			});
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return fail(400, {
				error: 'Format email tidak valid',
				email,
				full_name
			});
		}

		// ✅ CARA BACA ENV YANG BENAR
		const roleId = API_DEFAULT_ROLE_ID;
		if (!roleId) {
			// console.error('API_DEFAULT_ROLE_ID tidak ditemukan di environment variables');
			return fail(500, {
				error: 'Konfigurasi server tidak lengkap',
				email,
				full_name
			});
		}

		try {
			// Create user in Directus
			await directusAdmin.request(
				createUser({
					email: email.toLowerCase(),
					password,
					first_name: full_name,
					last_name: last_name || '---',
					role: roleId,
					status: 'active'
				})
			);

			return {
				success: true,
				message: 'Registrasi berhasil! Silakan login.'
			};
		} catch (_error: any) {
			// console.error('Registration error:', _error);

			// Handle Directus errors
			if (_error.errors && Array.isArray(_error.errors)) {
				const firstError = _error.errors[0];
				const errorMessage = firstError?.message || 'Registrasi gagal';

				// Check for duplicate email
				if (
					errorMessage.toLowerCase().includes('unique') ||
					errorMessage.toLowerCase().includes('duplicate') ||
					errorMessage.toLowerCase().includes('already exists')
				) {
					return fail(400, {
						error: 'Email sudah terdaftar. Silakan gunakan email lain.',
						email,
						full_name
					});
				}

				return fail(400, {
					error: errorMessage,
					email,
					full_name
				});
			}

			// Network/connection errors
			if (
				_error.message?.toLowerCase().includes('fetch') ||
				_error.message?.toLowerCase().includes('network')
			) {
				return fail(500, {
					error: 'Tidak dapat terhubung ke server',
					email,
					full_name
				});
			}

			return fail(500, {
				error: 'Terjadi kesalahan. Silakan coba lagi.',
				email,
				full_name
			});
		}
	}
};

// Server-side redirect untuk yang sudah login
export const load: PageServerLoad = async ({ cookies }) => {
	const userCookie = cookies.get('jadihebat_user');
	if (userCookie) {
		throw redirect(303, '/');
	}

	return {};
};
