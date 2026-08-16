import { getPostQuotaSnapshot, isUrxServicesPackageInstalled, listAllPosts, type BlogPost } from '@urixoft/urx-cms-package';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const posts: BlogPost[] = await listAllPosts();
	const [quota, servicesInstalled] = await Promise.all([
		getPostQuotaSnapshot(),
		isUrxServicesPackageInstalled()
	]);

	return {
		posts,
		quota,
		servicesInstalled,
		publishedCount: posts.filter((post) => post.status === 'published').length,
		draftCount: posts.filter((post) => post.status === 'draft').length
	};
};
