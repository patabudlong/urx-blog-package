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

export async function copyDir(
	src: string,
	dest: string,
	copied: string[] = [],
	options: { skipExisting?: (destPath: string) => boolean } = {}
): Promise<string[]> {
	await mkdir(dest, { recursive: true });
	const entries = await readdir(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);

		if (entry.isDirectory()) {
			await copyDir(srcPath, destPath, copied, options);
		} else if (options.skipExisting?.(destPath) && (await pathExists(destPath))) {
			continue;
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

	const existingKeys = new Set(
		content
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith('#'))
			.map((line) => line.split('=')[0]?.trim())
			.filter((key): key is string => Boolean(key))
	);

	const additions: string[] = [];
	for (const [key, value] of Object.entries(entries)) {
		if (!existingKeys.has(key)) {
			additions.push(`${key}=${value}`);
		}
	}

	if (additions.length === 0 && content) return;

	const next = content.trimEnd();
	const body = [next, ...additions].filter(Boolean).join('\n') + '\n';
	await writeFile(envPath, body);
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
