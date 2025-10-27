// Supabase Profiles helper: read and update user profiles from directus_users
import { supabase } from './db';

export interface SupabaseProfile {
	id?: string;
	email: string;
	first_name?: string | null;
	last_name?: string | null;
	avatar?: string | null; // UUID reference to directus_files
	description?: string | null;
	location?: string | null;
	title?: string | null;
	language?: string | null;
}

const PROFILES_TABLE = 'directus_users';

export async function getOrCreateProfileByEmail(
	email: string,
	defaults?: Partial<SupabaseProfile>
): Promise<SupabaseProfile | null> {
	if (!email) return null;

	// Try fetch existing
	const { data, error } = await supabase
		.from(PROFILES_TABLE)
		.select('id, email, first_name, last_name, avatar, description, location, title, language')
		.eq('email', email)
		.single();

	if (!error && data) return data as SupabaseProfile;

	// Create if not exists
	const insertPayload: any = {
		email,
		first_name: defaults?.first_name ?? null,
		last_name: defaults?.last_name ?? null
	};

	const { data: created, error: insertError } = await supabase
		.from(PROFILES_TABLE)
		.insert(insertPayload)
		.select('id, email, first_name, last_name, avatar')
		.single();

	if (insertError) {
		console.error('Failed to create profile:', insertError);
		return null;
	}
	return created as SupabaseProfile;
}

export async function updateProfileByEmail(
	email: string,
	patch: Partial<Pick<SupabaseProfile, 'first_name' | 'last_name'>>
): Promise<SupabaseProfile | null> {
	if (!email) return null;

	const { data, error } = await supabase
		.from(PROFILES_TABLE)
		.update({
			first_name: patch.first_name ?? null,
			last_name: patch.last_name ?? null
		})
		.eq('email', email)
		.select('id, email, first_name, last_name, avatar')
		.single();

	if (error) {
		console.error('Failed to update profile:', {
			message: error.message,
			code: error.code,
			details: error.details,
			email,
			patch
		});
		return null;
	}
	return data as SupabaseProfile;
}

export async function setAvatarUrlByEmail(
	email: string,
	avatarUrl: string
): Promise<SupabaseProfile | null> {
	if (!email || !avatarUrl) {
		console.error('setAvatarUrlByEmail: Missing email or avatarUrl', { email, avatarUrl });
		return null;
	}

	console.log('🔄 Updating avatar for email:', email, 'with value:', avatarUrl);

	// Store the UUID or public URL directly in avatar field
	const { data, error } = await supabase
		.from(PROFILES_TABLE)
		.update({ avatar: avatarUrl })
		.eq('email', email)
		.select('id, email, first_name, last_name, avatar')
		.single();

	if (error) {
		console.error('❌ Failed to set avatar:', {
			message: error.message,
			code: error.code,
			details: error.details,
			email,
			avatarUrl
		});
		return null;
	}

	console.log('✅ Avatar updated successfully:', data);
	return data as SupabaseProfile;
}

export function buildAvatarPath(opts: {
	directusUserId?: string;
	email: string;
	fileExt: string;
}): string {
	// Simple filename for now - actual UUID will be generated during R2 upload
	// This is just for backward compatibility
	const ts = Date.now();
	return `avatars/${ts}.${opts.fileExt}`;
}

/**
 * Reconstructs R2 avatar URL from UUID
 * Since we store UUID and uploaded with known extension, just reconstruct the URL
 */
export async function getAvatarUrlFromUuid(
	avatarUuid: string | null | undefined
): Promise<string | null> {
	if (!avatarUuid) {
		console.log('🔄 getAvatarUrlFromUuid: avatarUuid is empty');
		return null;
	}

	// If it's already a full URL, return it
	if (avatarUuid.startsWith('http')) {
		return avatarUuid;
	}

	// Legacy: if it's a UUID, construct URL (fallback for old data)
	console.log('� getAvatarUrlFromUuid: Legacy UUID detected, constructing URL');
	const fallbackUrl = `${process.env.STORAGE_R2_PUBLIC_URL || 'https://assets2.jadihebat.com'}/avatars/${avatarUuid}.jpg`;
	console.log('📌 Fallback avatar URL:', fallbackUrl);
	return fallbackUrl;
}
