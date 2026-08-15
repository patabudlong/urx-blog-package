import { fail, redirect } from '@sveltejs/kit';
import {
	createSessionToken,
	getSessionCookieName,
	getSessionMaxAge,
	verifyUser
} from '@urixoft/urx-blog-package';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({});

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		const user = await verifyUser(email, password);
		if (!user) {
			return fail(401, { error: 'Invalid email or password.' });
		}

		cookies.set(getSessionCookieName(), createSessionToken(user), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: getSessionMaxAge()
		});

		redirect(303, '/blog-admin');
	}
};
