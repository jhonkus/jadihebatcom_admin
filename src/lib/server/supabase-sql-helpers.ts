// Alternative approach: Use raw SQL with service role key
// This bypasses RLS entirely and works with the powerful service role

import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

const supabaseUrl = PUBLIC_SUPABASE_URL;

// Create a client specifically for direct SQL execution
export const supabaseSQL = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
	auth: {
		persistSession: false,
		autoRefreshToken: false
	}
});

/**
 * Update user profile using raw SQL (bypasses RLS completely)
 * This is more reliable than the REST API for service role operations
 */
export async function updateProfileByEmailSQL(
	email: string,
	data: {
		first_name?: string | null;
		last_name?: string | null;
		avatar?: string | null;
	}
) {
	const updateClauses: string[] = [];
	const values: any[] = [];
	let paramIndex = 1;

	if (data.first_name !== undefined) {
		updateClauses.push(`first_name = $${paramIndex++}`);
		values.push(data.first_name);
	}
	if (data.last_name !== undefined) {
		updateClauses.push(`last_name = $${paramIndex++}`);
		values.push(data.last_name);
	}
	if (data.avatar !== undefined) {
		updateClauses.push(`avatar = $${paramIndex++}`);
		values.push(data.avatar);
	}

	if (updateClauses.length === 0) {
		return null;
	}

	values.push(email);

	const sql = `
    UPDATE public.directus_users
    SET ${updateClauses.join(', ')}
    WHERE email = $${paramIndex}
    RETURNING id, email, first_name, last_name, avatar;
  `;

	try {
		const { data: result, error } = await supabaseSQL.rpc('exec_sql', {
			sql_query: sql,
			params: values
		});

		if (error) throw error;
		return result?.[0] || null;
	} catch (error) {
		console.error('SQL update failed:', error);
		return null;
	}
}

/**
 * Alternative: Use the REST API but with explicit select
 * Sometimes Supabase REST has issues with RLS, try simpler approach
 */
export async function updateProfileByEmailREST(email: string, data: Record<string, any>) {
	const { data: result, error } = await supabaseSQL
		.from('directus_users')
		.update(data)
		.eq('email', email)
		.select('id, email, first_name, last_name, avatar')
		.single();

	if (error) {
		console.error('REST API update error:', {
			code: error.code,
			message: error.message,
			details: error.details
		});
		return null;
	}

	return result;
}
