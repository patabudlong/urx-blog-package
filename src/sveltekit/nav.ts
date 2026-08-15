import { applyBlogNavLabel, getBlogBasePath, rewriteBlogHref, type BlogNavLabel, type BlogNavLink, type BlogIndexPath } from '../adapters/blog-nav.js';
import { getConfiguredBlogBasePath, getConfiguredBlogNavLabel } from '../config/runtime.js';

type SiteWithBlogLinks = {
	nav: readonly BlogNavLink[];
	footer: {
		links: readonly BlogNavLink[];
		[key: string]: unknown;
	};
	[key: string]: unknown;
};

type BlogGridPost = {
	href: string;
	[key: string]: unknown;
};

type BlogGridSection = {
	type: 'blog-grid';
	cta?: { label: string; href: string };
	posts?: BlogGridPost[];
	[key: string]: unknown;
};

/** Apply the configured blog nav label and base path to compatible site nav/footer links. */
export function withBlogNavLabel<T extends SiteWithBlogLinks>(
	site: T,
	label?: BlogNavLabel
): T & { blogNavLabel: BlogNavLabel; blogBasePath: BlogIndexPath } {
	const blogNavLabel = label ?? getConfiguredBlogNavLabel();
	const blogBasePath = getBlogBasePath(blogNavLabel);

	return {
		...site,
		nav: applyBlogNavLabel(site.nav, blogNavLabel, blogBasePath),
		footer: {
			...site.footer,
			links: applyBlogNavLabel(site.footer.links, blogNavLabel, blogBasePath)
		},
		blogNavLabel,
		blogBasePath
	};
}

/** Normalize blog-grid section links to the configured public base path. */
export function applyBlogPathsToGridSection<T extends BlogGridSection>(
	section: T,
	basePath: BlogIndexPath = getConfiguredBlogBasePath()
): T {
	return {
		...section,
		cta: section.cta
			? { ...section.cta, href: rewriteBlogHref(section.cta.href, basePath) }
			: section.cta,
		posts: section.posts?.map((post) => ({
			...post,
			href: rewriteBlogHref(post.href, basePath)
		}))
	};
}
