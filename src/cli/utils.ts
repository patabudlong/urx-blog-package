import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { UrxCmsManifest } from '../types.js';

export const MANIFEST_FILE = '.urx-cms.json';
export const PACKAGE_NAME = '@urixoft/urx-cms-package';

export function getPackageRoot(): string {
	return join(dirname(fileURLToPath(import.meta.url)), '../..');
}

export async function pathExists(path: string): Promise<boolean> {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

export async function copyDir(src: string, dest: string, copied: string[] = []): Promise<string[]> {
	await mkdir(dest, { recursive: true });
	const entries = await readdir(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDir(srcPath, destPath, copied);
		} else {
			await copyFile(srcPath, destPath);
			copied.push(destPath);
		}
	}

	return copied;
}

export async function readManifest(projectRoot: string): Promise<UrxCmsManifest | null> {
	const manifestPath = join(projectRoot, MANIFEST_FILE);
	if (!(await pathExists(manifestPath))) return null;
	return JSON.parse(await readFile(manifestPath, 'utf8')) as UrxCmsManifest;
}

export async function writeManifest(projectRoot: string, manifest: UrxCmsManifest): Promise<void> {
	await writeFile(join(projectRoot, MANIFEST_FILE), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

export async function upsertEnvFile(projectRoot: string, entries: Record<string, string>): Promise<void> {
	const envPath = join(projectRoot, '.env');
	let content = '';

	if (await pathExists(envPath)) {
		content = await readFile(envPath, 'utf8');
	}

	const lines = content.split('\n').filter((line) => {
		const key = line.split('=')[0]?.trim();
		return !key || !(key in entries);
	});

	for (const [key, value] of Object.entries(entries)) {
		lines.push(`${key}=${value}`);
	}

	await writeFile(envPath, lines.filter((line, index, arr) => line || index < arr.length - 1).join('\n') + '\n');
}

export async function upsertEnvExample(projectRoot: string, entries: Record<string, string>): Promise<void> {
	const envPath = join(projectRoot, '.env.example');
	let content = '';

	if (await pathExists(envPath)) {
		content = await readFile(envPath, 'utf8');
	}

	if (!content.includes('# Urixoft CMS Package')) {
		content += '\n# Urixoft CMS Package\n';
	}

	for (const [key, value] of Object.entries(entries)) {
		if (!content.includes(`${key}=`)) {
			content += `${key}=${value}\n`;
		}
	}

	await writeFile(envPath, content);
}

export function relPaths(projectRoot: string, absolutePaths: string[]): string[] {
	return absolutePaths.map((path) => relative(projectRoot, path));
}
