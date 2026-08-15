import { injectBlogGridIntoSections } from '@urixoft/urx-cms-package/sveltekit';
import { homePage } from '$lib/content/home';
import { loadPageContent } from '$lib/content/load-page';
import { urxCmsConfig } from '$lib/urx-cms';

export const load = async () => {
	const content = loadPageContent(homePage);
	const sections = await injectBlogGridIntoSections(content.sections, {
		limit: 3,
		fallbackImage: urxCmsConfig.fallbackImage
	});

	return {
		...content,
		sections
	};
};
