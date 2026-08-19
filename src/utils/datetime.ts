export function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 200);
}

export function parsePublishedAtFormValue(value: FormDataEntryValue | null): string | null {
	const raw = String(value ?? '').trim();
	if (!raw) return null;
	const date = new Date(raw);
	if (Number.isNaN(date.getTime())) {
		throw new Error('Published date is invalid.');
	}
	return date.toISOString();
}

export function toDatetimeLocalValue(date: Date | null | undefined): string {
	if (!date || Number.isNaN(date.getTime())) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
