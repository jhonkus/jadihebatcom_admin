// src/lib/server/directus-admin.ts - Admin Operations (User Registration, etc)
import { createDirectus, rest, staticToken } from '@directus/sdk';
import { env as privateEnv } from '$env/dynamic/private';

const API_BASE_URL = privateEnv.API_BASE_URL || '';
const API_ADMIN_TOKEN = privateEnv.API_ADMIN_TOKEN || '';
const API_DEFAULT_ROLE_ID = privateEnv.API_DEFAULT_ROLE_ID || '';

// Validation
if (!API_BASE_URL) {
	throw new Error('❌ API_BASE_URL is not configured in environment variables');
}

if (!API_ADMIN_TOKEN) {
	console.warn('⚠️  API_ADMIN_TOKEN not set. User registration may fail.');
} else {
	// console.log('✅ API_ADMIN_TOKEN is configured');
}

if (!API_DEFAULT_ROLE_ID) {
	console.warn('⚠️  API_DEFAULT_ROLE_ID not set. User registration may fail.');
} else {
	// console.log('✅ API_DEFAULT_ROLE_ID is configured');
}

// Define a schema for admin-related collections
interface AdminSchema {
	users: {
		id: string;
		email: string;
		first_name: string;
		last_name: string;
		avatar: string; // Foreign key to directus_files
	}[];
	files: {
		id: string;
		// Add other file properties if needed
	}[];
}

/**
 * Directus Admin Client (with admin token)
 * Used for privileged operations like user registration
 */
export const directusAdmin = createDirectus<AdminSchema>(API_BASE_URL)
	.with(staticToken(API_ADMIN_TOKEN))
	.with(rest());

/**
 * Export config for server-side use
 */
export const config = {
	baseUrl: API_BASE_URL,
	defaultRoleId: API_DEFAULT_ROLE_ID,
	adminToken: API_ADMIN_TOKEN
};
