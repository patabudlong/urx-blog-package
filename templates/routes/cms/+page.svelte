<script lang="ts">
	import { cmsPaths } from '$lib/urx-cms';

	let { data } = $props();

	const newsQuota = $derived(data.quota.news);
	const serviceQuota = $derived(data.quota.service);
</script>

<div>
	<div class="flex items-start justify-between gap-4">
		<div>
			<h1 class="cms-heading">Dashboard</h1>
			<p class="cms-muted mt-2">
				{#if data.servicesInstalled}
					Manage your news/blog and service pages from here.
				{:else}
					Manage your {newsQuota.label.toLowerCase()} pages from here.
				{/if}
			</p>
		</div>
		{#if data.quota.canCreateAny}
			<a href={cmsPaths.newPost} class="cms-btn-primary shrink-0">Create New Post</a>
		{:else}
			<span class="cms-btn-primary shrink-0 cms-btn-primary--disabled" title="Page limit reached for this plan">
				Create New Post
			</span>
		{/if}
	</div>

	<div
		class="mt-8 grid gap-4 {data.servicesInstalled
			? 'sm:grid-cols-2'
			: 'max-w-md sm:grid-cols-1'}"
	>
		<div class="cms-card p-6">
			<p class="cms-stat-label">{newsQuota.label} pages</p>
			<p class="cms-stat-value">{newsQuota.used} <span class="cms-stat-limit">/ {newsQuota.limit}</span></p>
			<p class="cms-muted mt-2 text-sm">
				{#if newsQuota.atLimit}
					Plan limit reached
				{:else}
					{newsQuota.remaining} remaining on this plan
				{/if}
			</p>
		</div>
		{#if data.servicesInstalled}
			<div class="cms-card p-6">
				<p class="cms-stat-label">{serviceQuota.label} pages</p>
				<p class="cms-stat-value">{serviceQuota.used} <span class="cms-stat-limit">/ {serviceQuota.limit}</span></p>
				<p class="cms-muted mt-2 text-sm">
					{#if serviceQuota.atLimit}
						Plan limit reached
					{:else}
						{serviceQuota.remaining} remaining on this plan
					{/if}
				</p>
			</div>
		{/if}
	</div>

	<div class="mt-4 grid gap-4 sm:grid-cols-3">
		<div class="cms-card p-6">
			<p class="cms-stat-label">Total Posts</p>
			<p class="cms-stat-value">{data.posts.length}</p>
		</div>
		<div class="cms-card p-6">
			<p class="cms-stat-label">Published</p>
			<p class="cms-stat-value cms-stat-value--success">
				{data.publishedCount}
			</p>
		</div>
		<div class="cms-card p-6">
			<p class="cms-stat-label">Drafts</p>
			<p class="cms-stat-value cms-stat-value--draft">
				{data.draftCount}
			</p>
		</div>
	</div>
</div>
