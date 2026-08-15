# @urixoft/urx-blog-package

Lightweight SQLite-backed blog for Urixoft SvelteKit projects. Powers the **Latest News** section and full `/blog` routes with an admin panel — no Docker required.

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Database | **SQLite** (`node:sqlite`) | Built into Node 22+, zero install, single file, no native build |
| Storage | `data/urx-blog.db` | Portable, gitignored, created on install |
| Images | **Linode Object Storage** (S3-compatible) | Featured image uploads from blog admin |
| Auth | bcryptjs + signed HTTP-only cookies | Simple admin sessions without extra deps |
| ORM | None (raw SQL) | Minimal footprint, easy to inspect |

## Install

From your SvelteKit project root:

```bash
pnpm add github:patabudlong/urx-blog-package#v0.3.0
pnpm urx-blog install
```

This will:

1. Add `.env` entries for database path + session secret
2. Copy route templates into `src/routes/` (including `hooks.server.ts`)
3. Create `data/urx-blog.db` and run migrations
4. Seed 3 sample posts
5. Create default admin: `superadmin@urixoft.com` / `passWord1234!`
6. Write `.urx-blog.json` manifest for clean removal

## SvelteKit environment bridge

SvelteKit loads `.env` via `$env/dynamic/private`, not `process.env`. The install template adds `src/hooks.server.ts`:

```ts
import { createBlogEnvHandle } from '@urixoft/urx-blog-package/sveltekit';
import { env } from '$env/dynamic/private';

export const handle = createBlogEnvHandle(() => ({
  URX_BLOG_SESSION_SECRET: env.URX_BLOG_SESSION_SECRET,
  URX_BLOG_DB_PATH: env.URX_BLOG_DB_PATH,
  LINODE_ENDPOINT: env.LINODE_ENDPOINT,
  LINODE_BUCKET: env.LINODE_BUCKET,
  LINODE_ACCESS_KEY: env.LINODE_ACCESS_KEY,
  LINODE_SECRET_KEY: env.LINODE_SECRET_KEY,
  LINODE_REGION: env.LINODE_REGION,
  LINODE_PUBLIC_BASE: env.LINODE_PUBLIC_BASE
}));
```

## Image uploads (Linode Object Storage)

Configure Linode S3-compatible storage in `.env`. When set, the blog admin shows a **Featured Image Upload** field on create/edit post forms. Files are stored under `urx-blog/` in your bucket.

```env
LINODE_ENDPOINT=https://sg-sin-1.linodeobjects.com
LINODE_BUCKET=your-bucket
LINODE_ACCESS_KEY=your-access-key
LINODE_SECRET_KEY=your-secret-key
LINODE_REGION=sg-sin-1
LINODE_PUBLIC_BASE=https://your-bucket.sg-sin-1.linodeobjects.com
```

- Allowed types: JPEG, PNG, WebP, GIF
- Max size: 5 MB
- You can still paste an image URL instead of uploading

### Programmatic upload

```ts
import { uploadBlogImage, resolveFeaturedImageFromForm } from '@urixoft/urx-blog-package';

const url = await uploadBlogImage({
  buffer,
  contentType: 'image/jpeg',
  filename: 'hero.jpg'
});
```

## Remove

```bash
pnpm urx-blog remove
```

## Routes added on install

| Route | Purpose |
|-------|---------|
| `/blog` | Blog index |
| `/blog/[slug]` | Post detail |
| `/blog-admin` | Admin dashboard |
| `/blog-admin/login` | Admin sign-in |
| `/blog-admin/posts` | Post list |
| `/blog-admin/posts/new` | Create post |
| `/blog-admin/posts/[id]` | Edit post |

## Programmatic API

```ts
import { listPublishedPosts, isBlogStorageConfigured } from '@urixoft/urx-blog-package';
import { injectBlogGridIntoSections } from '@urixoft/urx-blog-package/sveltekit';
```

## Environment variables

```env
URX_BLOG_DB_PATH=data/urx-blog.db
URX_BLOG_SESSION_SECRET=<random-hex>

# Optional — enables featured image uploads in admin
LINODE_ENDPOINT=https://sg-sin-1.linodeobjects.com
LINODE_BUCKET=your-bucket
LINODE_ACCESS_KEY=your-access-key
LINODE_SECRET_KEY=your-secret-key
LINODE_REGION=sg-sin-1
LINODE_PUBLIC_BASE=https://your-bucket.sg-sin-1.linodeobjects.com
```

## Default admin

- **Email:** superadmin@urixoft.com
- **Password:** passWord1234!

Change the password after first login in production.
