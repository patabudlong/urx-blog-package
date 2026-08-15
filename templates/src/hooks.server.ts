import { createBlogEnvHandle } from '@urixoft/urx-blog-package/sveltekit';
import { env } from '$env/dynamic/private';
import { urxBlogConfig } from '$lib/urx-blog';

export const handle = createBlogEnvHandle(() => ({
	URX_BLOG_SESSION_SECRET: env.URX_BLOG_SESSION_SECRET,
	URX_BLOG_DB_PATH: env.URX_BLOG_DB_PATH,
	LINODE_ENDPOINT: env.LINODE_ENDPOINT,
	LINODE_BUCKET: env.LINODE_BUCKET,
	LINODE_ACCESS_KEY: env.LINODE_ACCESS_KEY,
	LINODE_SECRET_KEY: env.LINODE_SECRET_KEY,
	LINODE_REGION: env.LINODE_REGION,
	LINODE_PUBLIC_BASE: env.LINODE_PUBLIC_BASE,
	LINODE_UPLOAD_PREFIX: env.LINODE_UPLOAD_PREFIX ?? urxBlogConfig.uploadPrefix
}));
