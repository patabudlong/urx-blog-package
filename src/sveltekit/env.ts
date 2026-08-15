import type { Handle } from '@sveltejs/kit';
import { configureUrxBlog } from '../config/runtime.js';

type BlogEnv = {
	URX_BLOG_SESSION_SECRET?: string;
	URX_BLOG_DB_PATH?: string;
	LINODE_ENDPOINT?: string;
	LINODE_BUCKET?: string;
	LINODE_ACCESS_KEY?: string;
	LINODE_SECRET_KEY?: string;
	LINODE_REGION?: string;
	LINODE_PUBLIC_BASE?: string;
	LINODE_UPLOAD_PREFIX?: string;
};

export function createBlogEnvHandle(getEnv: () => BlogEnv): Handle {
	return async ({ event, resolve }) => {
		const env = getEnv();
		configureUrxBlog({
			sessionSecret: env.URX_BLOG_SESSION_SECRET,
			databasePath: env.URX_BLOG_DB_PATH,
			linodeEndpoint: env.LINODE_ENDPOINT,
			linodeBucket: env.LINODE_BUCKET,
			linodeAccessKey: env.LINODE_ACCESS_KEY,
			linodeSecretKey: env.LINODE_SECRET_KEY,
			linodeRegion: env.LINODE_REGION,
			linodePublicBase: env.LINODE_PUBLIC_BASE,
			linodeUploadPrefix: env.LINODE_UPLOAD_PREFIX
		});
		return resolve(event);
	};
}
