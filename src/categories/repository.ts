import { execute, query, queryOne } from '../db/connection.js';
import { recordAuditEvent } from '../audit/repository.js';
import type { AuditActor } from '../types.js';

function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 200);
}

export type BlogCategory = {
	id: number;
	name: string;
	slug: string;
};

type CategoryRow = {
	id: number;
	name: string;
	slug: string;
};

function mapCategory(row: CategoryRow): BlogCategory {
	return {
		id: row.id,
		name: row.name,
		slug: row.slug
	};
}

export async function listCategories(): Promise<BlogCategory[]> {
	const rows = await query<CategoryRow>(
		`SELECT id, name, slug
		 FROM urx_blog_categories
		 ORDER BY name ASC`
	);
	return rows.map(mapCategory);
}

async function ensureCategory(name: string): Promise<void> {
	const trimmed = name.trim();
	if (!trimmed) return;

	const slug = slugify(trimmed);
	const existing = await queryOne<{ id: number }>(
		`SELECT id FROM urx_blog_categories
		 WHERE name = :name OR slug = :slug
		 LIMIT 1`,
		{ name: trimmed, slug }
	);

	if (existing) return;

	await execute(
		`INSERT INTO urx_blog_categories (name, slug)
		 VALUES (:name, :slug)`,
		{ name: trimmed, slug }
	);
}

export async function getCategoryById(id: number): Promise<BlogCategory | null> {
	const row = await queryOne<CategoryRow>(
		`SELECT id, name, slug
		 FROM urx_blog_categories
		 WHERE id = :id
		 LIMIT 1`,
		{ id }
	);

	return row ? mapCategory(row) : null;
}

export async function countPostsByCategory(name: string): Promise<number> {
	const row = await queryOne<{ count: number }>(
		`SELECT COUNT(*) as count
		 FROM urx_blog_posts
		 WHERE category = :name`,
		{ name }
	);

	return Number(row?.count ?? 0);
}

export async function createCategory(name: string, auditActor?: AuditActor): Promise<BlogCategory> {
	const trimmed = name.trim();
	if (!trimmed) {
		throw new Error('Category name is required.');
	}

	const slug = slugify(trimmed);
	const existing = await queryOne<CategoryRow>(
		`SELECT id, name, slug FROM urx_blog_categories
		 WHERE name = :name OR slug = :slug
		 LIMIT 1`,
		{ name: trimmed, slug }
	);

	if (existing) {
		throw new Error('A category with that name already exists.');
	}

	const id = await execute(
		`INSERT INTO urx_blog_categories (name, slug)
		 VALUES (:name, :slug)`,
		{ name: trimmed, slug }
	);

	const category = { id, name: trimmed, slug };

	if (auditActor) {
		await recordAuditEvent({
			userId: auditActor.id,
			userEmail: auditActor.email,
			action: 'category.created',
			entityType: 'category',
			entityId: id,
			summary: `Created category "${trimmed}"`,
			metadata: { slug }
		});
	}

	return category;
}

export async function updateCategory(
	id: number,
	name: string,
	auditActor?: AuditActor
): Promise<BlogCategory> {
	const existing = await getCategoryById(id);
	if (!existing) {
		throw new Error('Category not found.');
	}

	const trimmed = name.trim();
	if (!trimmed) {
		throw new Error('Category name is required.');
	}

	const slug = slugify(trimmed);
	const duplicate = await queryOne<CategoryRow>(
		`SELECT id, name, slug FROM urx_blog_categories
		 WHERE (name = :name OR slug = :slug) AND id != :id
		 LIMIT 1`,
		{ name: trimmed, slug, id }
	);

	if (duplicate) {
		throw new Error('A category with that name already exists.');
	}

	await execute(
		`UPDATE urx_blog_categories
		 SET name = :name, slug = :slug
		 WHERE id = :id`,
		{ id, name: trimmed, slug }
	);

	if (existing.name !== trimmed) {
		await execute(
			`UPDATE urx_blog_posts
			 SET category = :name
			 WHERE category = :oldName`,
			{ name: trimmed, oldName: existing.name }
		);
	}

	const category = { id, name: trimmed, slug };

	if (auditActor) {
		await recordAuditEvent({
			userId: auditActor.id,
			userEmail: auditActor.email,
			action: 'category.updated',
			entityType: 'category',
			entityId: id,
			summary: `Updated category "${trimmed}"`,
			metadata: { previousName: existing.name, slug }
		});
	}

	return category;
}

export async function deleteCategory(id: number, auditActor?: AuditActor): Promise<void> {
	const existing = await getCategoryById(id);
	if (!existing) {
		throw new Error('Category not found.');
	}

	const postCount = await countPostsByCategory(existing.name);
	if (postCount > 0) {
		throw new Error('Cannot delete a category that is used by existing posts.');
	}

	await execute('DELETE FROM urx_blog_categories WHERE id = :id', { id });

	if (auditActor) {
		await recordAuditEvent({
			userId: auditActor.id,
			userEmail: auditActor.email,
			action: 'category.deleted',
			entityType: 'category',
			entityId: id,
			summary: `Deleted category "${existing.name}"`,
			metadata: { slug: existing.slug }
		});
	}
}

export async function seedDefaultCategories(): Promise<void> {
	const defaults = ['News', 'Operations', 'Technology', 'Industry'];
	for (const name of defaults) {
		await ensureCategory(name);
	}
}

export async function syncCategoriesFromPosts(): Promise<void> {
	const rows = await query<{ category: string }>(
		`SELECT DISTINCT category
		 FROM urx_blog_posts
		 WHERE category IS NOT NULL AND TRIM(category) != ''`
	);

	for (const row of rows) {
		await ensureCategory(row.category);
	}
}
