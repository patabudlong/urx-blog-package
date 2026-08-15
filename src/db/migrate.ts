import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { execute, getDb, queryOne } from './connection.js';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../types.js';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

async function readSqlFile(filename: string): Promise<string> {
	return readFile(join(packageRoot, 'sql', filename), 'utf8');
}

function runStatements(sql: string): void {
	const database = getDb();
	const statements = sql
		.split(';')
		.map((statement) => statement.trim())
		.filter(Boolean);

	for (const statement of statements) {
		database.exec(statement);
	}
}

function daysAgoIso(days: number): string {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date.toISOString();
}

async function createDefaultAdmin(): Promise<number> {
	const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
	return execute(
		`INSERT INTO urx_blog_users (email, password_hash, role)
		 VALUES (:email, :passwordHash, 'admin')`,
		{ email: DEFAULT_ADMIN_EMAIL, passwordHash }
	);
}

async function syncDefaultAdminPassword(): Promise<void> {
	const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
	await execute(
		`UPDATE urx_blog_users SET password_hash = :passwordHash WHERE email = :email`,
		{ email: DEFAULT_ADMIN_EMAIL, passwordHash }
	);
}

export async function migrate(): Promise<void> {
	const schema = await readSqlFile('schema.sql');
	runStatements(schema);
}

export async function seed(): Promise<void> {
	const existingAdmin = await queryOne<{ id: number }>(
		'SELECT id FROM urx_blog_users WHERE email = :email LIMIT 1',
		{ email: DEFAULT_ADMIN_EMAIL }
	);

	if (!existingAdmin) {
		const adminId = await createDefaultAdmin();
		await seedSamplePosts(adminId);
		return;
	}

	await syncDefaultAdminPassword();

	const postCount = await queryOne<{ count: number }>(
		'SELECT COUNT(*) as count FROM urx_blog_posts'
	);

	if (Number(postCount?.count ?? 0) === 0) {
		await seedSamplePosts(existingAdmin.id);
	}
}

async function seedSamplePosts(adminId: number): Promise<void> {
	const samplePosts = [
		{
			slug: 'digitize-port-operations-2026',
			title: '5 Ways Ports Can Digitize Daily Operations in 2026',
			excerpt:
				'Practical steps terminal teams can take this year to replace manual workflows with connected cloud tools.',
			content:
				'<p>Ports worldwide are under pressure to move faster while keeping safety and compliance intact. Digitizing daily operations starts with mapping your highest-friction workflows—gate queues, berth planning, billing handoffs—and replacing paper with systems your teams already carry in their pockets.</p><p>Start with one lane: gate check-in, vessel scheduling, or billing documentation. Pilot with a single shift, measure turnaround time, then expand. The best digitization programs win because operators adopt them, not because IT deploys them.</p>',
			category: 'Operations',
			featuredImage:
				'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
			daysAgo: 0
		},
		{
			slug: 'real-time-visibility-terminal-teams',
			title: 'Why Real-Time Visibility Matters For Terminal Teams',
			excerpt:
				'When yard, gate, and vessel data live in one place, supervisors spend less time chasing updates and more time moving cargo.',
			content:
				'<p>Terminal supervisors often juggle radios, spreadsheets, and legacy TOS screens just to answer one question: where is the container right now? Real-time visibility connects gate events, yard positions, and vessel milestones so teams act on facts instead of guesses.</p><p>Unified dashboards reduce idle equipment, improve customer communication, and surface bottlenecks before they become demurrage. Visibility is not a nice-to-have—it is the foundation for every other optimization.</p>',
			category: 'Technology',
			featuredImage:
				'https://images.unsplash.com/photo-1578575437130-527eed3abbcd?w=800&q=80',
			daysAgo: 5
		},
		{
			slug: 'paperwork-to-cloud-platform',
			title: 'From Paperwork To Cloud Platform: Modernizing Port Workflows',
			excerpt:
				'How mid-size ports are retiring binders and email chains in favor of auditable, cloud-native operations platforms.',
			content:
				'<p>Paper manifests and email approvals do not scale when volumes climb. Cloud platforms give ports a single source of truth for documentation, billing, and compliance—with audit trails built in.</p><p>Migration does not require a big-bang cutover. Phase documents by department, integrate with existing TOS where needed, and train champions on each shift. Within weeks, teams wonder how they ever ran on paper alone.</p>',
			category: 'Industry',
			featuredImage:
				'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1da?w=800&q=80',
			daysAgo: 10
		}
	];

	for (const post of samplePosts) {
		await execute(
			`INSERT INTO urx_blog_posts
			 (slug, title, excerpt, content, category, featured_image, status, published_at, author_id)
			 VALUES (:slug, :title, :excerpt, :content, :category, :featuredImage, 'published', :publishedAt, :authorId)`,
			{
				slug: post.slug,
				title: post.title,
				excerpt: post.excerpt,
				content: post.content,
				category: post.category,
				featuredImage: post.featuredImage,
				publishedAt: daysAgoIso(post.daysAgo),
				authorId: adminId
			}
		);
	}
}

export async function setupDatabase(): Promise<void> {
	await migrate();
	await seed();
}
