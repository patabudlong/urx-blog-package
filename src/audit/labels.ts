import type { AuditAction } from '../types.js';

const ACTION_LABELS: Record<AuditAction, string> = {
	'post.created': 'Post created',
	'post.updated': 'Post updated',
	'post.deleted': 'Post deleted',
	'post.duplicated': 'Post duplicated',
	'category.created': 'Category created',
	'category.updated': 'Category updated',
	'category.deleted': 'Category deleted',
	'auth.login': 'Signed in',
	'auth.login_failed': 'Sign-in failed',
	'auth.logout': 'Signed out'
};

export function formatAuditAction(action: AuditAction | string): string {
	return ACTION_LABELS[action as AuditAction] ?? action;
}
