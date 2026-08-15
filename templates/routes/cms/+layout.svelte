<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import '$lib/cms-theme.css';
	import { cmsNavItems, cmsPaths } from '$lib/urx-cms';
	import { readCmsTheme, writeCmsTheme, type CmsTheme } from '$lib/cms-theme';
	import CmsThemeToggle from '$lib/components/ui/CmsThemeToggle.svelte';

	let { children, data } = $props();

	let theme = $state<CmsTheme>('dark');
	const currentPath = $derived(page.url.pathname);

	onMount(() => {
		theme = readCmsTheme();
	});

	function setTheme(next: CmsTheme) {
		theme = next;
		writeCmsTheme(next);
	}
</script>

<div class="cms-shell" data-cms-theme={theme}>
	{#if data.user}
		<header class="cms-header">
			<div class="cms-container">
				<div class="cms-header-row">
					<a href={cmsPaths.root} class="cms-brand">Urixoft CMS</a>
					<div class="cms-header-actions">
						<CmsThemeToggle {theme} onchange={setTheme} />
						<span class="cms-muted">{data.user.email}</span>
						<form method="POST" action={cmsPaths.logout}>
							<button type="submit" class="cms-btn-ghost">Logout</button>
						</form>
					</div>
				</div>

				<nav class="cms-nav cms-nav-row" aria-label="CMS">
					{#each cmsNavItems as item (item.href)}
						{@const active = item.match(currentPath)}
						<a
							href={item.href}
							class="cms-nav-link {active ? 'cms-nav-link--active' : ''}"
							aria-current={active ? 'page' : undefined}
						>
							{item.label}
						</a>
					{/each}
				</nav>
			</div>
		</header>
	{:else}
		<div class="cms-container cms-login-toolbar">
			<CmsThemeToggle {theme} onchange={setTheme} />
		</div>
	{/if}

	<main class="cms-main cms-container">
		{@render children()}
	</main>
</div>
