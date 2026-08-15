import bcrypt from 'bcryptjs';
import { queryOne } from '../db/connection.js';
import type { BlogUser } from '../types.js';

type UserRow = {
	id: number;
	email: string;
	role: 'admin' | 'editor';
	created_at: string;
};

function mapUser(row: UserRow): BlogUser {
	return {
		id: row.id,
		email: row.email,
		role: row.role,
		createdAt: new Date(row.created_at)
	};
}

export async function findUserByEmail(email: string): Promise<BlogUser | null> {
	const row = await queryOne<UserRow & { password_hash: string }>(
		'SELECT id, email, password_hash, role, created_at FROM urx_blog_users WHERE email = :email LIMIT 1',
		{ email }
	);
	return row ? mapUser(row) : null;
}

export async function verifyUser(email: string, password: string): Promise<BlogUser | null> {
	const row = await queryOne<UserRow & { password_hash: string }>(
		'SELECT id, email, password_hash, role, created_at FROM urx_blog_users WHERE email = :email LIMIT 1',
		{ email }
	);

	if (!row) return null;

	const valid = await bcrypt.compare(password, row.password_hash);
	return valid ? mapUser(row) : null;
}

export async function findUserById(id: number): Promise<BlogUser | null> {
	const row = await queryOne<UserRow>(
		'SELECT id, email, role, created_at FROM urx_blog_users WHERE id = :id LIMIT 1',
		{ id }
	);
	return row ? mapUser(row) : null;
}
