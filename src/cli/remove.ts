import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { readManifest, pathExists, MANIFEST_FILE } from './utils.js';

async function removePath(path: string): Promise<void> {
	if (await pathExists(path)) {
		await unlink(path);
	}
}

async function removeDir(path: string): Promise<void> {
	const { rm } = await import('node:fs/promises');
	if (await pathExists(path)) {
		await rm(path, { recursive: true, force: true });
	}
}

export async function remove(projectRoot = process.cwd()): Promise<void> {
	console.log('\n📦 Urixoft CMS Package — remove\n');

	const manifest = await readManifest(projectRoot);
	if (!manifest) {
		console.log('No .urx-cms.json manifest found. Nothing to remove.');
		return;
	}

	for (const file of [...manifest.files].reverse()) {
		const absolute = join(projectRoot, file);
		await removePath(absolute);
		console.log(`   removed ${file}`);
	}

	await removeDir(join(projectRoot, 'src/routes/cms'));
	await removeDir(join(projectRoot, 'src/routes/blog-admin'));
	await removePath(join(projectRoot, MANIFEST_FILE));

	console.log('\n✅ Urixoft CMS Package removed from this project.');
	console.log('   Note: SQLite database at data/urixoft-local.db was left intact.');
	console.log('   Delete it manually if you want a clean reinstall.\n');
}
