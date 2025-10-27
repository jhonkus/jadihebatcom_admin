// src/lib/server/directus.ts - Admin operations only (no course data)
import { createDirectus, rest, staticToken } from '@directus/sdk';
import { API_BASE_URL, API_ADMIN_TOKEN } from '$env/static/private';

export interface DirectusCollections {
	// Only admin collections here - courses moved to Supabase
}

/**
 * Initialize Directus Client (admin only)
 */
export const directus = createDirectus<DirectusCollections>(API_BASE_URL)
	.with(staticToken(API_ADMIN_TOKEN))
	.with(rest());
