import { redirect } from '@sveltejs/kit';
import { getSessionFromCookies } from '@urixoft/urx-cms-package';
import { cmsPaths } from '$lib/urx-cms';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const user = getSessionFromCookies(cookies);
	const isLogin = url.pathname === cmsPaths.login;

	if (!user && !isLogin) {
		redirect(303, cmsPaths.login);
	}

	if (user && isLogin) {
		redirect(303, cmsPaths.root);
	}

	return { user };
};
