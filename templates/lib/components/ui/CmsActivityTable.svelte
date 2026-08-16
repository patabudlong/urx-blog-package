<script lang="ts">
	import type { AuditAction, AuditEntityType, AuditLogEntry } from '@urixoft/urx-cms-package';
	import { formatAuditAction } from '@urixoft/urx-cms-package/audit';
	import { cmsPaths } from '$lib/urx-cms';

	type ActivityFilter = AuditAction | AuditEntityType | 'all';

	let {
		events,
		filter = 'all'
	}: {
		events: AuditLogEntry[];
		filter?: ActivityFilter;
	} = $props();

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	function actionBadgeClass(action: AuditAction): string {
		if (action === 'auth.login_failed') return 'cms-badge cms-badge--danger';
		if (action.startsWith('auth.')) return 'cms-badge cms-badge--draft';
		if (action.startsWith('post.')) return 'cms-badge cms-badge--published';
		return 'cms-badge';
	}

	function filterHref(next: ActivityFilter): string {
		if (next === 'all') return cmsPaths.activity;
		if (next === 'post' || next === 'category' || next === 'auth') {
			return `${cmsPaths.activity}?type=${next}`;
		}
		return `${cmsPaths.activity}?action=${next}`;
	}
</script>

<div class="cms-activity-filters">
	<a href={filterHref('all')} class="cms-chip" class:cms-chip--active={filter === 'all'}>All</a>
	<a href={filterHref('post')} class="cms-chip" class:cms-chip--active={filter === 'post'}>Posts</a>
	<a href={filterHref('category')} class="cms-chip" class:cms-chip--active={filter === 'category'}>
		Categories
	</a>
	<a href={filterHref('auth')} class="cms-chip" class:cms-chip--active={filter === 'auth'}>Auth</a>
</div>

<div class="cms-table-wrap mt-4">
	<table class="cms-table cms-activity-table">
		<thead>
			<tr>
				<th>When</th>
				<th>User</th>
				<th>Action</th>
				<th>Details</th>
			</tr>
		</thead>
		<tbody>
			{#each events as event (event.id)}
				<tr>
					<td class="cms-muted cms-activity-table__when">
						{dateFormatter.format(event.createdAt)}
					</td>
					<td class="cms-muted">{event.userEmail ?? '—'}</td>
					<td>
						<span class={actionBadgeClass(event.action)}>{formatAuditAction(event.action)}</span>
					</td>
					<td>{event.summary}</td>
				</tr>
			{:else}
				<tr>
					<td colspan="4" class="cms-muted">No activity recorded yet.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
