export const BLOG_NAV_LABELS = ['Blog', 'News'] as const;
export type BlogNavLabel = (typeof BLOG_NAV_LABELS)[number];

export const DEFAULT_BLOG_NAV_LABEL: BlogNavLabel = 'Blog';
export const DEFAULT_BLOG_HREF = '/blog';
export const NEWS_BLOG_HREF = '/news';

export const BLOG_INDEX_PATHS = [DEFAULT_BLOG_HREF, NEWS_BLOG_HREF] as const;
export type BlogIndexPath = (typeof BLOG_INDEX_PATHS)[number];

export function normalizeBlogNavLabel(value?: string | null): BlogNavLabel {
	const trimmed = value?.trim();
	return trimmed?.toLowerCase() === 'news' ? 'News' : 'Blog';
}

export function getBlogBasePath(label: BlogNavLabel = DEFAULT_BLOG_NAV_LABEL): BlogIndexPath {
	return label === 'News' ? NEWS_BLOG_HREF : DEFAULT_BLOG_HREF;
}

export function isBlogIndexPath(href: string): boolean {
	return BLOG_INDEX_PATHS.includes(href as BlogIndexPath);
}

/** Rewrite blog index/post URLs to the configured public base path. */
export function rewriteBlogHref(href: string, basePath: BlogIndexPath = DEFAULT_BLOG_HREF): string {
	if (isBlogIndexPath(href)) return basePath;
	if (href.startsWith(`${DEFAULT_BLOG_HREF}/`)) {
		return `${basePath}${href.slice(DEFAULT_BLOG_HREF.length)}`;
	}
	if (href.startsWith(`${NEWS_BLOG_HREF}/`)) {
		return `${basePath}${href.slice(NEWS_BLOG_HREF.length)}`;
	}
	return href;
}

export type BlogNavLink = {
	label: string;
	href: string;
};

/** Replace nav/footer blog links with the configured label and base path. */
export function applyBlogNavLabel<T extends BlogNavLink>(
	links: readonly T[],
	label: BlogNavLabel,
	basePath: BlogIndexPath = getBlogBasePath(label)
): T[] {
	return links.map((item) =>
		isBlogIndexPath(item.href)
			? { ...item, label, href: basePath }
			: { ...item, href: rewriteBlogHref(item.href, basePath) }
	);
}

export function getBlogNavLabel(override?: string | null): BlogNavLabel {
	return normalizeBlogNavLabel(override ?? process.env.URX_CMS_NAV_LABEL);
}
