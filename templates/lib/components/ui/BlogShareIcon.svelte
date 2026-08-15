<script lang="ts">
	import type { BlogSharePlatform } from '@urixoft/urx-cms-package';

	type Props = {
		platform: BlogSharePlatform;
		class?: string;
	};

	let { platform, class: className = '' }: Props = $props();

	const iconClass = `blog-share-icon ${className}`.trim();
</script>

{#if platform === 'copy'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class={iconClass}
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
		<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
	</svg>
{:else if platform === 'email'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class={iconClass}
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<rect width="20" height="16" x="2" y="4" rx="2" />
		<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
	</svg>
{:else if platform === 'facebook'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class={iconClass}
		width="16"
		height="16"
		viewBox="0 0 24 24"
		aria-hidden="true"
	>
		<path
			fill="currentColor"
			d="M9.101 23.691v-7.98H6.127v-3.667h2.974v-1.58c0-4.085 1.848-5.978 5.791-5.978 1.313 0 2.086.097 2.963.21v2.71h-1.67c-1.626 0-2.043.771-2.043 1.956v1.32h3.983l-.44 3.667h-3.418v7.98H9.101z"
		/>
	</svg>
{:else if platform === 'linkedin'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class={iconClass}
		width="16"
		height="16"
		viewBox="0 0 24 24"
		aria-hidden="true"
	>
		<path
			fill="currentColor"
			d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a-2.065 2.065 0 1 1 0-4.13 2.065 2.065 0 0 1 0 4.13zM7.119 20.452H3.555V9h3.564v11.452z"
		/>
	</svg>
{:else if platform === 'twitter'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class={iconClass}
		width="16"
		height="16"
		viewBox="0 0 24 24"
		aria-hidden="true"
	>
		<path
			fill="currentColor"
			d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83-5.034-5.652h7.59l5.054 6.686 6.766-6.686zm-1.161 17.52h2.033L7.084 4.126H5.117z"
		/>
	</svg>
{:else if platform === 'whatsapp'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class={iconClass}
		width="16"
		height="16"
		viewBox="0 0 24 24"
		aria-hidden="true"
	>
		<path
			fill="currentColor"
			d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.511-5.16c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"
		/>
	</svg>
{/if}

<style>
	:global(.blog-share-icon) {
		display: block;
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}
</style>
