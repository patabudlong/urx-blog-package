import type { BlogGridData, BlogPost, BlogPostCard } from '../types.js';
import { getConfiguredBlogBasePath } from '../config/runtime.js';
import { DEFAULT_BLOG_IMAGE_PLACEHOLDER, toPublicBlogImageUrl } from './blog-image.js';
import { getBlogBasePath, rewriteBlogHref, type BlogIndexPath } from './blog-nav.js';

const DEFAULT_FALLBACK_IMAGE = DEFAULT_BLOG_IMAGE_PLACEHOLDER;

function formatDate(date: Date | null): string {
	if (!date) return '';
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(date);
}

export function toBlogPostCard(
	post: BlogPost,
	fallbackImage = DEFAULT_FALLBACK_IMAGE,
	basePath: BlogIndexPath = getConfiguredBlogBasePath()
): BlogPostCard {
	return {
		category: post.category,
		date: formatDate(post.publishedAt),
		title: post.title,
		image: toPublicBlogImageUrl(post.featuredImage, fallbackImage),
		href: `${basePath}/${post.slug}`,
		excerpt: post.excerpt ?? undefined
	};
}

export function toBlogGridData(
	posts: BlogPost[],
	options: {
		eyebrow?: string;
		title?: string;
		cta?: { label: string; href: string };
		fallbackImage?: string;
		basePath?: BlogIndexPath;
	} = {}
): BlogGridData {
	const fallbackImage = options.fallbackImage ?? DEFAULT_FALLBACK_IMAGE;
	const basePath = options.basePath ?? getConfiguredBlogBasePath();

	return {
		eyebrow: options.eyebrow ?? 'Latest News',
		title: options.title ?? 'Port Operations Insights',
		cta: options.cta ?? { label: 'View All Posts', href: basePath },
		posts: posts.map((post) => toBlogPostCard(post, fallbackImage, basePath))
	};
}

export function applyBlogPathsToPostCard(
	card: BlogPostCard,
	basePath: BlogIndexPath = getConfiguredBlogBasePath()
): BlogPostCard {
	return {
		...card,
		href: rewriteBlogHref(card.href, basePath)
	};
}
