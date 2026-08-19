export function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 200);
}

export function toDatetimeLocalValue(date: Date | string | null | undefined): string {
	if (!date) return '';
	const value = date instanceof Date ? date : new Date(date);
	if (Number.isNaN(value.getTime())) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}
