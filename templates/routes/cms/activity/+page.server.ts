import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, listAuditEvents, type AuditAction, type AuditEntityType } from '@urixoft/urx-cms-package';
import type { PageServerLoad } from './$types';

type ActivityFilter = AuditAction | AuditEntityType | 'all';

function parseAuditAction(value: string | null): AuditAction | undefined {
	if (!value) return undefined;
	return AUDIT_ACTIONS.includes(value as AuditAction) ? (value as AuditAction) : undefined;
}

function parseEntityType(value: string | null): AuditEntityType | undefined {
	if (!value) return undefined;
	return AUDIT_ENTITY_TYPES.includes(value as AuditEntityType)
		? (value as AuditEntityType)
		: undefined;
}

export const load: PageServerLoad = async ({ url }) => {
	const action = parseAuditAction(url.searchParams.get('action'));
	const entityType = parseEntityType(url.searchParams.get('type'));
	const filter: ActivityFilter = entityType ?? action ?? 'all';

	return {
		events: await listAuditEvents({ limit: 200, action, entityType }),
		filter
	};
};
