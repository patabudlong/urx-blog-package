import { error } from '@sveltejs/kit';
import { fetchManagedBlogImage, getSessionFromCookies } from '@urixoft/urx-cms-package';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	if (!getSessionFromCookies(cookies)) {
		error(401, 'Unauthorized.');
	}

	const imageUrl = url.searchParams.get('url')?.trim();
	if (!imageUrl) {
		error(400, 'Image URL is required.');
	}

	try {
		const image = await fetchManagedBlogImage(imageUrl);
		return new Response(Buffer.from(image.body), {
			headers: {
				'Content-Type': image.contentType,
				'Cache-Control': 'private, max-age=3600'
			}
		});
	} catch {
		error(404, 'Image not found.');
	}
};
