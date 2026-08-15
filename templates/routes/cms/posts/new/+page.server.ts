import { fail, redirect } from '@sveltejs/kit';
import {
	createPost,
	getSessionFromCookies,
	isBlogStorageConfigured,
	resolveFeaturedImageFromForm,
	slugify
} from '@urixoft/urx-cms-package';
import { cmsPaths } from '$lib/urx-cms';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	storageConfigured: isBlogStorageConfigured()
});

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const user = getSessionFromCookies(cookies);
		if (!user) redirect(303, cmsPaths.login);

		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		const excerpt = String(form.get('excerpt') ?? '').trim();
		const content = String(form.get('content') ?? '').trim();
		const category = String(form.get('category') ?? 'News').trim();
		const status = String(form.get('status') ?? 'draft') as 'draft' | 'published';
		const slug = slugify(String(form.get('slug') ?? title));

		if (!title || !content) {
			return fail(400, { error: 'Title and content are required.' });
		}

		let featuredImage: string | undefined;
		try {
			featuredImage = await resolveFeaturedImageFromForm(form);
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Image upload failed.'
			});
		}

		const id = await createPost({
			slug,
			title,
			excerpt: excerpt || undefined,
			content,
			category,
			featuredImage,
			status,
			authorId: user.id
		});

		redirect(303, cmsPaths.editPost(id));
	}
};
