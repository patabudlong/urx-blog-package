import { execute, query, queryOne } from '../db/connection.js';
import { recordAuditEvent } from '../audit/repository.js';
import { getConfiguredPostLimits, getPostKindLabel } from '../config/runtime.js';
import {
	PostLimitError,
	buildPostQuotaSnapshot,
	normalizePostKind,
	type AuditActor,
	type BlogPost,
	type BlogPostStatus,
	type BlogPostWithAuthor,
	type CmsPostKind,
	type PostQuotaSnapshot
} from '../types.js';

const POST_COLUMNS = `id, slug, title, excerpt, content, category, kind, featured_image, status,
		        published_at, author_id, created_at, updated_at`;

type PostRow = {
	id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	content: string;
	category: string;
	kind: string | null;
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
		kind: normalizePostKind(row.kind),
		featuredImage: row.featured_image,
		status: row.status,
		publishedAt: toDate(row.published_at),
		authorId: row.author_id,
		createdAt: new Date(row.created_at),
		updatedAt: new Date(row.updated_at)
	};
}

export async function listPublishedPosts(
	limit?: number,
	kind: CmsPostKind = 'news'
): Promise<BlogPost[]> {
	const limitClause = limit ? `LIMIT ${Number(limit)}` : '';
	const rows = await query<PostRow>(
		`SELECT ${POST_COLUMNS}
		 FROM urx_blog_posts
		 WHERE status = 'published' AND kind = :kind
		 ORDER BY published_at DESC
		 ${limitClause}`,
		{ kind }
	);
	return rows.map(mapPost);
}

export async function listAllPosts(kind?: CmsPostKind): Promise<BlogPost[]> {
	const rows = kind
		? await query<PostRow>(
				`SELECT ${POST_COLUMNS}
				 FROM urx_blog_posts
				 WHERE kind = :kind
				 ORDER BY updated_at DESC`,
				{ kind }
			)
		: await query<PostRow>(
				`SELECT ${POST_COLUMNS}
				 FROM urx_blog_posts
				 ORDER BY updated_at DESC`
			);
	return rows.map(mapPost);
}

type PostWithAuthorRow = PostRow & {
	author_email: string | null;
};

function mapPostWithAuthor(row: PostWithAuthorRow): BlogPostWithAuthor {
	return {
		...mapPost(row),
		authorName: row.author_email
	};
}

const POST_WITH_AUTHOR_SELECT = `p.id, p.slug, p.title, p.excerpt, p.content, p.category, p.kind, p.featured_image, p.status,
		        p.published_at, p.author_id, p.created_at, p.updated_at, u.email as author_email`;

export async function listAllPostsWithAuthors(kind?: CmsPostKind): Promise<BlogPostWithAuthor[]> {
	const rows = kind
		? await query<PostWithAuthorRow>(
				`SELECT ${POST_WITH_AUTHOR_SELECT}
				 FROM urx_blog_posts p
				 LEFT JOIN urx_blog_users u ON u.id = p.author_id
				 WHERE p.kind = :kind
				 ORDER BY p.updated_at DESC`,
				{ kind }
			)
		: await query<PostWithAuthorRow>(
				`SELECT ${POST_WITH_AUTHOR_SELECT}
				 FROM urx_blog_posts p
				 LEFT JOIN urx_blog_users u ON u.id = p.author_id
				 ORDER BY p.updated_at DESC`
			);

	return rows.map(mapPostWithAuthor);
}

export async function getPostBySlug(
	slug: string,
	kind: CmsPostKind = 'news'
): Promise<BlogPost | null> {
	const row = await queryOne<PostRow>(
		`SELECT ${POST_COLUMNS}
		 FROM urx_blog_posts
		 WHERE slug = :slug AND status = 'published' AND kind = :kind
		 LIMIT 1`,
		{ slug, kind }
	);
	return row ? mapPost(row) : null;
}

export async function getPostById(id: number): Promise<BlogPost | null> {
	const row = await queryOne<PostRow>(
		`SELECT ${POST_COLUMNS}
		 FROM urx_blog_posts
		 WHERE id = :id
		 LIMIT 1`,
		{ id }
	);
	return row ? mapPost(row) : null;
}

export async function countPostsByKind(kind: CmsPostKind): Promise<number> {
	const row = await queryOne<{ count: number }>(
		`SELECT COUNT(*) as count
		 FROM urx_blog_posts
		 WHERE kind = :kind`,
		{ kind }
	);
	return Number(row?.count ?? 0);
}

export async function getPostQuotaSnapshot(): Promise<PostQuotaSnapshot> {
	const limits = getConfiguredPostLimits();
	const [newsUsed, serviceUsed] = await Promise.all([
		countPostsByKind('news'),
		countPostsByKind('service')
	]);

	return buildPostQuotaSnapshot(
		{ news: newsUsed, service: serviceUsed },
		limits,
		{
			news: getPostKindLabel('news'),
			service: getPostKindLabel('service')
		}
	);
}

export async function slugExists(slug: string, excludeId?: number): Promise<boolean> {
	const row = excludeId
		? await queryOne<{ id: number }>(
				`SELECT id FROM urx_blog_posts WHERE slug = :slug AND id != :excludeId LIMIT 1`,
				{ slug, excludeId }
			)
		: await queryOne<{ id: number }>(
				`SELECT id FROM urx_blog_posts WHERE slug = :slug LIMIT 1`,
				{ slug }
			);

	return Boolean(row);
}

