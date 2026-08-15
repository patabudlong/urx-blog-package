import { listAllPosts } from '@urixoft/urx-cms-package';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const posts = await listAllPosts();
	return { posts };
};
