import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { getConfiguredSessionSecret } from '../config/runtime.js';
import type { BlogUser } from '../types.js';

const SESSION_COOKIE = 'urx_cms_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getSessionSecret(): string {
	const secret = getConfiguredSessionSecret();
	if (!secret) {
		throw new Error('URX_CMS_SESSION_SECRET is not set. Run `pnpm urx-cms install` first.');
	}
	return secret;
}

function sign(payload: string, secret: string): string {
	return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSessionToken(user: BlogUser): string {
	const payload = Buffer.from(
		JSON.stringify({
			sub: user.id,
			email: user.email,
			role: user.role,
			exp: Date.now() + SESSION_MAX_AGE * 1000
		})
	).toString('base64url');

	return `${payload}.${sign(payload, getSessionSecret())}`;
}

export function parseSessionToken(token: string | undefined): BlogUser | null {
	if (!token) return null;

	const [payload, signature] = token.split('.');
	if (!payload || !signature) return null;

	const expected = sign(payload, getSessionSecret());
	const valid =
		expected.length === signature.length &&
		timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

	if (!valid) return null;

	try {
		const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
			sub: number;
			email: string;
			role: 'admin' | 'editor';
			exp: number;
		};

		if (data.exp < Date.now()) return null;

		return {
			id: data.sub,
			email: data.email,
			role: data.role,
			createdAt: new Date()
		};
	} catch {
		return null;
	}
}

export function getSessionCookieName(): string {
	return SESSION_COOKIE;
}

export function getSessionMaxAge(): number {
	return SESSION_MAX_AGE;
}

export function createSessionSecret(): string {
	return randomBytes(32).toString('hex');
}

export function getSessionFromCookies(cookies: { get: (name: string) => string | undefined }): BlogUser | null {
	return parseSessionToken(cookies.get(SESSION_COOKIE));
}
