import type { Handle } from '@sveltejs/kit';
import { createBlogEnvHandle } from '@urixoft/urx-blog-package/sveltekit';
import { env } from '$env/dynamic/private';

export const handle = createBlogEnvHandle(() => ({
	URX_BLOG_SESSION_SECRET: env.URX_BLOG_SESSION_SECRET,
	URX_BLOG_DB_PATH: env.URX_BLOG_DB_PATH
})) satisfies Handle;
