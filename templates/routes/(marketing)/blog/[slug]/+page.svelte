<script lang="ts">
	import Container from '$lib/components/layout/Container.svelte';
	import BlogFeaturedImage from '$lib/components/ui/BlogFeaturedImage.svelte';
	import BlogShareBar from '$lib/components/ui/BlogShareBar.svelte';
	import { rewriteManagedBlogImagesInHtml } from '$lib/urx-cms';

	let { data } = $props();
	const post = $derived(data.post);
	const articleHtml = $derived(rewriteManagedBlogImagesInHtml(post.content ?? ''));
	const ogImage = $derived(data.seo.image);
	const ogImageIsSecure = $derived(ogImage?.startsWith('https://'));
</script>

<svelte:head>
	<title>{data.seo.title}</title>
	<meta name="description" content={data.seo.description} />
	<link rel="canonical" href={data.seo.canonicalUrl} />
	<meta property="og:type" content={data.seo.type} />
	<meta property="og:title" content={data.seo.title} />
	<meta property="og:description" content={data.seo.description} />
	<meta property="og:url" content={data.seo.canonicalUrl} />
	{#if data.seo.siteName}
		<meta property="og:site_name" content={data.seo.siteName} />
	{/if}
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
		{#if ogImageIsSecure}
			<meta property="og:image:secure_url" content={ogImage} />
		{/if}
		<meta property="og:image:alt" content={data.seo.imageAlt ?? data.seo.title} />
	{/if}
	{#if data.seo.publishedTime}
		<meta property="article:published_time" content={data.seo.publishedTime} />
	{/if}
	{#if data.seo.modifiedTime}
		<meta property="article:modified_time" content={data.seo.modifiedTime} />
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.seo.title} />
	<meta name="twitter:description" content={data.seo.description} />
	{#if ogImage}
		<meta name="twitter:image" content={ogImage} />
	{/if}
</svelte:head>

<article class="bg-surface-muted py-20">
	<Container>
		<div class="mx-auto max-w-3xl">
			<div class="mb-6 flex items-center gap-3 text-sm font-medium text-brand">
				<span>{post.category}</span>
				{#if post.publishedAt}
					<span class="text-foreground-muted">·</span>
					<time class="text-foreground-muted" datetime={post.publishedAt.toISOString()}>
						{new Intl.DateTimeFormat('en-US', {
							month: 'long',
							day: 'numeric',
							year: 'numeric'
						}).format(post.publishedAt)}
					</time>
				{/if}
			</div>

			<h1 class="text-3xl font-bold sm:text-4xl">{post.title}</h1>

			<BlogShareBar share={data.share} class="mt-6" />

			<BlogFeaturedImage
				src={post.featuredImage}
				alt={post.title}
				class="mt-8 w-full rounded-2xl"
			/>

			<div class="blog-article mt-8">
				{@html articleHtml}
			</div>

			<BlogShareBar share={data.share} heading="Share with your network" class="mt-10" />

			<a
				href={data.blogBasePath}
				class="mt-10 inline-block text-sm font-medium text-brand hover:underline"
			>
				← Back to {data.blogNavLabel}
			</a>
		</div>
	</Container>
</article>
