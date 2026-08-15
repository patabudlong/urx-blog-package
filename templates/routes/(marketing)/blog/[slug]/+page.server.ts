import { error } from '@sveltejs/kit';
import { getPostBySlug } from '@urixoft/urx-blog-package';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPostBySlug(params.slug);
	if (!post) error(404, 'Post not found');

	return {
		seo: {
			title: post.title,
			description: post.excerpt ?? post.title
		},
		post
	};
};
