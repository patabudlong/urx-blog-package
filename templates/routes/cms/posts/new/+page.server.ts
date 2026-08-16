import { fail, isRedirect, redirect } from '@sveltejs/kit';
import {
	createPost,
	getPostQuotaSnapshot,
	getSessionFromCookies,
	isBlogStorageConfigured,
	listCategories,
	normalizePostKind,
	PostLimitError,
	resolveFeaturedImageFromForm,
	slugify,
	toAuditActor
} from '@urixoft/urx-cms-package';
import { cmsPaths } from '$lib/urx-cms';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	storageConfigured: isBlogStorageConfigured(),
	categories: await listCategories(),
	quota: await getPostQuotaSnapshot()
});

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const user = getSessionFromCookies(cookies);
		if (!user) redirect(303, cmsPaths.login);

		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		const excerpt = String(form.get('excerpt') ?? '').trim();
		const content = String(form.get('content') ?? '').trim();
		const category = String(form.get('category') ?? '').trim();
		const kind = normalizePostKind(form.get('kind'));
		const status = String(form.get('status') ?? 'draft') as 'draft' | 'published';
		const slugInput = String(form.get('slug') ?? '').trim();
		const slug = slugify(slugInput || title);

		if (!title || !content) {
			return fail(400, { error: 'Title and content are required.' });
		}

		if (!category) {
			return fail(400, { error: 'Category is required.' });
		}

		let featuredImage: string | undefined;
		try {
			featuredImage = await resolveFeaturedImageFromForm(form);
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Image upload failed.'
			});
		}

		try {
			const id = await createPost({
				slug,
				title,
				excerpt: excerpt || undefined,
				content,
				category,
				kind,
				featuredImage,
				status,
				authorId: user.id,
				auditActor: toAuditActor(user)
			});

			redirect(303, cmsPaths.editPost(id));
		} catch (error) {
			if (isRedirect(error)) throw error;
			return fail(error instanceof PostLimitError ? 403 : 400, {
				error: error instanceof Error ? error.message : 'Could not create post.'
			});
		}
	}
};
