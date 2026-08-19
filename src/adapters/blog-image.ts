import { getLinodeStorageConfig } from '../config/runtime.js';

export const DEFAULT_BLOG_IMAGE_PLACEHOLDER = '/images/blog/placeholder.svg';
export const PUBLIC_BLOG_MEDIA_PATH = '/api/blog-media';

/** Normalize blog image URLs; empty values use the configured placeholder. */
export function resolveBlogImageUrl(
	src?: string | null,
	fallbackImage: string = DEFAULT_BLOG_IMAGE_PLACEHOLDER
): string {
	const trimmed = src?.trim();
	if (!trimmed || trimmed === fallbackImage) {
		return fallbackImage;
	}
	return trimmed;
}

export function isBlogImagePlaceholder(
	src?: string | null,
	fallbackImage: string = DEFAULT_BLOG_IMAGE_PLACEHOLDER
): boolean {
	return resolveBlogImageUrl(src, fallbackImage) === fallbackImage;
}

function managedImagePublicBase(): string | null {
	const base = getLinodeStorageConfig()?.publicBase?.replace(/\/$/, '');
	return base || null;
}

/** Whether the URL points at this project's Linode public base. */
export function isManagedBlogImageUrl(
	src?: string | null,
	managedBase: string | null = managedImagePublicBase()
): boolean {
	const trimmed = src?.trim();
	const base = managedBase?.replace(/\/$/, '');
	if (!trimmed || !base) return false;
	return trimmed === base || trimmed.startsWith(`${base}/`);
}

export function getPublicBlogImageUrl(src: string): string {
	return `${PUBLIC_BLOG_MEDIA_PATH}?url=${encodeURIComponent(src)}`;
}

/**
 * Rewrite private Linode object URLs to the public `/api/blog-media` proxy.
 * Safe on the server after `configureUrxCms()` (hooks). No-ops on the client.
 */
export function toPublicBlogImageUrl(
	src?: string | null,
	fallbackImage: string = DEFAULT_BLOG_IMAGE_PLACEHOLDER
): string {
	const resolved = resolveBlogImageUrl(src, fallbackImage);
	if (resolved === fallbackImage || !isManagedBlogImageUrl(resolved)) {
		return resolved;
	}
	return getPublicBlogImageUrl(resolved);
}

/** Rewrite Linode `src` attributes inside post HTML so public pages can load them. */
export function rewriteManagedBlogImagesInHtml(html: string): string {
	return html.replace(/\bsrc=(["'])(.*?)\1/gi, (_match, quote: string, src: string) => {
		const next = isManagedBlogImageUrl(src) ? getPublicBlogImageUrl(src) : src;
		return `src=${quote}${next}${quote}`;
	});
}
