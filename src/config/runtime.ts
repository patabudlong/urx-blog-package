import { getBlogNavLabel, normalizeBlogNavLabel, getBlogBasePath, type BlogNavLabel, type BlogIndexPath } from '../adapters/blog-nav.js';
import {
	DEFAULT_NEWS_LIMIT,
	DEFAULT_SERVICES_LIMIT,
	parsePostLimit,
	type CmsPostKind
} from '../types.js';

let sessionSecret: string | undefined;
let databasePath: string | undefined;
let linodeEndpoint: string | undefined;
let linodeBucket: string | undefined;
let linodeAccessKey: string | undefined;
let linodeSecretKey: string | undefined;
let linodeRegion: string | undefined;
let linodePublicBase: string | undefined;
let linodeUploadPrefix: string | undefined;
let blogNavLabel: BlogNavLabel | undefined;
let newsLimit: number | undefined;
let servicesLimit: number | undefined;

export type UrxCmsRuntimeConfig = {
	sessionSecret?: string;
	databasePath?: string;
	linodeEndpoint?: string;
	linodeBucket?: string;
	linodeAccessKey?: string;
	linodeSecretKey?: string;
	linodeRegion?: string;
	linodePublicBase?: string;
	linodeUploadPrefix?: string;
	navLabel?: string;
	newsLimit?: string | number;
	servicesLimit?: string | number;
};

export function configureUrxCms(config: UrxCmsRuntimeConfig): void {
	if (config.sessionSecret) sessionSecret = config.sessionSecret;
	if (config.databasePath) databasePath = config.databasePath;
	if (config.linodeEndpoint) linodeEndpoint = config.linodeEndpoint;
	if (config.linodeBucket) linodeBucket = config.linodeBucket;
	if (config.linodeAccessKey) linodeAccessKey = config.linodeAccessKey;
	if (config.linodeSecretKey) linodeSecretKey = config.linodeSecretKey;
	if (config.linodeRegion) linodeRegion = config.linodeRegion;
	if (config.linodePublicBase) linodePublicBase = config.linodePublicBase;
	if (config.linodeUploadPrefix) linodeUploadPrefix = config.linodeUploadPrefix;
	if (config.navLabel) blogNavLabel = normalizeBlogNavLabel(config.navLabel);
	if (config.newsLimit !== undefined) newsLimit = parsePostLimit(config.newsLimit, DEFAULT_NEWS_LIMIT);
	if (config.servicesLimit !== undefined) {
		servicesLimit = parsePostLimit(config.servicesLimit, DEFAULT_SERVICES_LIMIT);
	}
}

export function getConfiguredBlogNavLabel(): BlogNavLabel {
	return blogNavLabel ?? getBlogNavLabel();
}

export function getConfiguredBlogBasePath(): BlogIndexPath {
	return getBlogBasePath(getConfiguredBlogNavLabel());
}

export function getLinodeUploadPrefix(): string {
	const prefix = linodeUploadPrefix ?? process.env.LINODE_UPLOAD_PREFIX ?? 'urx-cms';
	return prefix.replace(/^\/+|\/+$/g, '');
}

export function getConfiguredSessionSecret(): string | undefined {
	return sessionSecret ?? process.env.URX_CMS_SESSION_SECRET;
}

export function getConfiguredDatabasePath(): string | undefined {
	return databasePath ?? process.env.URX_CMS_DB_PATH;
}

export function getConfiguredPostLimits(): { news: number; service: number } {
	return {
		news: newsLimit ?? parsePostLimit(process.env.URX_CMS_NEWS_LIMIT, DEFAULT_NEWS_LIMIT),
		service: servicesLimit ?? parsePostLimit(process.env.URX_CMS_SERVICES_LIMIT, DEFAULT_SERVICES_LIMIT)
	};
}

export function getPostKindLabel(kind: CmsPostKind): string {
	return kind === 'service' ? 'Service' : getConfiguredBlogNavLabel();
}

export function getLinodeStorageConfig():
	| {
			endpoint: string;
			bucket: string;
			accessKey: string;
			secretKey: string;
			region: string;
			publicBase: string;
	  }
	| null {
	const endpoint = linodeEndpoint ?? process.env.LINODE_ENDPOINT;
	const bucket = linodeBucket ?? process.env.LINODE_BUCKET;
	const accessKey = linodeAccessKey ?? process.env.LINODE_ACCESS_KEY;
	const secretKey = linodeSecretKey ?? process.env.LINODE_SECRET_KEY;
	const region = linodeRegion ?? process.env.LINODE_REGION;
	const publicBase = linodePublicBase ?? process.env.LINODE_PUBLIC_BASE;

	if (!endpoint || !bucket || !accessKey || !secretKey || !region || !publicBase) {
		return null;
	}

	return { endpoint, bucket, accessKey, secretKey, region, publicBase };
}

export function isBlogStorageConfigured(): boolean {
	return getLinodeStorageConfig() !== null;
}
