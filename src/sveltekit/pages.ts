import { error } from '@sveltejs/kit';
import {
	getConfiguredBlogBasePath,
	getConfiguredBlogNavLabel
} from '../config/runtime.js';
import { toBlogPostCard } from '../adapters/blog-grid.js';
import { buildBlogPostShareContext } from '../adapters/blog-share.js';
import { getPostBySlug, listPublishedPosts } from '../posts/repository.js';
import type { BlogIndexPath } from '../adapters/blog-nav.js';

export type CreateBlogPostLoadOptions = {
	/** Site origin for canonical URLs and share links — defaults to the request origin. */
	siteOrigin?: string;
	fallbackImage?: string;
	resolveShareImageUrl?: (
		featuredImage: string | null,
		context: { siteOrigin: string; fallbackImage?: string }
	) => string | undefined;
};

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

export function createBlogPostLoad(options: CreateBlogPostLoadOptions = {}) {
	return async ({
		params,
		url
	}: {
		params: { slug: string };
		url: URL;
	}) => {
		const post = await getPostBySlug(params.slug);
		if (!post) error(404, 'Post not found');

		const siteOrigin = options.siteOrigin ?? url.origin;
		const blogBasePath = getConfiguredBlogBasePath();
		const { seo, share } = buildBlogPostShareContext(post, {
			siteOrigin,
			basePath: blogBasePath,
			fallbackImage: options.fallbackImage,
			resolveShareImageUrl: options.resolveShareImageUrl
		});

		return {
			seo,
			share,
			blogNavLabel: getConfiguredBlogNavLabel(),
			blogBasePath,
			post
		};
	};
}
