# Urixoft CMS Package

Lightweight SQLite-backed CMS for SvelteKit projects in the Urixoft ecosystem.

## Quick start

```bash
pnpm add github:patabudlong/urx-cms-package#v0.3.0
pnpm cms:install
pnpm cms:migrate
```

## Database

| Component | Choice |
|-----------|--------|
| Engine | **SQLite** via Node.js built-in `node:sqlite` |
| File | `data/urixoft-local.db` (created automatically) |
| Docker | **Not required** |

## Image storage (Linode)

Set `LINODE_*` variables in `.env` to enable featured image uploads in `/cms`. See the package README for full details.

Set `URX_CMS_NEWS_LIMIT` (default 20) and `URX_CMS_SERVICES_LIMIT` (default 10) to match the client plan. These cap how many news/blog and service pages can be created.

## Default admin

- **URL:** `/cms`
- **Email:** `superadmin@urixoft.com`
- **Password:** `passWord1234!`
