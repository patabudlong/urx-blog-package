import { createBlogPostLoad } from '@urixoft/urx-cms-package/sveltekit';

/**
 * For Facebook-compatible shares, pass your public site URL, name, and default OG image:
 *
 * createBlogPostLoad({
 *   siteOrigin: 'https://your-domain.com',
 *   siteName: 'Your Site',
 *   defaultShareImage: '/brand/og.png'
 * });
 */
export const load = createBlogPostLoad();
