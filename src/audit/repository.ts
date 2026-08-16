import { execute, query } from '../db/connection.js';
import type {
	AuditAction,
	AuditEntityType,
	AuditLogEntry,
	AuditActor,
	ListAuditEventsOptions
} from '../types.js';

const DEFAULT_LIST_LIMIT = 100;
const MAX_LIST_LIMIT = 500;
const DEFAULT_RETENTION_DAYS = 90;

type AuditRow = {
	id: number;
	user_id: number | null;
	user_email: string | null;
	action: string;
	entity_type: string | null;
	entity_id: number | null;
	summary: string;
	metadata: string | null;
	created_at: string;
};

export type RecordAuditEventInput = {
	userId?: number | null;
	userEmail?: string | null;
	action: AuditAction;
	entityType?: AuditEntityType | null;
	entityId?: number | null;
	summary: string;
	metadata?: Record<string, unknown>;
};

export function toAuditActor(user: { id: number; email: string }): AuditActor {
	return { id: user.id, email: user.email };
}

export { formatAuditAction } from './labels.js';

function mapAuditRow(row: AuditRow): AuditLogEntry {
	let metadata: Record<string, unknown> | null = null;
	if (row.metadata) {
		try {
			metadata = JSON.parse(row.metadata) as Record<string, unknown>;
		} catch {
			metadata = null;
		}
	}

	return {
		id: row.id,
		userId: row.user_id,
		userEmail: row.user_email,
		action: row.action as AuditAction,
		entityType: (row.entity_type as AuditEntityType | null) ?? null,
		entityId: row.entity_id,
		summary: row.summary,
		metadata,
		createdAt: new Date(row.created_at)
	};
}

export async function recordAuditEvent(input: RecordAuditEventInput): Promise<void> {
	await execute(
		`INSERT INTO urx_blog_audit_log
		 (user_id, user_email, action, entity_type, entity_id, summary, metadata)
		 VALUES (:userId, :userEmail, :action, :entityType, :entityId, :summary, :metadata)`,
		{
			userId: input.userId ?? null,
			userEmail: input.userEmail ?? null,
			action: input.action,
			entityType: input.entityType ?? null,
			entityId: input.entityId ?? null,
			summary: input.summary,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null
		}
	);
}

export async function listAuditEvents(
	options: ListAuditEventsOptions = {}
): Promise<AuditLogEntry[]> {
	const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIST_LIMIT, 1), MAX_LIST_LIMIT);
	const offset = Math.max(options.offset ?? 0, 0);
	const filters: string[] = [];
	const params: Record<string, string | number | null> = { limit, offset };

	if (options.action) {
		filters.push('action = :action');
		params.action = options.action;
	}

	if (options.entityType) {
		filters.push('entity_type = :entityType');
		params.entityType = options.entityType;
	}

	const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

	const rows = await query<AuditRow>(
		`SELECT id, user_id, user_email, action, entity_type, entity_id, summary, metadata, created_at
		 FROM urx_blog_audit_log
		 ${whereClause}
		 ORDER BY created_at DESC, id DESC
		 LIMIT :limit OFFSET :offset`,
		params
	);

	return rows.map(mapAuditRow);
}

export async function pruneAuditLog(retentionDays = DEFAULT_RETENTION_DAYS): Promise<void> {
	await execute(
		`DELETE FROM urx_blog_audit_log
		 WHERE created_at < datetime('now', '-' || :days || ' days')`,
		{ days: retentionDays }
	);
}
