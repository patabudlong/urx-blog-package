import { execute, query, queryOne } from '../db/connection.js';
import type { BlogPost, BlogPostStatus } from '../types.js';

type PostRow = {
	id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	content: string;
	category: string;
	featured_image: string | null;
	status: BlogPostStatus;
	published_at: string | null;
	author_id: number | null;
	created_at: string;
	updated_at: string;
};

function toDate(value: string | null): Date | null {
	return value ? new Date(value) : null;
}

function mapPost(row: PostRow): BlogPost {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		excerpt: row.excerpt,
		content: row.content,
		category: row.category,
		featuredImage: row.featured_image,
		status: row.status,
		publishedAt: toDate(row.published_at),
		authorId: row.author_id,
		createdAt: new Date(row.created_at),
		updatedAt: new Date(row.updated_at)
	};
}

export async function listPublishedPosts(limit?: number): Promise<BlogPost[]> {
	const limitClause = limit ? `LIMIT ${Number(limit)}` : '';
	const rows = await query<PostRow>(
		`SELECT id, slug, title, excerpt, content, category, featured_image, status,
		        published_at, author_id, created_at, updated_at
		 FROM urx_blog_posts
		 WHERE status = 'published'
		 ORDER BY published_at DESC
		 ${limitClause}`
	);
	return rows.map(mapPost);
}

export async function listAllPosts(): Promise<BlogPost[]> {
	const rows = await query<PostRow>(
		`SELECT id, slug, title, excerpt, content, category, featured_image, status,
		        published_at, author_id, created_at, updated_at
		 FROM urx_blog_posts
		 ORDER BY updated_at DESC`
	);
	return rows.map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
	const row = await queryOne<PostRow>(
		`SELECT id, slug, title, excerpt, content, category, featured_image, status,
		        published_at, author_id, created_at, updated_at
		 FROM urx_blog_posts
		 WHERE slug = :slug AND status = 'published'
		 LIMIT 1`,
		{ slug }
	);
	return row ? mapPost(row) : null;
}

export async function getPostById(id: number): Promise<BlogPost | null> {
	const row = await queryOne<PostRow>(
		`SELECT id, slug, title, excerpt, content, category, featured_image, status,
		        published_at, author_id, created_at, updated_at
		 FROM urx_blog_posts
		 WHERE id = :id
		 LIMIT 1`,
		{ id }
	);
	return row ? mapPost(row) : null;
}

export type CreatePostInput = {
	slug: string;
	title: string;
	excerpt?: string;
	content: string;
	category: string;
	featuredImage?: string;
	status: BlogPostStatus;
	authorId?: number;
};

export async function createPost(input: CreatePostInput): Promise<number> {
	const publishedAt = input.status === 'published' ? new Date().toISOString() : null;

	return execute(
		`INSERT INTO urx_blog_posts
		 (slug, title, excerpt, content, category, featured_image, status, published_at, author_id)
		 VALUES (:slug, :title, :excerpt, :content, :category, :featuredImage, :status, :publishedAt, :authorId)`,
		{
			slug: input.slug,
			title: input.title,
			excerpt: input.excerpt ?? null,
			content: input.content,
			category: input.category,
			featuredImage: input.featuredImage ?? null,
			status: input.status,
			publishedAt,
			authorId: input.authorId ?? null
		}
	);
}

export type UpdatePostInput = Partial<CreatePostInput> & { id: number };

export async function updatePost(input: UpdatePostInput): Promise<void> {
	const existing = await getPostById(input.id);
	if (!existing) throw new Error('Post not found');

	const status = input.status ?? existing.status;
	let publishedAt = existing.publishedAt?.toISOString() ?? null;

	if (status === 'published' && !publishedAt) {
		publishedAt = new Date().toISOString();
	} else if (status === 'draft') {
		publishedAt = null;
	}

	await execute(
		`UPDATE urx_blog_posts SET
		 slug = :slug,
		 title = :title,
		 excerpt = :excerpt,
		 content = :content,
		 category = :category,
		 featured_image = :featuredImage,
		 status = :status,
		 published_at = :publishedAt,
		 updated_at = datetime('now')
		 WHERE id = :id`,
		{
			id: input.id,
			slug: input.slug ?? existing.slug,
			title: input.title ?? existing.title,
			excerpt: input.excerpt ?? existing.excerpt,
			content: input.content ?? existing.content,
			category: input.category ?? existing.category,
			featuredImage: input.featuredImage ?? existing.featuredImage,
			status,
			publishedAt
		}
	);
}

export async function deletePost(id: number): Promise<void> {
	await execute('DELETE FROM urx_blog_posts WHERE id = :id', { id });
}

export function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 200);
}
