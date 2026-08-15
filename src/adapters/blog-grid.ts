import type { BlogGridData, BlogPost, BlogPostCard } from '../types.js';
import {
	DEFAULT_BLOG_IMAGE_PLACEHOLDER,
	resolveBlogImageUrl
} from './blog-image.js';

const DEFAULT_FALLBACK_IMAGE = DEFAULT_BLOG_IMAGE_PLACEHOLDER;

function formatDate(date: Date | null): string {
	if (!date) return '';
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(date);
}

export function toBlogPostCard(post: BlogPost, fallbackImage = DEFAULT_FALLBACK_IMAGE): BlogPostCard {
	return {
		category: post.category,
		date: formatDate(post.publishedAt),
		title: post.title,
		image: resolveBlogImageUrl(post.featuredImage, fallbackImage),
		href: `/blog/${post.slug}`,
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
	} = {}
): BlogGridData {
	const fallbackImage = options.fallbackImage ?? DEFAULT_FALLBACK_IMAGE;

	return {
		eyebrow: options.eyebrow ?? 'Latest News',
		title: options.title ?? 'Port Operations Insights',
		cta: options.cta ?? { label: 'View All Posts', href: '/blog' },
		posts: posts.map((post) => toBlogPostCard(post, fallbackImage))
	};
}
