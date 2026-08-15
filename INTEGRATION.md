# Urixoft Blog Package

Lightweight SQLite-backed blog for SvelteKit projects in the Urixoft ecosystem.

## Quick start

```bash
pnpm add @urixoft/urx-blog-package
pnpm blog:install          # copies routes, creates SQLite DB, seeds data
pnpm blog:migrate          # re-run migrations / seed if needed
pnpm blog:remove           # uninstall from this project
```

## Database

| Component | Choice |
|-----------|--------|
| Engine | **SQLite** via Node.js built-in `node:sqlite` |
| File | `data/urx-blog.db` (created automatically) |
| Docker | **Not required** |

## Default admin

- **URL:** `/blog-admin`
- **Email:** `superadmin@urixoft.com`
- **Password:** `Use8to32!`

## What gets installed

- Home page server load injects live posts into the **Latest News** `blog-grid` section
- `/blog` — post index
- `/blog/[slug]` — post detail
- `/blog-admin` — admin dashboard, login, CRUD

See `packages/urx-blog-package/README.md` for full API docs.
