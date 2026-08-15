import { createBlogIndexLoad } from '@urixoft/urx-cms-package/sveltekit';
import { urxCmsConfig } from '$lib/urx-cms';

export const load = createBlogIndexLoad({ fallbackImage: urxCmsConfig.fallbackImage });
