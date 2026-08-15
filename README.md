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
  LINODE_PUBLIC_BASE: env.LINODE_PUBLIC_BASE
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

# Optional — enables featured image uploads in admin
LINODE_ENDPOINT=https://sg-sin-1.linodeobjects.com
LINODE_BUCKET=your-bucket
LINODE_ACCESS_KEY=your-access-key
LINODE_SECRET_KEY=your-secret-key
LINODE_REGION=sg-sin-1
LINODE_PUBLIC_BASE=https://your-bucket.sg-sin-1.linodeobjects.com
LINODE_UPLOAD_PREFIX=urx-cms
```

## Default admin

- **Email:** superadmin@urixoft.com
- **Password:** passWord1234!

Change the password after first login in production.
