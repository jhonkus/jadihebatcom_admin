import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    // Return minimal, non-sensitive user info for client UI.
    // locals.user is set in hooks.server.ts when authenticated.
    const user = (locals as any).user;

    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const payload = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        avatar: user.avatar || ''
    };

    return new Response(JSON.stringify({ user: payload }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
