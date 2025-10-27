// src/app.d.ts
declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				email: string;
				first_name: string;
				last_name: string;
			} | null;
			authToken: string | null;
		}

		interface PageData {
			user?: {
				// Only non-sensitive user data is exposed to client
				first_name: string;
				last_name: string;
				// For sensitive data (id, email), use locals.user on server-side
			} | null;
		}
	}
}

export {};
