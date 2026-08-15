let sessionSecret: string | undefined;
let databasePath: string | undefined;
let linodeEndpoint: string | undefined;
let linodeBucket: string | undefined;
let linodeAccessKey: string | undefined;
let linodeSecretKey: string | undefined;
let linodeRegion: string | undefined;
let linodePublicBase: string | undefined;
let linodeUploadPrefix: string | undefined;

export type UrxBlogRuntimeConfig = {
	sessionSecret?: string;
	databasePath?: string;
	linodeEndpoint?: string;
	linodeBucket?: string;
	linodeAccessKey?: string;
	linodeSecretKey?: string;
	linodeRegion?: string;
	linodePublicBase?: string;
	linodeUploadPrefix?: string;
};

export function configureUrxBlog(config: UrxBlogRuntimeConfig): void {
	if (config.sessionSecret) sessionSecret = config.sessionSecret;
	if (config.databasePath) databasePath = config.databasePath;
	if (config.linodeEndpoint) linodeEndpoint = config.linodeEndpoint;
	if (config.linodeBucket) linodeBucket = config.linodeBucket;
	if (config.linodeAccessKey) linodeAccessKey = config.linodeAccessKey;
	if (config.linodeSecretKey) linodeSecretKey = config.linodeSecretKey;
	if (config.linodeRegion) linodeRegion = config.linodeRegion;
	if (config.linodePublicBase) linodePublicBase = config.linodePublicBase;
	if (config.linodeUploadPrefix) linodeUploadPrefix = config.linodeUploadPrefix;
}

export function getLinodeUploadPrefix(): string {
	const prefix = linodeUploadPrefix ?? process.env.LINODE_UPLOAD_PREFIX ?? 'urx-blog';
	return prefix.replace(/^\/+|\/+$/g, '');
}

export function getConfiguredSessionSecret(): string | undefined {
	return sessionSecret ?? process.env.URX_BLOG_SESSION_SECRET;
}

export function getConfiguredDatabasePath(): string | undefined {
	return databasePath ?? process.env.URX_BLOG_DB_PATH;
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
