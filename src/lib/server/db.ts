// PostgreSQL database client using official Supabase JS client
// Works in both Node.js (local dev) and Cloudflare Workers (edge runtime)
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY;

// Use service role key for server-side operations (bypasses RLS)
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Client for server-side operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		persistSession: false, // Disable session persistence for server-side usage
		autoRefreshToken: false
	}
});

// Log which key type is being used (only in non-production)
if (process.env.NODE_ENV !== 'production') {
	if (SUPABASE_SERVICE_ROLE_KEY) {
		// eslint-disable-next-line no-console
		console.log('✅ Using Supabase service role key (bypasses RLS)');
	} else {
		// eslint-disable-next-line no-console
		console.log('⚠️  Using Supabase anon key (RLS enabled - may have permission issues)');
		// eslint-disable-next-line no-console
		console.log('   Add SUPABASE_SERVICE_ROLE_KEY to .env for full server-side access');
	}
}

// Public client (for read operations with RLS)
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: false
	}
});
