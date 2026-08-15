# @urixoft/urx-blog-package

Lightweight SQLite-backed blog for Urixoft SvelteKit projects. Powers the **Latest News** section and full `/blog` routes with an admin panel — no Docker required.

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Database | **SQLite** (`node:sqlite`) | Built into Node 22+, zero install, single file, no native build |
| Storage | `data/urx-blog.db` | Portable, gitignored, created on install |
| Auth | bcryptjs + signed HTTP-only cookies | Simple admin sessions without extra deps |
| ORM | None (raw SQL) | Minimal footprint, easy to inspect |

## Install

From your SvelteKit project root:

```bash
pnpm add @urixoft/urx-blog-package
pnpm urx-blog install
```

This will:

1. Add `.env` entries for database path + session secret
2. Copy route templates into `src/routes/`
3. Create `data/urx-blog.db` and run migrations
4. Seed 3 sample posts
5. Create default admin: `superadmin@urixoft.com` / `Use8to32!`
6. Write `.urx-blog.json` manifest for clean removal

## Remove

```bash
pnpm urx-blog remove
```

Removes copied files and manifest. The SQLite file at `data/urx-blog.db` is preserved unless you delete it manually.

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

Home page `+page.server.ts` injects live posts into the `blog-grid` (Latest News) section.

## Programmatic API

```ts
import { listPublishedPosts, createBlogLoaders } from '@urixoft/urx-blog-package';
import { injectBlogGridIntoSections } from '@urixoft/urx-blog-package/sveltekit';
```

## Environment variables

```env
URX_BLOG_DB_PATH=data/urx-blog.db
URX_BLOG_SESSION_SECRET=<random-hex>
```

## Default admin

- **Email:** superadmin@urixoft.com
- **Password:** Use8to32!

Change the password after first login in production.
