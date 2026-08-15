# Urixoft Blog Package

Lightweight SQLite-backed blog for SvelteKit projects in the Urixoft ecosystem.

## Quick start

```bash
pnpm add github:patabudlong/urx-blog-package#v0.3.0
pnpm blog:install
pnpm blog:migrate
```

## Database

| Component | Choice |
|-----------|--------|
| Engine | **SQLite** via Node.js built-in `node:sqlite` |
| File | `data/urx-blog.db` (created automatically) |
| Docker | **Not required** |

## Image storage (Linode)

Set `LINODE_*` variables in `.env` to enable featured image uploads in `/blog-admin`. See the package README for full details.

## Default admin

- **URL:** `/blog-admin`
- **Email:** `superadmin@urixoft.com`
- **Password:** `Use8to32!`
