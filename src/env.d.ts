/// <reference types="vite/client" />
/// <reference types="@sveltejs/kit" />

// Declare SvelteKit environment variables
declare module '$env/static/private' {
	// Main App
	export const API_BASE_URL: string;
	export const API_ADMIN_TOKEN: string;
	export const API_DEFAULT_ROLE_ID: string;

	// Blog
	export const BLOG_ASSETS_URL: string;

	// TursoDB
	export const TRS_DATABASE_URL: string;
	export const TRS_AUTH_TOKEN: string;

	// Neon PostgreSQL (for quiz)
	export const NEON_DB_URL: string;

	// Node Environment
	export const NODE_ENV: 'development' | 'production';
}

declare module '$env/dynamic/private' {
	export const env: {
		API_BASE_URL?: string;
		API_ADMIN_TOKEN?: string;
		API_DEFAULT_ROLE_ID?: string;
		BLOG_ASSETS_URL?: string;
		TRS_DATABASE_URL?: string;
		TRS_AUTH_TOKEN?: string;
		NEON_DB_URL?: string;
		// R2 Storage (optional)
		STORAGE_R2_ACCESS_KEY_ID?: string;
		STORAGE_R2_SECRET_ACCESS_KEY?: string;
		STORAGE_R2_ENDPOINT?: string;
		STORAGE_R2_BUCKET_NAME?: string;
		STORAGE_R2_PUBLIC_URL?: string;
	};
}

declare module '$env/static/public' {
	// Public variables (jika ada)
	// export const PUBLIC_API_URL: string;
}

// Global App Types
declare namespace App {}
