let sessionSecret: string | undefined;
let databasePath: string | undefined;

export type UrxBlogRuntimeConfig = {
	sessionSecret?: string;
	databasePath?: string;
};

export function configureUrxBlog(config: UrxBlogRuntimeConfig): void {
	if (config.sessionSecret) sessionSecret = config.sessionSecret;
	if (config.databasePath) databasePath = config.databasePath;
}

export function getConfiguredSessionSecret(): string | undefined {
	return sessionSecret ?? process.env.URX_BLOG_SESSION_SECRET;
}

export function getConfiguredDatabasePath(): string | undefined {
	return databasePath ?? process.env.URX_BLOG_DB_PATH;
}
