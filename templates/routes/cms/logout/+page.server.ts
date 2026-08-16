import { redirect } from '@sveltejs/kit';
import { getSessionCookieName, getSessionFromCookies, recordAuditEvent } from '@urixoft/urx-cms-package';
import { cmsPaths } from '$lib/urx-cms';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const user = getSessionFromCookies(cookies);

		if (user) {
			await recordAuditEvent({
				userId: user.id,
				userEmail: user.email,
				action: 'auth.logout',
				entityType: 'auth',
				summary: `${user.email} signed out`
			});
		}

		cookies.delete(getSessionCookieName(), { path: '/' });
		redirect(303, cmsPaths.login);
	}
};
