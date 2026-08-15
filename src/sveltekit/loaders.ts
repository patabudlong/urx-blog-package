import { toBlogGridData } from '../adapters/blog-grid.js';
import { listPublishedPosts, getPostBySlug } from '../posts/repository.js';
import type { BlogGridData, BlogPost, UrxBlogConfig } from '../types.js';

export type BlogLoaders = {
	getLatestPosts: (limit?: number) => Promise<BlogPost[]>;
	getBlogGridSection: (options?: {
		limit?: number;
		eyebrow?: string;
		title?: string;
		cta?: { label: string; href: string };
	}) => Promise<BlogGridData>;
	getPublishedPost: (slug: string) => Promise<BlogPost | null>;
};

export function createBlogLoaders(config: UrxBlogConfig = {}): BlogLoaders {
	const fallbackImage = config.fallbackImage;

	return {
		async getLatestPosts(limit = 3) {
			return listPublishedPosts(limit);
		},

		async getBlogGridSection(options = {}) {
			const posts = await listPublishedPosts(options.limit ?? 3);
			return toBlogGridData(posts, {
				eyebrow: options.eyebrow,
				title: options.title,
				cta: options.cta,
				fallbackImage
			});
		},

		async getPublishedPost(slug) {
			return getPostBySlug(slug);
		}
	};
}

export async function injectBlogGridIntoSections<T extends { type: string; posts?: unknown }>(
	sections: T[],
	options: {
		limit?: number;
		eyebrow?: string;
		title?: string;
		cta?: { label: string; href: string };
		fallbackImage?: string;
	} = {}
): Promise<T[]> {
	try {
		const grid = await toBlogGridData(await listPublishedPosts(options.limit ?? 3), options);

		return sections.map((section) => {
			if (section.type !== 'blog-grid') return section;
			return {
				...section,
				eyebrow: options.eyebrow ?? (section as { eyebrow?: string }).eyebrow ?? grid.eyebrow,
				title: options.title ?? (section as { title?: string }).title ?? grid.title,
				posts: grid.posts
			};
		});
	} catch (error) {
		console.warn('[urx-blog-package] Could not load blog posts, using static fallback.', error);
		return sections;
	}
}
