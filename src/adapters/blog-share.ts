import { resolveBlogImageUrl, isBlogImagePlaceholder } from './blog-image.js';
import type { BlogIndexPath } from './blog-nav.js';
import type { BlogPost } from '../types.js';

export type BlogSharePlatform = 'copy' | 'facebook' | 'linkedin' | 'twitter' | 'whatsapp' | 'email';

export type BlogShareLink = {
	platform: BlogSharePlatform;
	label: string;
	href: string;
};

export type BlogShareData = {
	url: string;
	title: string;
	description: string;
	image?: string;
	links: BlogShareLink[];
};

export type BlogPostSeo = {
	title: string;
	description: string;
	canonicalUrl: string;
	type: 'article';
	image?: string;
	publishedTime?: string;
	modifiedTime?: string;
};

/** Turn a site-relative or absolute path into a full URL. */
export function absoluteUrl(siteOrigin: string, pathOrUrl: string): string {
	if (/^https?:\/\//i.test(pathOrUrl)) {
		return pathOrUrl;
	}

	const origin = siteOrigin.replace(/\/$/, '');
	const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
	return `${origin}${path}`;
}

/** Canonical public URL for a published blog post. */
export function buildBlogPostUrl(siteOrigin: string, basePath: BlogIndexPath, slug: string): string {
	const base = basePath.replace(/\/$/, '');
	return absoluteUrl(siteOrigin, `${base}/${slug}`);
}

export function buildBlogShareLinks(input: {
	url: string;
	title: string;
	description?: string;
}): BlogShareLink[] {
	const encodedUrl = encodeURIComponent(input.url);
	const encodedTitle = encodeURIComponent(input.title);
	const encodedDescription = encodeURIComponent(input.description ?? input.title);

	return [
		{ platform: 'copy', label: 'Copy link', href: input.url },
		{
			platform: 'facebook',
			label: 'Facebook',
			href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
		},
		{
			platform: 'linkedin',
			label: 'LinkedIn',
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
		},
		{
			platform: 'twitter',
			label: 'X',
			href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
		},
		{
			platform: 'whatsapp',
			label: 'WhatsApp',
			href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
		},
		{
			platform: 'email',
			label: 'Email',
			href: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`
		}
	];
}

export function buildBlogShareData(input: {
	url: string;
	title: string;
	description?: string;
	image?: string;
}): BlogShareData {
	const description = input.description ?? input.title;

	return {
		url: input.url,
		title: input.title,
		description,
		image: input.image,
		links: buildBlogShareLinks({
			url: input.url,
			title: input.title,
			description
		})
	};
}

export function defaultBlogShareImageUrl(
	featuredImage: string | null,
	context: { siteOrigin: string; fallbackImage?: string }
): string | undefined {
	const resolved = resolveBlogImageUrl(featuredImage, context.fallbackImage);
	if (isBlogImagePlaceholder(resolved, context.fallbackImage)) {
		return undefined;
	}

	return absoluteUrl(context.siteOrigin, resolved);
}

export function buildBlogPostShareContext(
	post: BlogPost,
	options: {
		siteOrigin: string;
		basePath: BlogIndexPath;
		fallbackImage?: string;
		resolveShareImageUrl?: (
			featuredImage: string | null,
			context: { siteOrigin: string; fallbackImage?: string }
		) => string | undefined;
	}
): { seo: BlogPostSeo; share: BlogShareData } {
	const canonicalUrl = buildBlogPostUrl(options.siteOrigin, options.basePath, post.slug);
	const description = post.excerpt ?? post.title;
	const resolveShareImageUrl = options.resolveShareImageUrl ?? defaultBlogShareImageUrl;
	const image = resolveShareImageUrl(post.featuredImage, {
		siteOrigin: options.siteOrigin,
		fallbackImage: options.fallbackImage
	});

	const share = buildBlogShareData({
		url: canonicalUrl,
		title: post.title,
		description,
		image
	});

	const seo: BlogPostSeo = {
		title: post.title,
		description,
		canonicalUrl,
		type: 'article',
		image,
		publishedTime: post.publishedAt?.toISOString(),
		modifiedTime: post.updatedAt.toISOString()
	};

	return { seo, share };
}
