export const DEFAULT_BLOG_IMAGE_PLACEHOLDER = '/images/blog/placeholder.svg';

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
