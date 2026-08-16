import { fail, redirect } from '@sveltejs/kit';
import {
	createSessionToken,
	getSessionCookieName,
	getSessionMaxAge,
	recordAuditEvent,
	verifyUser
} from '@urixoft/urx-cms-package';
import { cmsPaths } from '$lib/urx-cms';
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
			await recordAuditEvent({
				userEmail: email,
				action: 'auth.login_failed',
				entityType: 'auth',
				summary: `Failed sign-in attempt for ${email}`,
				metadata: { email }
			});
			return fail(401, { error: 'Invalid email or password.' });
		}

		cookies.set(getSessionCookieName(), createSessionToken(user), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: getSessionMaxAge()
		});

		await recordAuditEvent({
			userId: user.id,
			userEmail: user.email,
			action: 'auth.login',
			entityType: 'auth',
			summary: `${user.email} signed in`
		});

		redirect(303, cmsPaths.root);
	}
};
