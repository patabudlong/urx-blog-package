import type { Handle } from '@sveltejs/kit';
import { configureUrxBlog } from '../config/runtime.js';

type BlogEnv = {
	URX_BLOG_SESSION_SECRET?: string;
	URX_BLOG_DB_PATH?: string;
};

export function createBlogEnvHandle(getEnv: () => BlogEnv): Handle {
	return async ({ event, resolve }) => {
		const env = getEnv();
		configureUrxBlog({
			sessionSecret: env.URX_BLOG_SESSION_SECRET,
			databasePath: env.URX_BLOG_DB_PATH
		});
		return resolve(event);
	};
}
