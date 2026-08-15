import type { BlogGridData, BlogPost, BlogPostCard } from '../types.js';

const DEFAULT_FALLBACK_IMAGE =
	'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1da?w=800&q=80';

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
		image: post.featuredImage ?? fallbackImage,
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
