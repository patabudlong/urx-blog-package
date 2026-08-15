import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { setupDatabase } from '../index.js';
import { pathExists } from './utils.js';

async function loadEnvFile(projectRoot: string): Promise<void> {
	const envPath = join(projectRoot, '.env');
	if (!(await pathExists(envPath))) return;

	const content = await readFile(envPath, 'utf8');
	for (const line of content.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const [key, ...rest] = trimmed.split('=');
		if (key && !(key in process.env)) {
			process.env[key] = rest.join('=');
		}
	}
}

export async function migrate(projectRoot = process.cwd()): Promise<void> {
	console.log('\n📦 Urixoft Blog Package — migrate\n');
	await loadEnvFile(projectRoot);
	await setupDatabase();
	console.log('\n✅ SQLite database migrated and seeded.\n');
}
