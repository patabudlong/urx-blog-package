import { redirect } from '@sveltejs/kit';
import { getSessionCookieName } from '@urixoft/urx-blog-package';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		cookies.delete(getSessionCookieName(), { path: '/' });
		redirect(303, '/blog-admin/login');
	}
};
