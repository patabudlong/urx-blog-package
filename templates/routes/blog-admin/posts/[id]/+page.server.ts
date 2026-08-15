import { error, fail, redirect } from '@sveltejs/kit';
import {
	deletePost,
	getPostById,
	getSessionFromCookies,
	isBlogStorageConfigured,
	resolveFeaturedImageFromForm,
	slugify,
	updatePost
} from '@urixoft/urx-blog-package';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPostById(Number(params.id));
	if (!post) error(404, 'Post not found');
	return { post, storageConfigured: isBlogStorageConfigured() };
};

export const actions: Actions = {
	update: async ({ request, cookies, params }) => {
		const user = getSessionFromCookies(cookies);
		if (!user) redirect(303, '/blog-admin/login');

		const existing = await getPostById(Number(params.id));
		if (!existing) error(404, 'Post not found');

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
			featuredImage = await resolveFeaturedImageFromForm(form, existing.featuredImage);
		} catch (uploadError) {
			return fail(400, {
				error: uploadError instanceof Error ? uploadError.message : 'Image upload failed.'
			});
		}

		await updatePost({
			id: Number(params.id),
			slug,
			title,
			excerpt: excerpt || undefined,
			content,
			category,
			featuredImage,
			status
		});

		return { success: true };
	},

	delete: async ({ cookies, params }) => {
		const user = getSessionFromCookies(cookies);
		if (!user) redirect(303, '/blog-admin/login');

		await deletePost(Number(params.id));
		redirect(303, '/blog-admin/posts');
	}
};
