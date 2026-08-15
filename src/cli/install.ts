#!/usr/bin/env node
import { mkdir } from 'node:fs/promises';
import { readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { createSessionSecret } from '../auth/session.js';
import { setupDatabase } from '../index.js';
import {
	copyDir,
	getPackageRoot,
	MANIFEST_FILE,
	PACKAGE_NAME,
	pathExists,
	relPaths,
	upsertEnvExample,
	upsertEnvFile,
	writeManifest
} from './utils.js';

const packageRoot = getPackageRoot();

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

export async function install(projectRoot = process.cwd()): Promise<void> {
	console.log('\n📦 Urixoft Blog Package — install\n');

	const templatesDir = join(packageRoot, 'templates');
	const srcDir = join(projectRoot, 'src');
	const copiedFiles: string[] = [];

	if (!(await pathExists(srcDir))) {
		throw new Error('Could not find src/ directory. Run this from a SvelteKit project root.');
	}

	const envEntries = {
		URX_BLOG_DB_PATH: 'data/urx-blog.db',
		URX_BLOG_SESSION_SECRET: createSessionSecret()
	};

	await upsertEnvFile(projectRoot, envEntries);
	await upsertEnvExample(projectRoot, envEntries);
	await loadEnvFile(projectRoot);

	await mkdir(join(projectRoot, 'data'), { recursive: true });

	const legacyPageLoad = join(srcDir, 'routes', '+page.ts');
	if (await pathExists(legacyPageLoad)) {
		await unlink(legacyPageLoad);
		console.log('   replaced src/routes/+page.ts with +page.server.ts');
	}

	const routeCopies = await copyDir(join(templatesDir, 'routes'), join(srcDir, 'routes'), []);
	copiedFiles.push(...routeCopies);

	const libCopies = await copyDir(join(templatesDir, 'lib'), join(srcDir, 'lib'), []);
	copiedFiles.push(...libCopies);

	const srcTemplateDir = join(templatesDir, 'src');
	if (await pathExists(srcTemplateDir)) {
		const srcCopies = await copyDir(srcTemplateDir, srcDir, []);
		copiedFiles.push(...srcCopies);
	}

	const legacyBlogPageLoad = join(srcDir, 'routes', '(marketing)', 'blog', '+page.ts');
	if (await pathExists(legacyBlogPageLoad)) {
		await unlink(legacyBlogPageLoad);
	}

	console.log('🗄️  Creating SQLite database and seeding default admin...');
	await setupDatabase();

	const manifest = {
		version: '0.2.0',
		installedAt: new Date().toISOString(),
		packageName: PACKAGE_NAME,
		files: relPaths(projectRoot, copiedFiles),
		envKeys: Object.keys(envEntries)
	};

	await writeManifest(projectRoot, manifest);

	console.log('\n✅ Urixoft Blog Package installed successfully!\n');
	console.log('   Database:       data/urx-blog.db (SQLite, no Docker required)');
	console.log('   Admin URL:      /blog-admin');
	console.log('   Admin email:    superadmin@urixoft.com');
	console.log('   Admin password: Use8to32!');
	console.log(`   Manifest:       ${MANIFEST_FILE}\n`);
	console.log('   Next: restart your dev server and visit /blog\n');
}