export async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
	const root = slugify(base) || 'post';
	let candidate = root;
	let suffix = 2;

	while (await slugExists(candidate, excludeId)) {
		candidate = `${root.slice(0, 180)}-${suffix}`;
		suffix += 1;
	}

	return candidate;
}

async function assertCanCreatePost(kind: CmsPostKind): Promise<void> {
	const snapshot = await getPostQuotaSnapshot();
	const quota = snapshot[kind];
	if (quota.atLimit) {
		throw new PostLimitError(kind, quota.limit, quota.label);
	}
}

export type CreatePostInput = {
	slug: string;
	title: string;
	excerpt?: string;
	content: string;
	category: string;
	kind?: CmsPostKind;
	featuredImage?: string;
	status: BlogPostStatus;
	authorId?: number;
	auditActor?: AuditActor;
};

export async function createPost(input: CreatePostInput): Promise<number> {
	const kind = normalizePostKind(input.kind);
	await assertCanCreatePost(kind);

	if (await slugExists(input.slug)) {
		throw new Error(`A post with the slug "${input.slug}" already exists.`);
	}

	const publishedAt = input.status === 'published' ? new Date().toISOString() : null;

	const id = await execute(
		`INSERT INTO urx_blog_posts
		 (slug, title, excerpt, content, category, kind, featured_image, status, published_at, author_id)
		 VALUES (:slug, :title, :excerpt, :content, :category, :kind, :featuredImage, :status, :publishedAt, :authorId)`,
		{
			slug: input.slug,
			title: input.title,
			excerpt: input.excerpt ?? null,
			content: input.content,
			category: input.category,
			kind,
			featuredImage: input.featuredImage ?? null,
			status: input.status,
			publishedAt,
			authorId: input.authorId ?? null
		}
	);

	if (input.auditActor) {
		await recordAuditEvent({
			userId: input.auditActor.id,
			userEmail: input.auditActor.email,
			action: 'post.created',
			entityType: 'post',
			entityId: id,
			summary: `Created post "${input.title}"`,
			metadata: { slug: input.slug, status: input.status, kind }
		});
	}

	return id;
}

export type UpdatePostInput = Partial<CreatePostInput> & { id: number };

export async function updatePost(input: UpdatePostInput): Promise<void> {
	const existing = await getPostById(input.id);
	if (!existing) throw new Error('Post not found');

	const kind = input.kind ? normalizePostKind(input.kind) : existing.kind;
	if (kind !== existing.kind) {
		await assertCanCreatePost(kind);
	}

	const nextSlug = input.slug ?? existing.slug;
	if (nextSlug !== existing.slug && (await slugExists(nextSlug, existing.id))) {
		throw new Error(`A post with the slug "${nextSlug}" already exists.`);
	}

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
		 kind = :kind,
		 featured_image = :featuredImage,
		 status = :status,
		 published_at = :publishedAt,
		 updated_at = datetime('now')
		 WHERE id = :id`,
		{
			id: input.id,
			slug: nextSlug,
			title: input.title ?? existing.title,
			excerpt: input.excerpt ?? existing.excerpt,
			content: input.content ?? existing.content,
			category: input.category ?? existing.category,
			kind,
			featuredImage: input.featuredImage ?? existing.featuredImage,
			status,
			publishedAt
		}
	);

	const title = input.title ?? existing.title;

	if (input.auditActor) {
		await recordAuditEvent({
			userId: input.auditActor.id,
			userEmail: input.auditActor.email,
			action: 'post.updated',
			entityType: 'post',
			entityId: input.id,
			summary: `Updated post "${title}"`,
			metadata: { slug: nextSlug, status, kind }
		});
	}
}

export type DuplicatePostOptions = {
	authorId?: number;
	auditActor?: AuditActor;
};

export async function duplicatePost(
	id: number,
	authorIdOrOptions?: number | DuplicatePostOptions
): Promise<number> {
	const options =
		typeof authorIdOrOptions === 'number'
			? { authorId: authorIdOrOptions }
			: (authorIdOrOptions ?? {});

	const existing = await getPostById(id);
	if (!existing) throw new Error('Post not found');

	const newId = await createPost({
		slug: await uniqueSlug(`${existing.slug}-copy`),
		title: `${existing.title} (Copy)`,
		excerpt: existing.excerpt ?? undefined,
		content: existing.content,
		category: existing.category,
		kind: existing.kind,
		featuredImage: existing.featuredImage ?? undefined,
		status: 'draft',
		authorId: options.authorId ?? existing.authorId ?? undefined
	});

	if (options.auditActor) {
		await recordAuditEvent({
			userId: options.auditActor.id,
			userEmail: options.auditActor.email,
			action: 'post.duplicated',
			entityType: 'post',
			entityId: newId,
			summary: `Duplicated post "${existing.title}"`,
			metadata: { sourcePostId: id, slug: `${existing.slug}-copy` }
		});
	}

	return newId;
}

export async function deletePost(id: number, auditActor?: AuditActor): Promise<void> {
	const existing = await getPostById(id);
	await execute('DELETE FROM urx_blog_posts WHERE id = :id', { id });

	if (auditActor && existing) {
		await recordAuditEvent({
			userId: auditActor.id,
			userEmail: auditActor.email,
			action: 'post.deleted',
			entityType: 'post',
			entityId: id,
			summary: `Deleted post "${existing.title}"`,
			metadata: { slug: existing.slug }
		});
	}
}

export function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 200);
}
