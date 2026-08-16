import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

export const DEFAULT_ADMIN_EMAIL = 'superadmin@urixoft.com';
export const DEFAULT_ADMIN_PASSWORD = 'passWord1234!';

export const URX_SERVICES_MANIFEST_FILE = '.urx-services.json';
export const URX_SERVICES_PACKAGE_NAME = '@urixoft/urx-services-package';

export const CMS_POST_KINDS = ['news', 'service'] as const;
export type CmsPostKind = (typeof CMS_POST_KINDS)[number];

export const DEFAULT_NEWS_LIMIT = 20;
export const DEFAULT_SERVICES_LIMIT = 10;

export type BlogPostStatus = 'draft' | 'published';

export type PostQuota = {
	kind: CmsPostKind;
	label: string;
	used: number;
	limit: number;
	remaining: number;
	atLimit: boolean;
};

export type PostQuotaSnapshot = {
	news: PostQuota;
	service: PostQuota;
	canCreateAny: boolean;
};

export class PostLimitError extends Error {
	readonly kind: CmsPostKind;
	readonly limit: number;

	constructor(kind: CmsPostKind, limit: number, label: string) {
		const pages = limit === 1 ? 'page' : 'pages';
		super(
			`Your plan allows up to ${limit} ${label} ${pages}. Delete an existing page to add another.`
		);
		this.name = 'PostLimitError';
		this.kind = kind;
		this.limit = limit;
	}
}

export function isCmsPostKind(value: unknown): value is CmsPostKind {
	return value === 'news' || value === 'service';
}

export function normalizePostKind(value: unknown): CmsPostKind {
	return value === 'service' ? 'service' : 'news';
}

export function parsePostLimit(value: string | number | undefined | null, fallback: number): number {
	if (typeof value === 'number') {
		return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
	}

	const trimmed = value?.trim();
	if (!trimmed) return fallback;

	const parsed = Number.parseInt(trimmed, 10);
	if (!Number.isFinite(parsed) || parsed < 0) return fallback;
	return parsed;
}

export function buildPostQuota(
	kind: CmsPostKind,
	used: number,
	limit: number,
	label: string
): PostQuota {
	const remaining = Math.max(0, limit - used);
	return {
		kind,
		label,
		used,
		limit,
		remaining,
		atLimit: used >= limit
	};
}

export function buildPostQuotaSnapshot(
	counts: { news: number; service: number },
	limits: { news: number; service: number },
	labels: { news: string; service: string }
): PostQuotaSnapshot {
	const news = buildPostQuota('news', counts.news, limits.news, labels.news);
	const service = buildPostQuota('service', counts.service, limits.service, labels.service);

	return {
		news,
		service,
		canCreateAny: !news.atLimit || !service.atLimit
	};
}

export function postLimitMessage(quota: PostQuota): string {
	const pages = quota.limit === 1 ? 'page' : 'pages';
	return `Your plan allows up to ${quota.limit} ${quota.label} ${pages}. Delete an existing page to add another.`;
}

export type BlogUser = {
	id: number;
	email: string;
	role: 'admin' | 'editor';
	createdAt: Date;
};

export type BlogPost = {
	id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	content: string;
	category: string;
	kind: CmsPostKind;
	featuredImage: string | null;
	status: BlogPostStatus;
	publishedAt: Date | null;
	authorId: number | null;
	createdAt: Date;
	updatedAt: Date;
};

export type BlogPostWithAuthor = BlogPost & {
	authorName: string | null;
};

export type AuditActor = {
	id: number;
	email: string;
};

export const AUDIT_ACTIONS = [
	'post.created',
	'post.updated',
	'post.deleted',
	'post.duplicated',
	'category.created',
	'category.updated',
	'category.deleted',
	'auth.login',
	'auth.login_failed',
	'auth.logout'
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ENTITY_TYPES = ['post', 'category', 'auth'] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export type AuditLogEntry = {
	id: number;
	userId: number | null;
	userEmail: string | null;
	action: AuditAction;
	entityType: AuditEntityType | null;
	entityId: number | null;
	summary: string;
	metadata: Record<string, unknown> | null;
	createdAt: Date;
};

export type ListAuditEventsOptions = {
	limit?: number;
	offset?: number;
	action?: AuditAction;
	entityType?: AuditEntityType;
};

export type BlogPostCard = {
	category: string;
	date: string;
	title: string;
	image: string;
	href: string;
	excerpt?: string;
};

export type BlogGridData = {
	eyebrow: string;
	title: string;
	cta: { label: string; href: string };
	posts: BlogPostCard[];
};

export type UrxCmsConfig = {
	databasePath?: string;
	sessionSecret?: string;
	adminPath?: string;
	fallbackImage?: string;
};

export type UrxCmsManifest = {
	version: string;
	installedAt: string;
	packageName: string;
	files: string[];
	envKeys: string[];
};

async function servicesPathExists(path: string): Promise<boolean> {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

async function hasServicesPackageDependency(projectRoot: string): Promise<boolean> {
	const pkgPath = join(projectRoot, 'package.json');
	if (!(await servicesPathExists(pkgPath))) return false;

	const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as {
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
		optionalDependencies?: Record<string, string>;
	};

	const deps = {
		...pkg.dependencies,
		...pkg.devDependencies,
		...pkg.optionalDependencies
	};

	return URX_SERVICES_PACKAGE_NAME in deps;
}

/** True when @urixoft/urx-services-package is installed in this project. */
export async function isUrxServicesPackageInstalled(projectRoot = process.cwd()): Promise<boolean> {
	if (await servicesPathExists(join(projectRoot, URX_SERVICES_MANIFEST_FILE))) {
		return true;
	}

	return hasServicesPackageDependency(projectRoot);
}
