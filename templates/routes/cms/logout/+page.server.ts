import { redirect } from '@sveltejs/kit';
import { getSessionCookieName } from '@urixoft/urx-cms-package';
import { cmsPaths } from '$lib/urx-cms';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		cookies.delete(getSessionCookieName(), { path: '/' });
		redirect(303, cmsPaths.login);
	}
};
