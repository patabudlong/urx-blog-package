import { createCmsEnvHandle } from '@urixoft/urx-cms-package/sveltekit';
import { env } from '$env/dynamic/private';
import { urxCmsConfig } from '$lib/urx-cms';

export const handle = createCmsEnvHandle(() => ({
	URX_CMS_SESSION_SECRET: env.URX_CMS_SESSION_SECRET,
	URX_CMS_DB_PATH: env.URX_CMS_DB_PATH,
	LINODE_ENDPOINT: env.LINODE_ENDPOINT,
	LINODE_BUCKET: env.LINODE_BUCKET,
	LINODE_ACCESS_KEY: env.LINODE_ACCESS_KEY,
	LINODE_SECRET_KEY: env.LINODE_SECRET_KEY,
	LINODE_REGION: env.LINODE_REGION,
	LINODE_PUBLIC_BASE: env.LINODE_PUBLIC_BASE,
	LINODE_UPLOAD_PREFIX: env.LINODE_UPLOAD_PREFIX ?? urxCmsConfig.uploadPrefix,
	URX_CMS_NAV_LABEL: env.URX_CMS_NAV_LABEL ?? urxCmsConfig.navLabel
}));
