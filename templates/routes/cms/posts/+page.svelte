<script lang="ts">
	import type { BlogPostWithAuthor } from '@urixoft/urx-cms-package';
	import { cmsAlert } from '$lib/cms-alert';
	import CmsPostsTablePanel from '$lib/components/ui/CmsPostsTablePanel.svelte';
	import CmsPostsTableSkeleton from '$lib/components/ui/CmsPostsTableSkeleton.svelte';
	import CmsSpinner from '$lib/components/ui/CmsSpinner.svelte';
	import { cmsPaths } from '$lib/urx-cms';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let deleting = $state(false);
	let showDeleteModal = $state(false);
	let postToDelete = $state<BlogPostWithAuthor | null>(null);
	let deleteForm = $state<HTMLFormElement | null>(null);

	$effect(() => {
		if (form?.error) {
			cmsAlert.error({
				label: 'Action failed',
				subtext: form.error
			});
		} else if (form?.deleted) {
			showDeleteModal = false;
			postToDelete = null;
			cmsAlert.success({
				label: 'Post deleted',
				subtext: 'The post has been removed.'
			});
		}
	});

	function openDeleteModal(post: BlogPostWithAuthor) {
		postToDelete = post;
		showDeleteModal = true;
	}

	function closeDeleteModal() {
		if (deleting) return;
		showDeleteModal = false;
		postToDelete = null;
	}

	function confirmDelete() {
		if (!postToDelete || !deleteForm) return;
		const idInput = deleteForm.querySelector('input[name="id"]') as HTMLInputElement | null;
		if (idInput) idInput.value = String(postToDelete.id);
		deleteForm.requestSubmit();
	}
</script>

<div>
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="cms-heading">Posts</h1>
			<p class="cms-muted mt-1 text-sm">
				{data.quota.news.label}: {data.quota.news.used}/{data.quota.news.limit}
				<span class="mx-2">·</span>
				{data.quota.service.label}: {data.quota.service.used}/{data.quota.service.limit}
			</p>
		</div>
		{#if data.quota.canCreateAny}
			<a href={cmsPaths.newPost} class="cms-btn-primary">New Post</a>
		{:else}
			<span class="cms-btn-primary cms-btn-primary--disabled" title="Page limit reached for this plan">
				New Post
			</span>
		{/if}
	</div>

	<div class="cms-chip-row mt-6">
		<a href={cmsPaths.posts} class="cms-chip" class:cms-chip--active={data.filter === 'all'}>All</a>
		<a
			href="{cmsPaths.posts}?kind=news"
			class="cms-chip"
			class:cms-chip--active={data.filter === 'news'}
		>
			{data.quota.news.label}
		</a>
		<a
			href="{cmsPaths.posts}?kind=service"
			class="cms-chip"
			class:cms-chip--active={data.filter === 'service'}
		>
			{data.quota.service.label}
		</a>
	</div>

	{#await data.posts}
		<div aria-busy="true" aria-live="polite">
			<div class="cms-table-toolbar mt-4">
				<div class="cms-skeleton cms-skeleton--search" aria-hidden="true"></div>
			</div>
			<CmsPostsTableSkeleton />
		</div>
	{:then posts}
		<CmsPostsTablePanel
			{posts}
			quota={data.quota}
			{deleting}
			{postToDelete}
			onDelete={openDeleteModal}
		/>
	{:catch}
		<p class="cms-table-empty mt-4">Could not load posts. Please refresh the page.</p>
	{/await}
</div>

<form
	bind:this={deleteForm}
	method="POST"
	action="?/delete"
	class="sr-only"
	aria-hidden="true"
	use:enhance={() => {
		deleting = true;

		return async ({ result, update }) => {
			deleting = false;

			if (result.type === 'failure') {
				showDeleteModal = false;
				cmsAlert.error({
					label: 'Could not delete post',
					subtext: (result.data as { error?: string } | undefined)?.error ?? 'Something went wrong.'
				});
			}

			await update();
		};
	}}
>
	<input type="hidden" name="id" value="" />
</form>

{#if showDeleteModal && postToDelete}
	<div class="cms-modal-backdrop" role="presentation" onclick={closeDeleteModal}></div>
	<div class="cms-modal" role="dialog" aria-modal="true" aria-labelledby="delete-post-title">
		<h2 id="delete-post-title" class="cms-modal__title">Delete post?</h2>
		<p class="cms-modal__message">
			Are you sure you want to delete <strong>{postToDelete.title}</strong>? This action cannot be undone.
		</p>
		<div class="cms-modal__actions">
			<button type="button" class="cms-btn-outline" onclick={closeDeleteModal} disabled={deleting}>
				Cancel
			</button>
			<button type="button" class="cms-btn-danger-solid" onclick={confirmDelete} disabled={deleting}>
				{#if deleting}
					<CmsSpinner />
					Deleting...
				{:else}
					Delete Post
				{/if}
			</button>
		</div>
	</div>
{/if}
