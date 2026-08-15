import { browser } from '$app/environment';
import { urxCmsConfig } from './urx-cms';

export type CmsTheme = 'dark' | 'light';

export const CMS_THEME_STORAGE_KEY = 'urixoft-cms-theme';

export function resolveCmsTheme(stored?: string | null): CmsTheme {
	if (stored === 'light' || stored === 'dark') return stored;
	return urxCmsConfig.defaultTheme;
}

export function readCmsTheme(): CmsTheme {
	if (!browser) return urxCmsConfig.defaultTheme;
	return resolveCmsTheme(localStorage.getItem(CMS_THEME_STORAGE_KEY));
}

export function writeCmsTheme(theme: CmsTheme): void {
	if (!browser) return;
	localStorage.setItem(CMS_THEME_STORAGE_KEY, theme);
}

export function toggleCmsTheme(theme: CmsTheme): CmsTheme {
	return theme === 'dark' ? 'light' : 'dark';
}
