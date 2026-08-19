#!/usr/bin/env node
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
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

async function ensureBlogArticleCssImport(projectRoot: string): Promise<void> {
	const candidates = [
		{ path: join(projectRoot, 'src/routes/layout.css'), importLine: "@import '../lib/styles/blog-article.css';" },
		{ path: join(projectRoot, 'src/app.css'), importLine: "@import './lib/styles/blog-article.css';" }
	];

	for (const candidate of candidates) {
		if (!(await pathExists(candidate.path))) continue;
		const content = await readFile(candidate.path, 'utf8');
		if (content.includes('blog-article.css')) return;
		await writeFile(candidate.path, `${candidate.importLine}\n${content}`);
		console.log(`   added ${candidate.importLine} to ${candidate.path.replace(`${projectRoot}/`, '')}`);
		return;
	}
}

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
	console.log('\n📦 Urixoft CMS Package — install\n');

	const templatesDir = join(packageRoot, 'templates');
	const srcDir = join(projectRoot, 'src');
	const copiedFiles: string[] = [];

	if (!(await pathExists(srcDir))) {
		throw new Error('Could not find src/ directory. Run this from a SvelteKit project root.');
	}

	const envEntries = {
		URX_CMS_DB_PATH: 'data/urixoft-local.db',
		URX_CMS_SESSION_SECRET: createSessionSecret()
	};

	await upsertEnvFile(projectRoot, envEntries);
	await upsertEnvExample(projectRoot, {
		...envEntries,
		LINODE_ENDPOINT: 'https://sg-sin-1.linodeobjects.com',
		LINODE_BUCKET: 'your-bucket',
		LINODE_ACCESS_KEY: 'your-access-key',
		LINODE_SECRET_KEY: 'your-secret-key',
		LINODE_REGION: 'sg-sin-1',
		LINODE_PUBLIC_BASE: 'https://your-bucket.sg-sin-1.linodeobjects.com',
		LINODE_UPLOAD_PREFIX: 'urx-cms',
		PUBLIC_MANAGED_IMAGE_BASE: 'https://your-bucket.sg-sin-1.linodeobjects.com',
		URX_CMS_NAV_LABEL: 'Blog',
		URX_CMS_NEWS_LIMIT: '20',
		URX_CMS_SERVICES_LIMIT: '10'
	});
	await loadEnvFile(projectRoot);

	await mkdir(join(projectRoot, 'data'), { recursive: true });

	const skipHostFiles = new Set([
		join(srcDir, 'hooks.server.ts'),
		join(srcDir, 'routes', '+page.server.ts'),
		join(srcDir, 'routes', '+layout.server.ts')
	]);
	const skipExisting = (destPath: string) => skipHostFiles.has(destPath);

	const legacyPageLoad = join(srcDir, 'routes', '+page.ts');
	if (await pathExists(legacyPageLoad)) {
		await unlink(legacyPageLoad);
		console.log('   replaced src/routes/+page.ts with +page.server.ts');
	}

	const routeCopies = await copyDir(join(templatesDir, 'routes'), join(srcDir, 'routes'), [], {
		skipExisting
	});
	copiedFiles.push(...routeCopies);

	const libCopies = await copyDir(join(templatesDir, 'lib'), join(srcDir, 'lib'), []);
	copiedFiles.push(...libCopies);

	const staticTemplateDir = join(templatesDir, 'static');
	if (await pathExists(staticTemplateDir)) {
		const staticCopies = await copyDir(staticTemplateDir, join(projectRoot, 'static'), []);
		copiedFiles.push(...staticCopies);
	}

	const srcTemplateDir = join(templatesDir, 'src');
	if (await pathExists(srcTemplateDir)) {
		const srcCopies = await copyDir(srcTemplateDir, srcDir, [], { skipExisting });
		copiedFiles.push(...srcCopies);
	}

	await ensureBlogArticleCssImport(projectRoot);

	const legacyBlogPageLoad = join(srcDir, 'routes', '(marketing)', 'blog', '+page.ts');
	if (await pathExists(legacyBlogPageLoad)) {
		await unlink(legacyBlogPageLoad);
	}

	console.log('🗄️  Creating SQLite database and seeding default admin...');
	await setupDatabase();

	const manifest = {
		version: '0.5.1',
		installedAt: new Date().toISOString(),
		packageName: PACKAGE_NAME,
		files: relPaths(projectRoot, copiedFiles),
		envKeys: Object.keys(envEntries)
	};

	await writeManifest(projectRoot, manifest);

	console.log('\n✅ Urixoft CMS Package installed successfully!\n');
	console.log('   Database:       data/urixoft-local.db (SQLite, no Docker required)');
	console.log('   Admin URL:      /cms');
	console.log('   Admin email:    superadmin@urixoft.com');
	console.log('   Admin password: passWord1234!');
	console.log(`   Manifest:       ${MANIFEST_FILE}\n`);
	console.log('   Rich text:      TipTap editor on post create/edit (requires @tiptap/* peer deps)\n');
	console.log('   Next: restart your dev server and visit /cms\n');
}
