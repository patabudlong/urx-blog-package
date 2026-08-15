import { json } from '@sveltejs/kit';
import { createCategory, getSessionFromCookies, listCategories } from '@urixoft/urx-cms-package';
import type { RequestHandler } from './$types';

function unauthorized() {
	return json({ error: 'Unauthorized.' }, { status: 401 });
}

export const GET: RequestHandler = async ({ cookies }) => {
	if (!getSessionFromCookies(cookies)) {
		return unauthorized();
	}

	return json(await listCategories());
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	if (!getSessionFromCookies(cookies)) {
		return unauthorized();
	}

	let body: { name?: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	const name = String(body.name ?? '').trim();
	if (!name) {
		return json({ error: 'Category name is required.' }, { status: 400 });
	}

	try {
		const category = await createCategory(name);
		return json({ category }, { status: 201 });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Could not create category.';
		return json({ error: message }, { status: 409 });
	}
};
