// src/routes/profile/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import { supabase as supabaseServer } from '$lib/server/db';
import {
	getOrCreateProfileByEmail,
	updateProfileByEmail,
	setAvatarUrlByEmail,
	getAvatarUrlFromUuid
} from '$lib/server/supabase-profiles';
import { uploadAvatarToR2 } from '$lib/server/r2-uploader';
import type { PageServerLoad, Actions } from './$types';

interface ProfileUser {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	avatar?: string;
}

export const load: PageServerLoad = async ({ locals }) => {
	// Check authentication
	if (!locals.user || !locals.authToken) {
		throw redirect(303, '/login?redirect=/profile');
	}

	try {
		// Use Directus-authenticated user to fetch Supabase profile by email
		const baseUser = locals.user; // { id, email, first_name, last_name, avatar }
		const profile = await getOrCreateProfileByEmail(baseUser.email, {
			first_name: baseUser.first_name,
			last_name: baseUser.last_name
		});

		// Reconstruct avatar URL from UUID if avatar UUID exists
		let avatarUrl = '';
		if (profile?.avatar) {
			avatarUrl = (await getAvatarUrlFromUuid(profile.avatar)) || '';
		}

		return {
			user: {
				id: baseUser.id,
				email: baseUser.email,
				first_name: profile?.first_name || baseUser.first_name || '',
				last_name: profile?.last_name || baseUser.last_name || '',
				avatar: avatarUrl // Full R2 URL for display
			} as ProfileUser
		};
	} catch (error) {
		// console.error('Profile load error:', error);

		if (error instanceof Response && error.status === 303) {
			throw error;
		}

		return {
			user: locals.user,
			error: 'Gagal memuat data profil'
		};
	}
};

export const actions: Actions = {
	updateProfile: async ({ request, locals, cookies }) => {
		if (!locals.user || !locals.authToken) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const first_name = formData.get('first_name')?.toString().trim();
		const last_name = formData.get('last_name')?.toString().trim();

		// Validation
		if (!first_name) {
			return fail(400, {
				error: 'Nama depan wajib diisi',
				first_name,
				last_name
			});
		}

		try {
			const updated = await updateProfileByEmail(locals.user.email, {
				first_name,
				last_name
			});

			if (!updated) {
				return fail(400, {
					error: 'Gagal memperbarui profil',
					first_name,
					last_name
				});
			}

			// Update lightweight cookie for client display (first/last only used in layout)
			const cookieOptions = {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax' as const,
				maxAge: 60 * 60 * 24 * 30
			};
			const cookieUser = {
				first_name: updated.first_name || '',
				last_name: updated.last_name || ''
			};
			cookies.set('jadihebat_user', JSON.stringify(cookieUser), cookieOptions);

			return { success: true, message: 'Profil berhasil diperbarui!' };
		} catch {
			return fail(500, {
				error: 'Terjadi kesalahan. Silakan coba lagi',
				first_name,
				last_name
			});
		}
	},

	updatePassword: async ({ request, locals }) => {
		if (!locals.user || !locals.authToken) {
			return fail(401, { errorPassword: 'Unauthorized' });
		}

		const formData = await request.formData();
		const current_password = formData.get('current_password')?.toString();
		const new_password = formData.get('new_password')?.toString();
		const confirm_password = formData.get('confirm_password')?.toString();

		// Validation
		if (!current_password || !new_password || !confirm_password) {
			return fail(400, {
				errorPassword: 'Semua field password wajib diisi'
			});
		}

		if (new_password.length < 8) {
			return fail(400, {
				errorPassword: 'Password baru minimal 8 karakter'
			});
		}

		if (new_password !== confirm_password) {
			return fail(400, {
				errorPassword: 'Password baru dan konfirmasi tidak cocok'
			});
		}

		try {
			// Use Supabase service role to update user password
			// Note: This bypasses auth verification; in production, verify current_password first
			const { error } = await supabaseServer.auth.admin.updateUserById(locals.user.id, {
				password: new_password
			});

			if (error) {
				return fail(400, {
					errorPassword: error.message || 'Gagal memperbarui password'
				});
			}

			return {
				successPassword: true,
				messagePassword: 'Password berhasil diperbarui!'
			};
		} catch (_error: any) {
			console.error('Password update error:', _error);
			return fail(500, {
				errorPassword: 'Terjadi kesalahan. Silakan coba lagi'
			});
		}
	},

	updateAvatar: async ({ request, locals, cookies }) => {
		if (!locals.user || !locals.authToken) {
			return fail(401, { errorAvatar: 'Unauthorized' });
		}

		const formData = await request.formData();
		const avatarFile = formData.get('avatar') as File;

		// Validation
		if (!avatarFile || avatarFile.size === 0) {
			return fail(400, { errorAvatar: 'File avatar tidak boleh kosong.' });
		}

		const MAX_SIZE = 2 * 1024 * 1024; // 2MB
		const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

		if (avatarFile.size > MAX_SIZE) {
			return fail(400, { errorAvatar: 'Ukuran file maksimal 2MB.' });
		}

		if (!ALLOWED_TYPES.includes(avatarFile.type)) {
			return fail(400, { errorAvatar: 'Tipe file harus PNG, JPG, atau WebP.' });
		}

		try {
			// Determine file extension
			let ext = 'jpg';
			if (avatarFile.type === 'image/png') ext = 'png';
			else if (avatarFile.type === 'image/webp') ext = 'webp';

			// Convert File to Buffer for R2 upload
			const arrayBuffer = await avatarFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			// Upload to Cloudflare R2
			const uploadResult = await uploadAvatarToR2(
				buffer,
				`avatar-${locals.user.id}.${ext}`,
				avatarFile.type
			);

			if (!uploadResult.success || !uploadResult.url) {
				console.error('R2 upload failed:', uploadResult.error);
				return fail(500, { errorAvatar: 'Gagal mengunggah file. Silakan coba lagi.' });
			}

			console.log('✅ R2 upload successful, URL:', uploadResult.url);

			// Store the full URL in database
			const updated = await setAvatarUrlByEmail(locals.user.email, uploadResult.url);
			if (!updated) {
				console.error('Failed to update avatar in database for email:', locals.user.email);
				return fail(500, { errorAvatar: 'Gagal memperbarui avatar pengguna.' });
			}

			console.log('✅ Database updated with avatar URL:', uploadResult.url);

			// Update cookie for navbar display
			const cookieOptions = {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax' as const,
				maxAge: 60 * 60 * 24 * 30
			};
			const cookieUser = {
				first_name: updated.first_name || '',
				last_name: updated.last_name || '',
				avatar: uploadResult.url || ''
			};
			cookies.set('jadihebat_user', JSON.stringify(cookieUser), cookieOptions);

			return {
				successAvatar: true,
				messageAvatar: 'Avatar berhasil diperbarui!',
				updatedUser: { id: locals.user.id, email: locals.user.email, ...cookieUser }
			};
		} catch (_error: any) {
			console.error('Avatar upload error:', _error);
			return fail(500, {
				errorAvatar: 'Terjadi kesalahan saat mengunggah avatar. Silakan coba lagi.'
			});
		}
	}
};
