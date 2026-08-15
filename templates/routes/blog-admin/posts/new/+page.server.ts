import { fail, redirect } from '@sveltejs/kit';
import { createPost, getSessionFromCookies, slugify } from '@urixoft/urx-blog-package';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({});

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const user = getSessionFromCookies(cookies);
		if (!user) redirect(303, '/blog-admin/login');

		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		const excerpt = String(form.get('excerpt') ?? '').trim();
		const content = String(form.get('content') ?? '').trim();
		const category = String(form.get('category') ?? 'News').trim();
		const featuredImage = String(form.get('featuredImage') ?? '').trim();
		const status = String(form.get('status') ?? 'draft') as 'draft' | 'published';
		const slug = slugify(String(form.get('slug') ?? title));

		if (!title || !content) {
			return fail(400, { error: 'Title and content are required.' });
		}

		const id = await createPost({
			slug,
			title,
			excerpt: excerpt || undefined,
			content,
			category,
			featuredImage: featuredImage || undefined,
			status,
			authorId: user.id
		});

		redirect(303, `/blog-admin/posts/${id}`);
	}
};
