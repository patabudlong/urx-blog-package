import { fail, isRedirect, redirect } from '@sveltejs/kit';
import {
	deletePost,
	duplicatePost,
	getPostQuotaSnapshot,
	getSessionFromCookies,
	isCmsPostKind,
	listAllPostsWithAuthors,
	PostLimitError,
	toAuditActor
} from '@urixoft/urx-cms-package';
import { cmsPaths } from '$lib/urx-cms';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const kindParam = url.searchParams.get('kind');
	const kind = isCmsPostKind(kindParam) ? kindParam : undefined;
	const quota = await getPostQuotaSnapshot();

	return {
		posts: listAllPostsWithAuthors(kind),
		quota,
		filter: kind ?? 'all'
	};
};

export const actions: Actions = {
	duplicate: async ({ request, cookies }) => {
		const user = getSessionFromCookies(cookies);
		if (!user) redirect(303, cmsPaths.login);

		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!Number.isFinite(id) || id <= 0) {
			return fail(400, { error: 'Post not found.' });
		}

		try {
			const newId = await duplicatePost(id, {
				authorId: user.id,
				auditActor: toAuditActor(user)
			});
			redirect(303, cmsPaths.editPost(newId));
		} catch (error) {
			if (isRedirect(error)) throw error;
			return fail(error instanceof PostLimitError ? 403 : 400, {
				error: error instanceof Error ? error.message : 'Could not duplicate post.'
			});
		}
	},

	delete: async ({ request, cookies }) => {
		const user = getSessionFromCookies(cookies);
		if (!user) redirect(303, cmsPaths.login);

		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!Number.isFinite(id) || id <= 0) {
			return fail(400, { error: 'Post not found.' });
		}

		await deletePost(id, toAuditActor(user));
		return { deleted: true };
	}
};
