import { withBlogNavLabel } from '@urixoft/urx-cms-package/sveltekit';
import { site as baseSite } from '$lib/config/site';

export const load = () => {
	const labeledSite = withBlogNavLabel(baseSite);
	const { blogNavLabel, blogBasePath, ...site } = labeledSite;

	return { site, blogNavLabel, blogBasePath };
};
