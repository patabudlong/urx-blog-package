import { listPublishedPosts, toBlogPostCard } from '@urixoft/urx-blog-package';
import { urxBlogConfig } from '$lib/urx-blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const posts = await listPublishedPosts();
		return {
			seo: {
				title: 'Blog',
				description: 'Latest news and port operations insights.'
			},
			posts: posts.map((post) => toBlogPostCard(post, urxBlogConfig.fallbackImage))
		};
	} catch (error) {
		console.warn('[urx-blog] Blog index fallback:', error);
		return {
			seo: {
				title: 'Blog',
				description: 'Latest news and port operations insights.'
			},
			posts: []
		};
	}
};
