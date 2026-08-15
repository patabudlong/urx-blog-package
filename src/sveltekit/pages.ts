import { error } from '@sveltejs/kit';
import {
	getConfiguredBlogBasePath,
	getConfiguredBlogNavLabel
} from '../config/runtime.js';
import { toBlogPostCard } from '../adapters/blog-grid.js';
import { getPostBySlug, listPublishedPosts } from '../posts/repository.js';
import type { BlogIndexPath } from '../adapters/blog-nav.js';

export function createBlogIndexLoad(options: { fallbackImage?: string; basePath?: BlogIndexPath } = {}) {
	return async () => {
		const blogNavLabel = getConfiguredBlogNavLabel();
		const blogBasePath = options.basePath ?? getConfiguredBlogBasePath();
		const fallbackImage = options.fallbackImage;

		try {
			const posts = await listPublishedPosts();
			return {
				seo: {
					title: blogNavLabel,
					description: 'Latest news and port operations insights.'
				},
				blogNavLabel,
				blogBasePath,
				posts: posts.map((post) => toBlogPostCard(post, fallbackImage, blogBasePath))
			};
		} catch (loadError) {
			console.warn('[urx-cms] Blog index fallback:', loadError);
			return {
				seo: {
					title: blogNavLabel,
					description: 'Latest news and port operations insights.'
				},
				blogNavLabel,
				blogBasePath,
				posts: []
			};
		}
	};
}

export function createBlogPostLoad() {
	return async ({ params }: { params: { slug: string } }) => {
		const post = await getPostBySlug(params.slug);
		if (!post) error(404, 'Post not found');

		return {
			seo: {
				title: post.title,
				description: post.excerpt ?? post.title
			},
			blogNavLabel: getConfiguredBlogNavLabel(),
			blogBasePath: getConfiguredBlogBasePath(),
			post
		};
	};
}
