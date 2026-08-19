# @urixoft/urx-cms-package

Lightweight SQLite-backed CMS for Urixoft SvelteKit projects. Powers blog/news content, `/cms` admin, and future site modules — no Docker required.

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Database | **SQLite** (`node:sqlite`) | Built into Node 22+, zero install, single file, no native build |
| Storage | `data/urixoft-local.db` | Portable, gitignored, created on install |
| Images | **Linode Object Storage** (S3-compatible) | Featured image uploads from CMS |
| Auth | bcryptjs + signed HTTP-only cookies | Simple admin sessions without extra deps |
| ORM | None (raw SQL) | Minimal footprint, easy to inspect |

## Install

From your SvelteKit project root:

```bash
pnpm add github:patabudlong/urx-cms-package#v0.3.0
pnpm urx-cms install
```

This will:

1. Add `.env` entries for database path + session secret
2. Copy route templates into `src/routes/` (including `hooks.server.ts`)
3. Create `data/urixoft-local.db` and run migrations
4. Seed 3 sample posts
5. Create default admin: `superadmin@urixoft.com` / `passWord1234!`
6. Write `.urx-cms.json` manifest for clean removal

## SvelteKit environment bridge

SvelteKit loads `.env` via `$env/dynamic/private`, not `process.env`. The install template adds `src/hooks.server.ts`:

```ts
import { createCmsEnvHandle } from '@urixoft/urx-cms-package/sveltekit';
import { env } from '$env/dynamic/private';

export const handle = createCmsEnvHandle(() => ({
  URX_CMS_SESSION_SECRET: env.URX_CMS_SESSION_SECRET,
  URX_CMS_DB_PATH: env.URX_CMS_DB_PATH,
  LINODE_ENDPOINT: env.LINODE_ENDPOINT,
  LINODE_BUCKET: env.LINODE_BUCKET,
  LINODE_ACCESS_KEY: env.LINODE_ACCESS_KEY,
  LINODE_SECRET_KEY: env.LINODE_SECRET_KEY,
  LINODE_REGION: env.LINODE_REGION,
  LINODE_PUBLIC_BASE: env.LINODE_PUBLIC_BASE,
  LINODE_UPLOAD_PREFIX: env.LINODE_UPLOAD_PREFIX,
  URX_CMS_NAV_LABEL: env.URX_CMS_NAV_LABEL,
  URX_CMS_NEWS_LIMIT: env.URX_CMS_NEWS_LIMIT,
  URX_CMS_SERVICES_LIMIT: env.URX_CMS_SERVICES_LIMIT
}));
```

## Image uploads (Linode Object Storage)

Configure Linode S3-compatible storage in `.env`. When set, the CMS shows a **Featured Image Upload** field on create/edit post forms. Files are stored under a configurable prefix (default `urx-cms/`) in your bucket.

```env
LINODE_ENDPOINT=https://sg-sin-1.linodeobjects.com
LINODE_BUCKET=your-bucket
LINODE_ACCESS_KEY=your-access-key
LINODE_SECRET_KEY=your-secret-key
LINODE_REGION=sg-sin-1
LINODE_PUBLIC_BASE=https://your-bucket.sg-sin-1.linodeobjects.com
LINODE_UPLOAD_PREFIX=urx-cms
```

- Allowed types: JPEG, PNG, WebP, GIF
- Max size: 5 MB
- You can still paste an image URL instead of uploading

### Image placeholders

Install copies `BlogFeaturedImage.svelte` and `/images/blog/placeholder.svg`. Posts without a featured image (or with a broken URL) show a blurred placeholder with an **Image coming soon** label.

Customize the fallback in `src/lib/urx-cms.ts`:

```ts
export const urxCmsConfig = {
  fallbackImage: '/images/blog/placeholder.svg',
  uploadPrefix: 'your-bucket-folder'
};
```

Helpers exported from the package:

```ts
import {
  resolveBlogImageUrl,
  isBlogImagePlaceholder,
  DEFAULT_BLOG_IMAGE_PLACEHOLDER
} from '@urixoft/urx-cms-package';
```

### Shareable posts

Install copies `BlogShareBar.svelte` onto post detail pages. Each post gets:

- **Share bar** — copy link, Facebook, LinkedIn, X, WhatsApp, and email
- **Open Graph / Twitter meta** — canonical URL, title, description, featured image, and article timestamps

`createBlogPostLoad()` returns `share` and enriched `seo` for use in templates:

```ts
import { createBlogPostLoad } from '@urixoft/urx-cms-package/sveltekit';
import { site } from '$lib/config/site';

export const load = createBlogPostLoad({ siteOrigin: site.url });
```

Build custom share links programmatically:

```ts
import { buildBlogShareData, buildBlogPostUrl } from '@urixoft/urx-cms-package';
```

For private Linode buckets, pass `resolveShareImageUrl` so social previews use your public image proxy (see project `src/lib/urx-cms.ts`).

### Programmatic upload

```ts
import { uploadBlogImage, resolveFeaturedImageFromForm } from '@urixoft/urx-cms-package';

const url = await uploadBlogImage({
  buffer,
  contentType: 'image/jpeg',
  filename: 'hero.jpg'
});
```

## Remove

```bash
pnpm urx-cms remove
```

## Routes added on install

| Route | Purpose |
|-------|---------|
| `/blog` | Blog index |
| `/blog/[slug]` | Post detail |
| `/news` | News index (when `URX_CMS_NAV_LABEL=News`) |
| `/news/[slug]` | News post detail |
| `/api/blog-media` | Public proxy for private Linode featured images |
| `/cms` | Admin dashboard |
| `/cms/login` | Admin sign-in |
| `/cms/posts` | Post list |
| `/cms/posts/new` | Create post |
| `/cms/posts/[id]` | Edit post |

## Programmatic API

```ts
import { listPublishedPosts, isBlogStorageConfigured } from '@urixoft/urx-cms-package';
import { injectBlogGridIntoSections } from '@urixoft/urx-cms-package/sveltekit';
```

## Environment variables

```env
URX_CMS_DB_PATH=data/urixoft-local.db
URX_CMS_SESSION_SECRET=<random-hex>

# Package page limits (set per client plan)
URX_CMS_NEWS_LIMIT=20
URX_CMS_SERVICES_LIMIT=10

# Optional — enables featured image uploads in admin
LINODE_ENDPOINT=https://sg-sin-1.linodeobjects.com
LINODE_BUCKET=your-bucket
LINODE_ACCESS_KEY=your-access-key
LINODE_SECRET_KEY=your-secret-key
LINODE_REGION=sg-sin-1
LINODE_PUBLIC_BASE=https://your-bucket.sg-sin-1.linodeobjects.com
LINODE_UPLOAD_PREFIX=urx-cms
PUBLIC_MANAGED_IMAGE_BASE=https://your-bucket.sg-sin-1.linodeobjects.com
```

Private buckets: public pages load featured images through `/api/blog-media`. Set `PUBLIC_MANAGED_IMAGE_BASE` to the same origin as `LINODE_PUBLIC_BASE`.

## Package page limits

Each client plan is configured in `.env`. News/blog and service pages are counted separately (drafts and published both count):

| Variable | Default | Applies to |
|----------|---------|------------|
| `URX_CMS_NEWS_LIMIT` | `20` | News/blog posts |
| `URX_CMS_SERVICES_LIMIT` | `10` | Service pages |

The CMS blocks create and duplicate when a type is at its limit. Change the numbers to match the package sold to that client.

## Default admin

- **Email:** superadmin@urixoft.com
- **Password:** passWord1234!

Change the password after first login in production.
