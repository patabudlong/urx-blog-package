import { toBlogGridData } from '../adapters/blog-grid.js';
import { applyBlogPathsToGridSection } from './nav.js';
import { getConfiguredBlogBasePath } from '../config/runtime.js';
import { isCmsDatabaseReady } from '../db/connection.js';
import { listPublishedPosts, getPostBySlug } from '../posts/repository.js';
import type { BlogGridData, BlogPost, UrxCmsConfig } from '../types.js';
import type { BlogIndexPath } from '../adapters/blog-nav.js';

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

export function createBlogLoaders(config: UrxCmsConfig = {}): BlogLoaders {
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

type BlogGridSectionInput = {
	type: 'blog-grid';
	eyebrow?: string;
	title?: string;
	cta?: { label: string; href: string };
	posts?: { href: string }[];
};

function applyStaticBlogGridFallback<T extends { type: string }>(
	sections: T[],
	basePath: BlogIndexPath
): T[] {
	return sections.map((section) => {
		if (section.type !== 'blog-grid') return section;
		return applyBlogPathsToGridSection(section as T & BlogGridSectionInput, basePath) as T;
	});
}

export async function injectBlogGridIntoSections<T extends { type: string; posts?: unknown }>(
	sections: T[],
	options: {
		limit?: number;
		eyebrow?: string;
		title?: string;
		cta?: { label: string; href: string };
		fallbackImage?: string;
		basePath?: BlogIndexPath;
	} = {}
): Promise<T[]> {
	const basePath = options.basePath ?? getConfiguredBlogBasePath();

	if (!isCmsDatabaseReady()) {
		return applyStaticBlogGridFallback(sections, basePath);
	}

	try {
		const grid = await toBlogGridData(await listPublishedPosts(options.limit ?? 3), {
			...options,
			basePath
		});

		return sections.map((section) => {
			if (section.type !== 'blog-grid') return section;
			return {
				...section,
				eyebrow: options.eyebrow ?? (section as { eyebrow?: string }).eyebrow ?? grid.eyebrow,
				title: options.title ?? (section as { title?: string }).title ?? grid.title,
				cta: options.cta ?? (section as { cta?: { label: string; href: string } }).cta ?? grid.cta,
				posts: grid.posts
			};
		});
	} catch (loadError) {
		console.warn('[urx-cms-package] Could not load blog posts, using static fallback.', loadError);
		return applyStaticBlogGridFallback(sections, basePath);
	}
}
