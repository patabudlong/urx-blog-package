import { getBlogNavLabel, normalizeBlogNavLabel, getBlogBasePath, type BlogNavLabel, type BlogIndexPath } from '../adapters/blog-nav.js';

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
