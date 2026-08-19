import { error } from '@sveltejs/kit';
import { fetchManagedBlogImage, resolveManagedImageKey } from '@urixoft/urx-cms-package';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const imageUrl = url.searchParams.get('url')?.trim();
	if (!imageUrl) {
		error(400, 'Image URL is required.');
	}

	if (!resolveManagedImageKey(imageUrl)) {
		error(400, 'Invalid image URL.');
	}

	try {
		const image = await fetchManagedBlogImage(imageUrl);
		return new Response(Buffer.from(image.body), {
			headers: {
				'Content-Type': image.contentType,
				'Cache-Control': 'public, max-age=86400, immutable'
			}
		});
	} catch {
		error(404, 'Image not found.');
	}
};
