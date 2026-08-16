CREATE TABLE IF NOT EXISTS urx_blog_users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS urx_blog_categories (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	slug TEXT NOT NULL UNIQUE,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS urx_blog_posts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	slug TEXT NOT NULL UNIQUE,
	title TEXT NOT NULL,
	excerpt TEXT,
	content TEXT NOT NULL,
	category TEXT NOT NULL DEFAULT 'News',
	kind TEXT NOT NULL DEFAULT 'news' CHECK (kind IN ('news', 'service')),
	featured_image TEXT,
	status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
	published_at TEXT,
	author_id INTEGER,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at TEXT NOT NULL DEFAULT (datetime('now')),
	FOREIGN KEY (author_id) REFERENCES urx_blog_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_urx_blog_posts_status_published
	ON urx_blog_posts (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_urx_blog_posts_kind
	ON urx_blog_posts (kind);

CREATE TABLE IF NOT EXISTS urx_blog_audit_log (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER,
	user_email TEXT,
	action TEXT NOT NULL,
	entity_type TEXT,
	entity_id INTEGER,
	summary TEXT NOT NULL,
	metadata TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	FOREIGN KEY (user_id) REFERENCES urx_blog_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_urx_blog_audit_log_created
	ON urx_blog_audit_log (created_at DESC);
