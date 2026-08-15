<script lang="ts">
	import type { CmsTheme } from '$lib/cms-theme';

	type Props = {
		theme: CmsTheme;
		onchange: (theme: CmsTheme) => void;
	};

	let { theme, onchange }: Props = $props();

	const label = $derived(theme === 'dark' ? 'Light mode' : 'Dark mode');
	const icon = $derived(theme === 'dark' ? '☀' : '☾');
</script>

<button
	type="button"
	class="cms-theme-toggle"
	aria-label={label}
	title={label}
	onclick={() => onchange(theme === 'dark' ? 'light' : 'dark')}
>
	<span aria-hidden="true">{icon}</span>
	<span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
</button>
