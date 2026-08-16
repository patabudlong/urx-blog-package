import { error, fail, isRedirect, redirect } from '@sveltejs/kit';
import {
	deletePost,
	duplicatePost,
	getConfiguredBlogBasePath,
	getPostById,
	getPostQuotaSnapshot,
	getSessionFromCookies,
	isBlogStorageConfigured,
	listCategories,
	normalizePostKind,
	PostLimitError,
	resolveFeaturedImageFromForm,
	slugify,
	toAuditActor,
	updatePost
} from '@urixoft/urx-cms-package';
import { cmsPaths } from '$lib/urx-cms';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPostById(Number(params.id));
	if (!post) error(404, 'Post not found');
	return {
		post,
		categories: await listCategories(),
		storageConfigured: isBlogStorageConfigured(),
		blogBasePath: getConfiguredBlogBasePath(),
		quota: await getPostQuotaSnapshot()
	};
};

export const actions: Actions = {
	update: async ({ request, cookies, params }) => {
		const user = getSessionFromCookies(cookies);
		if (!user) redirect(303, cmsPaths.login);

		const existing = await getPostById(Number(params.id));
		if (!existing) error(404, 'Post not found');

		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		const excerpt = String(form.get('excerpt') ?? '').trim();
		const content = String(form.get('content') ?? '').trim();
		const category = String(form.get('category') ?? 'News').trim();
		const kind = normalizePostKind(form.get('kind'));
		const status = String(form.get('status') ?? 'draft') as 'draft' | 'published';
		const slug = slugify(String(form.get('slug') ?? title));

		if (!title || !content) {
			return fail(400, { error: 'Title and content are required.' });
		}

		let featuredImage: string | undefined;
		try {
			featuredImage = await resolveFeaturedImageFromForm(form, existing.featuredImage);
		} catch (uploadError) {
			return fail(400, {
				error: uploadError instanceof Error ? uploadError.message : 'Image upload failed.'
			});
		}

		try {
			await updatePost({
				id: Number(params.id),
				slug,
				title,
				excerpt: excerpt || undefined,
				content,
				category,
				kind,
				featuredImage,
				status,
				auditActor: toAuditActor(user)
			});
		} catch (updateError) {
			return fail(updateError instanceof PostLimitError ? 403 : 400, {
				error: updateError instanceof Error ? updateError.message : 'Could not save post.'
			});
		}

		return { success: true };
	},

	duplicate: async ({ cookies, params }) => {
		const user = getSessionFromCookies(cookies);
		if (!user) redirect(303, cmsPaths.login);

		try {
			const newId = await duplicatePost(Number(params.id), {
				authorId: user.id,
				auditActor: toAuditActor(user)
			});
			redirect(303, cmsPaths.editPost(newId));
		} catch (duplicateError) {
			if (isRedirect(duplicateError)) throw duplicateError;
			return fail(duplicateError instanceof PostLimitError ? 403 : 400, {
				error: duplicateError instanceof Error ? duplicateError.message : 'Could not duplicate post.'
			});
		}
	},

	delete: async ({ cookies, params }) => {
		const user = getSessionFromCookies(cookies);
		if (!user) redirect(303, cmsPaths.login);

		await deletePost(Number(params.id), toAuditActor(user));
		redirect(303, cmsPaths.posts);
	}
};
