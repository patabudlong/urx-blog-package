import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getLinodeStorageConfig, getLinodeUploadPrefix } from '../config/runtime.js';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 5 * 1024 * 1024;

export type BlogImageUpload = {
	buffer: Buffer;
	contentType: string;
	filename: string;
};

function extensionFor(contentType: string, filename: string): string {
	const fromName = extname(filename).toLowerCase();
	if (fromName) return fromName;
	switch (contentType) {
		case 'image/jpeg':
			return '.jpg';
		case 'image/png':
			return '.png';
		case 'image/webp':
			return '.webp';
		case 'image/gif':
			return '.gif';
		default:
			return '.jpg';
	}
}

function getClient(): S3Client {
	const config = getLinodeStorageConfig();
	if (!config) {
		throw new Error(
			'Linode Object Storage is not configured. Set LINODE_* variables in .env — see package README.'
		);
	}

	return new S3Client({
		endpoint: config.endpoint,
		region: config.region,
		credentials: {
			accessKeyId: config.accessKey,
			secretAccessKey: config.secretKey
		},
		forcePathStyle: false
	});
}

export async function uploadBlogImage(upload: BlogImageUpload): Promise<string> {
	if (!ALLOWED_TYPES.has(upload.contentType)) {
		throw new Error('Only JPEG, PNG, WebP, and GIF images are allowed.');
	}

	if (upload.buffer.byteLength > MAX_BYTES) {
		throw new Error('Image must be 5 MB or smaller.');
	}

	const config = getLinodeStorageConfig();
	if (!config) {
		throw new Error('Linode Object Storage is not configured.');
	}

	const ext = extensionFor(upload.contentType, upload.filename);
	const key = `${getLinodeUploadPrefix()}/${randomUUID()}${ext}`;
	const client = getClient();

	await client.send(
		new PutObjectCommand({
			Bucket: config.bucket,
			Key: key,
			Body: upload.buffer,
			ContentType: upload.contentType
		})
	);

	const base = config.publicBase.replace(/\/$/, '');
	return `${base}/${key}`;
}

export async function resolveFeaturedImageFromForm(
	form: FormData,
	fallbackUrl?: string | null
): Promise<string | undefined> {
	const urlField = String(form.get('featuredImage') ?? '').trim();
	const file = form.get('featuredImageFile');

	if (file instanceof File && file.size > 0) {
		const buffer = Buffer.from(await file.arrayBuffer());
		return uploadBlogImage({
			buffer,
			contentType: file.type || 'application/octet-stream',
			filename: file.name
		});
	}

	return urlField || fallbackUrl || undefined;
}

export function resolveManagedImageKey(publicUrl: string): string | null {
	const config = getLinodeStorageConfig();
	if (!config) return null;

	const base = config.publicBase.replace(/\/$/, '');

	try {
		const parsed = new URL(publicUrl);
		const baseUrl = new URL(base);

		if (parsed.origin !== baseUrl.origin) {
			return null;
		}

		const key = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
		return key || null;
	} catch {
		return null;
	}
}

export async function fetchManagedBlogImage(
	publicUrl: string
): Promise<{ body: Uint8Array; contentType: string }> {
	const config = getLinodeStorageConfig();
	if (!config) {
		throw new Error('Linode Object Storage is not configured.');
	}

	const key = resolveManagedImageKey(publicUrl);
	if (!key) {
		throw new Error('Invalid image URL.');
	}

	const client = getClient();
	const response = await client.send(
		new GetObjectCommand({
			Bucket: config.bucket,
			Key: key
		})
	);

	if (!response.Body) {
		throw new Error('Image not found.');
	}

	return {
		body: await response.Body.transformToByteArray(),
		contentType: response.ContentType ?? 'application/octet-stream'
	};
}
