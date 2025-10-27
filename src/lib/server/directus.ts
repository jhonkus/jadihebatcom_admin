// src/lib/server/directus.ts - Admin operations only (no course data)
import { createDirectus, rest, staticToken } from '@directus/sdk';
import { env as privateEnv } from '$env/dynamic/private';

export interface DirectusCollections {
	// Only admin collections here - courses moved to Supabase
}

const API_BASE_URL = privateEnv.API_BASE_URL || '';
const API_ADMIN_TOKEN = privateEnv.API_ADMIN_TOKEN || '';

/**
 * Initialize Directus Client (admin only)
 */
export const directus = createDirectus<DirectusCollections>(API_BASE_URL)
	.with(staticToken(API_ADMIN_TOKEN))
	.with(rest());
