import { writable } from 'svelte/store';

export type CmsAlertType = 'success' | 'error' | 'warning';

export type CmsAlertContent = {
	label: string;
	subtext?: string;
};

export type CmsAlertInput = string | CmsAlertContent;

export type CmsAlert = {
	id: string;
	type: CmsAlertType;
	label: string;
	subtext?: string;
};

export const cmsAlerts = writable<CmsAlert[]>([]);

const DEFAULT_LABELS: Record<CmsAlertType, string> = {
	success: 'Success',
	error: 'Something went wrong',
	warning: 'Please review'
};

function normalize(type: CmsAlertType, input: CmsAlertInput): CmsAlertContent {
	if (typeof input === 'string') {
		return {
			label: DEFAULT_LABELS[type],
			subtext: input
		};
	}

	return {
		label: input.label,
		subtext: input.subtext
	};
}

function push(type: CmsAlertType, input: CmsAlertInput) {
	const id = crypto.randomUUID();
	const content = normalize(type, input);
	cmsAlerts.set([{ id, type, ...content }]);
}

export function dismissCmsAlert(id: string) {
	cmsAlerts.update((alerts) => alerts.filter((alert) => alert.id !== id));
}

export function clearCmsAlerts() {
	cmsAlerts.set([]);
}

export const cmsAlert = {
	success(input: CmsAlertInput) {
		push('success', input);
	},
	error(input: CmsAlertInput) {
		push('error', input);
	},
	warning(input: CmsAlertInput) {
		push('warning', input);
	}
};
