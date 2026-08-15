import { injectBlogGridIntoSections } from '@urixoft/urx-blog-package/sveltekit';
import { homePage } from '$lib/content/home';
import { loadPageContent } from '$lib/content/load-page';
import { urxBlogConfig } from '$lib/urx-blog';

export const load = async () => {
	const content = loadPageContent(homePage);
	const sections = await injectBlogGridIntoSections(content.sections, {
		limit: 3,
		fallbackImage: urxBlogConfig.fallbackImage
	});

	return {
		...content,
		sections
	};
};
