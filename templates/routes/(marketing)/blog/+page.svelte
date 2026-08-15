<script lang="ts">
	import Container from '$lib/components/layout/Container.svelte';
	import BlogFeaturedImage from '$lib/components/ui/BlogFeaturedImage.svelte';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';

	let { data } = $props();
	const pageTitle = $derived(
		data.blogNavLabel === 'News' ? 'News & Insights' : 'Blog & Insights'
	);
</script>

<svelte:head>
	<title>{data.seo.title}</title>
	<meta name="description" content={data.seo.description} />
</svelte:head>

<section class="bg-surface-muted py-20">
	<Container>
		<div class="mb-12">
			<p class="mb-3 text-sm font-semibold tracking-wide text-brand uppercase">{data.blogNavLabel}</p>
			<h1 class="text-3xl font-bold sm:text-4xl">{pageTitle}</h1>
			<p class="mt-4 max-w-2xl text-foreground-muted">
				News, best practices, and updates on port digitization and terminal operations.
			</p>
		</div>

		{#if data.posts.length === 0}
			<p class="text-foreground-muted">No posts yet. Sign in to the admin panel to publish your first article.</p>
		{:else}
			<div class="grid gap-6 lg:grid-cols-3">
				{#each data.posts as post (post.href)}
					<article class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
						<BlogFeaturedImage src={post.image} alt={post.title} class="h-48 w-full" />
						<div class="p-6">
							<div class="flex items-center gap-3 text-xs font-medium text-brand">
								<span>{post.category}</span>
								<span class="text-foreground-muted">·</span>
								<span class="text-foreground-muted">{post.date}</span>
							</div>
							<h2 class="mt-3 text-lg font-semibold">{post.title}</h2>
							{#if post.excerpt}
								<p class="mt-2 text-sm text-foreground-muted">{post.excerpt}</p>
							{/if}
							<a
								href={resolve(post.href as Pathname)}
								class="mt-4 inline-block text-sm font-medium text-brand hover:underline"
							>
								Read More →
							</a>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</Container>
</section>
