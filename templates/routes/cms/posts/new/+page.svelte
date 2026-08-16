<script lang="ts">
	import { enhance } from '$app/forms';
	import type { BlogCategory, CmsPostKind } from '@urixoft/urx-cms-package';
	import { cmsAlert } from '$lib/cms-alert';
	import { cmsPaths } from '$lib/urx-cms';
	import CmsCategoryField from '$lib/components/ui/CmsCategoryField.svelte';
	import CmsFeaturedImageField from '$lib/components/ui/CmsFeaturedImageField.svelte';
	import CmsFieldLabel from '$lib/components/ui/CmsFieldLabel.svelte';
	import CmsRichTextEditor from '$lib/components/ui/CmsRichTextEditor.svelte';
	import CmsSpinner from '$lib/components/ui/CmsSpinner.svelte';

	let { data } = $props();

	let categories = $state<BlogCategory[]>([]);
	let submitting = $state(false);
	let formElement = $state<HTMLFormElement | null>(null);
	let kind = $state<CmsPostKind>('news');

	const selectedQuota = $derived(data.quota[kind]);
	const canCreateSelected = $derived(!selectedQuota.atLimit);

	$effect(() => {
		categories = data.categories;
		if (data.quota.news.atLimit && !data.quota.service.atLimit && kind === 'news') {
			kind = 'service';
		}
	});
</script>

<div>
	<h1 class="cms-heading">New Post</h1>
	<p class="cms-muted mt-1 text-sm">
		{data.quota.news.label}: {data.quota.news.used}/{data.quota.news.limit}
		<span class="mx-2">·</span>
		{data.quota.service.label}: {data.quota.service.used}/{data.quota.service.limit}
	</p>

	{#if !data.quota.canCreateAny}
		<p class="cms-error mt-4">
			Your plan page limits have been reached. Delete an existing page to add another.
		</p>
	{:else if selectedQuota.atLimit}
		<p class="cms-error mt-4">
			Your plan allows up to {selectedQuota.limit} {selectedQuota.label} pages. Choose another type
			or delete an existing page.
		</p>
	{/if}

	<form
		bind:this={formElement}
		method="POST"
		enctype="multipart/form-data"
		class="mt-6 space-y-4"
		use:enhance={() => {
			const slugValue =
				(formElement?.querySelector('#slug') as HTMLInputElement | null)?.value.trim() ?? '';
			if (!slugValue) {
				cmsAlert.warning({
					label: 'Slug auto-generated',
					subtext: 'The slug was left blank and will be created from the title.'
				});
			}

			submitting = true;

			return async ({ result, update }) => {
				if (result.type === 'failure') {
					submitting = false;
					const message =
						(result.data as { error?: string } | undefined)?.error ??
						'Could not create post.';
					cmsAlert.error({
						label: 'Could not create post',
						subtext: message
					});
					await update();
					return;
				}

				if (result.type === 'redirect') {
					cmsAlert.success({
						label: 'Post created',
						subtext: 'Your post has been saved successfully.'
					});
				}

				await update();
			};
		}}
	>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<CmsFieldLabel for="title" required>Title</CmsFieldLabel>
				<input id="title" name="title" required class="cms-input" />
			</div>
			<div>
				<CmsFieldLabel
					for="kind"
					required
					tooltip="News/blog and service pages have separate limits based on your plan."
				>
					Type
				</CmsFieldLabel>
				<select id="kind" name="kind" required class="cms-select" bind:value={kind}>
					<option value="news" disabled={data.quota.news.limit === 0}>
						{data.quota.news.label}
						{#if data.quota.news.atLimit}(limit reached){/if}
					</option>
					<option value="service" disabled={data.quota.service.limit === 0}>
						{data.quota.service.label}
						{#if data.quota.service.atLimit}(limit reached){/if}
					</option>
				</select>
			</div>
			<div>
				<CmsFieldLabel
					for="slug"
					tooltip="If left blank, the slug is generated automatically from the title."
				>
					Slug
				</CmsFieldLabel>
				<input id="slug" name="slug" class="cms-input" placeholder="auto-generated-from-title" />
			</div>
			<CmsCategoryField bind:categories />
			<CmsFeaturedImageField storageConfigured={data.storageConfigured} />
			<div class="sm:col-span-2">
				<CmsFieldLabel for="excerpt">Excerpt</CmsFieldLabel>
				<textarea id="excerpt" name="excerpt" rows="2" class="cms-textarea"></textarea>
			</div>
			<CmsRichTextEditor required />
			<div>
				<CmsFieldLabel for="status" required>Status</CmsFieldLabel>
				<select id="status" name="status" required class="cms-select">
					<option value="draft">Draft</option>
					<option value="published">Published</option>
				</select>
			</div>
		</div>

		<div class="flex gap-3">
			<button type="submit" class="cms-btn-primary" disabled={submitting || !canCreateSelected}>
				{#if submitting}
					<CmsSpinner />
					Creating...
				{:else}
					Create Post
				{/if}
			</button>
			<a href={cmsPaths.posts} class="cms-btn-outline">Cancel</a>
		</div>
	</form>
</div>
