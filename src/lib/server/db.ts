// PostgreSQL database client using official Supabase JS client
// Works in both Node.js (local dev) and Cloudflare Workers (edge runtime)
// Use dynamic env access to avoid build-time errors when some env vars
// are missing during local builds. Prefer defining these in your .env
// for production builds so they are available as static exports.
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = publicEnv.PUBLIC_SUPABASE_ANON_KEY || '';

// Fail fast with a clear message if required Supabase config is missing.
// Creating the Supabase client with an empty URL causes an opaque runtime
// error deep inside the Supabase library; detect this early and provide
// actionable guidance instead.
if (!supabaseUrl) {
	throw new Error(
		'Missing environment variable PUBLIC_SUPABASE_URL.\n' +
			'Set PUBLIC_SUPABASE_URL in your environment (or .env) to your Supabase URL, e.g. https://xyz.supabase.co'
	);
}
if (!supabaseAnonKey && !privateEnv.SUPABASE_SERVICE_ROLE_KEY) {
	throw new Error(
		'Missing Supabase keys.\n' +
			'Set either PUBLIC_SUPABASE_ANON_KEY (for anon client) or SUPABASE_SERVICE_ROLE_KEY (server-only) in your environment.'
	);
}

// Use service role key for server-side operations (bypasses RLS)
const supabaseKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Client for server-side operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		persistSession: false, // Disable session persistence for server-side usage
		autoRefreshToken: false
	}
});

// Log which key type is being used (only in non-production)
if (process.env.NODE_ENV !== 'production') {
	if (privateEnv.SUPABASE_SERVICE_ROLE_KEY) {
		console.log('✅ Using Supabase service role key (bypasses RLS)');
	} else {
		console.log('⚠️  Using Supabase anon key (RLS enabled - may have permission issues)');
		console.log('   Add SUPABASE_SERVICE_ROLE_KEY to .env for full server-side access');
	}
}

// Public client (for read operations with RLS)
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: false
	}
});
