import { listPublishedPosts } from '@urixoft/urx-blog-package';
import { toBlogPostCard } from '@urixoft/urx-blog-package';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const posts = await listPublishedPosts();
		return {
			seo: {
				title: 'Blog',
				description: 'Latest news and port operations insights.'
			},
			posts: posts.map((post) => toBlogPostCard(post))
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
