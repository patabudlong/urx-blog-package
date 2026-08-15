import { fail } from '@sveltejs/kit';
import {
	createCategory,
	deleteCategory,
	getSessionFromCookies,
	listCategories,
	updateCategory
} from '@urixoft/urx-cms-package';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	categories: await listCategories()
});

export const actions: Actions = {
	create: async ({ request, cookies }) => {
		if (!getSessionFromCookies(cookies)) {
			return fail(401, { error: 'Unauthorized.' });
		}

		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();

		if (!name) {
			return fail(400, { error: 'Category name is required.' });
		}

		try {
			await createCategory(name);
			return {
				success: true,
				label: 'Category created',
				message: 'The new category is now available when writing posts.'
			};
		} catch (error) {
			return fail(409, {
				error: error instanceof Error ? error.message : 'Could not create category.'
			});
		}
	},

	update: async ({ request, cookies }) => {
		if (!getSessionFromCookies(cookies)) {
			return fail(401, { error: 'Unauthorized.' });
		}

		const form = await request.formData();
		const id = Number(form.get('id'));
		const name = String(form.get('name') ?? '').trim();

		if (!id) {
			return fail(400, { error: 'Category is required.' });
		}

		if (!name) {
			return fail(400, { error: 'Category name is required.' });
		}

		try {
			await updateCategory(id, name);
			return {
				success: true,
				label: 'Category updated',
				message: 'Your changes have been saved.'
			};
		} catch (error) {
			return fail(409, {
				error: error instanceof Error ? error.message : 'Could not update category.'
			});
		}
	},

	delete: async ({ request, cookies }) => {
		if (!getSessionFromCookies(cookies)) {
			return fail(401, { error: 'Unauthorized.' });
		}

		const form = await request.formData();
		const id = Number(form.get('id'));

		if (!id) {
			return fail(400, { error: 'Category is required.' });
		}

		try {
			await deleteCategory(id);
			return {
				success: true,
				label: 'Category deleted',
				message: 'The category has been removed.'
			};
		} catch (error) {
			return fail(409, {
				error: error instanceof Error ? error.message : 'Could not delete category.'
			});
		}
	}
};
