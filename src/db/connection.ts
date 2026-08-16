import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { getConfiguredDatabasePath } from '../config/runtime.js';
import type { UrxCmsConfig } from '../types.js';

let db: DatabaseSync | null = null;

export function getDatabasePath(config: UrxCmsConfig = {}, projectRoot = process.cwd()): string {
	const fromConfig = config.databasePath ?? getConfiguredDatabasePath() ?? 'data/urixoft-local.db';
	return resolve(projectRoot, fromConfig);
}

export function getDb(config: UrxCmsConfig = {}, projectRoot = process.cwd()): DatabaseSync {
	if (!db) {
		const path = getDatabasePath(config, projectRoot);
		mkdirSync(dirname(path), { recursive: true });
		db = new DatabaseSync(path);
		db.exec('PRAGMA journal_mode = WAL');
		db.exec('PRAGMA foreign_keys = ON');
		ensurePostKindColumn(db);
	}

	return db;
}

function ensurePostKindColumn(database: DatabaseSync): void {
	const columns = database.prepare('PRAGMA table_info(urx_blog_posts)').all() as { name: string }[];
	if (columns.length === 0) return;

	if (!columns.some((column) => column.name === 'kind')) {
		database.exec(`ALTER TABLE urx_blog_posts ADD COLUMN kind TEXT NOT NULL DEFAULT 'news'`);
	}

	database.exec(
		'CREATE INDEX IF NOT EXISTS idx_urx_blog_posts_kind ON urx_blog_posts (kind)'
	);
}

export async function query<T>(
	sql: string,
	params?: Record<string, string | number | null>
): Promise<T[]> {
	return getDb().prepare(sql).all(params ?? {}) as T[];
}

export async function queryOne<T>(
	sql: string,
	params?: Record<string, string | number | null>
): Promise<T | null> {
	const row = getDb().prepare(sql).get(params ?? {});
	return (row as T | undefined) ?? null;
}

export async function execute(
	sql: string,
	params?: Record<string, string | number | null>
): Promise<number> {
	const result = getDb().prepare(sql).run(params ?? {});
	return Number(result.lastInsertRowid);
}

export async function closeDb(): Promise<void> {
	if (db) {
		db.close();
		db = null;
	}
}

export async function pingDatabase(config: UrxCmsConfig = {}): Promise<boolean> {
	try {
		getDb(config).prepare('SELECT 1').get();
		return true;
	} catch {
		return false;
	}
}
