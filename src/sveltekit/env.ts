import type { Handle } from '@sveltejs/kit';
import { configureUrxCms } from '../config/runtime.js';

type BlogEnv = {
	URX_CMS_SESSION_SECRET?: string;
	URX_CMS_DB_PATH?: string;
	LINODE_ENDPOINT?: string;
	LINODE_BUCKET?: string;
	LINODE_ACCESS_KEY?: string;
	LINODE_SECRET_KEY?: string;
	LINODE_REGION?: string;
	LINODE_PUBLIC_BASE?: string;
	LINODE_UPLOAD_PREFIX?: string;
	URX_CMS_NAV_LABEL?: string;
	URX_CMS_NEWS_LIMIT?: string;
	URX_CMS_SERVICES_LIMIT?: string;
};

export function createCmsEnvHandle(getEnv: () => BlogEnv): Handle {
	return async ({ event, resolve }) => {
		const env = getEnv();
		configureUrxCms({
			sessionSecret: env.URX_CMS_SESSION_SECRET,
			databasePath: env.URX_CMS_DB_PATH,
			linodeEndpoint: env.LINODE_ENDPOINT,
			linodeBucket: env.LINODE_BUCKET,
			linodeAccessKey: env.LINODE_ACCESS_KEY,
			linodeSecretKey: env.LINODE_SECRET_KEY,
			linodeRegion: env.LINODE_REGION,
			linodePublicBase: env.LINODE_PUBLIC_BASE,
			linodeUploadPrefix: env.LINODE_UPLOAD_PREFIX,
			navLabel: env.URX_CMS_NAV_LABEL,
			newsLimit: env.URX_CMS_NEWS_LIMIT,
			servicesLimit: env.URX_CMS_SERVICES_LIMIT
		});
		return resolve(event);
	};
}
