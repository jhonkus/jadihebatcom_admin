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
