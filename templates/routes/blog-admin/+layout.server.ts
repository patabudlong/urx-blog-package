import { redirect } from '@sveltejs/kit';
import { getSessionFromCookies } from '@urixoft/urx-blog-package';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const user = getSessionFromCookies(cookies);
	const isLogin = url.pathname === '/blog-admin/login';

	if (!user && !isLogin) {
		redirect(303, '/blog-admin/login');
	}

	if (user && isLogin) {
		redirect(303, '/blog-admin');
	}

	return { user };
};
