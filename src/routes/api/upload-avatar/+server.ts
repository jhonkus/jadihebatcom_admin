import { json, error, type RequestEvent } from '@sveltejs/kit';
import { setAvatarUrlByEmail } from '$lib/server/supabase-profiles';
import { uploadAvatarToR2 } from '$lib/server/r2-uploader';

export const POST = async ({ request, locals }: RequestEvent) => {
	if (!locals.user || !locals.authToken) {
		throw error(401, 'Unauthorized');
	}

	try {
		const formData = await request.formData();
		const avatarFile = formData.get('avatar') as File;

		if (!avatarFile || avatarFile.size === 0) {
			throw error(400, 'No file provided');
		}

		// Validate file size (2MB limit)
		const MAX_SIZE = 2 * 1024 * 1024;
		if (avatarFile.size > MAX_SIZE) {
			throw error(400, 'File too large. Maximum size is 2MB.');
		}

		// Validate file type
		const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
		if (!ALLOWED_TYPES.includes(avatarFile.type)) {
			throw error(400, 'Invalid file type. Only PNG, JPG, and WebP are allowed.');
		}

		// Determine extension
		let ext = 'jpg';
		if (avatarFile.type === 'image/png') ext = 'png';
		else if (avatarFile.type === 'image/webp') ext = 'webp';

		// Convert file to buffer
		const arrayBuffer = await avatarFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Upload to R2
		const uploadResult = await uploadAvatarToR2(
			buffer,
			`avatar-${locals.user.id}.${ext}`,
			avatarFile.type
		);

		if (!uploadResult.success || !uploadResult.url) {
			console.error('R2 upload failed:', uploadResult.error);
			throw error(500, 'Failed to upload avatar');
		}

		const avatarUrl = uploadResult.url;

		const updated = await setAvatarUrlByEmail(locals.user.email, avatarUrl);
		if (!updated) {
			throw error(500, 'Failed to update user profile');
		}

		return json({ success: true, message: 'Avatar uploaded successfully', avatarUrl });
	} catch (_err) {
		console.error('Avatar upload error:', _err);
		if (_err instanceof Response) {
			throw _err;
		}
		throw error(500, 'Internal server error');
	}
};
