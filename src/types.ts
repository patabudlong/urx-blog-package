export const DEFAULT_ADMIN_EMAIL = 'superadmin@urixoft.com';
export const DEFAULT_ADMIN_PASSWORD = 'passWord1234!';

export type BlogPostStatus = 'draft' | 'published';

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
	featuredImage: string | null;
	status: BlogPostStatus;
	publishedAt: Date | null;
	authorId: number | null;
	createdAt: Date;
	updatedAt: Date;
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
