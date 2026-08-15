<script lang="ts">
	import { enhance } from '$app/forms';
	import type { BlogCategory } from '@urixoft/urx-cms-package';
	import { cmsAlert } from '$lib/cms-alert';
	import CmsCategoryField from '$lib/components/ui/CmsCategoryField.svelte';
	import CmsFeaturedImageField from '$lib/components/ui/CmsFeaturedImageField.svelte';
	import CmsFieldLabel from '$lib/components/ui/CmsFieldLabel.svelte';
	import CmsRichTextEditor from '$lib/components/ui/CmsRichTextEditor.svelte';
	import CmsSpinner from '$lib/components/ui/CmsSpinner.svelte';

	let { data, form } = $props();

	const post = $derived(data.post);
	let categories = $state<BlogCategory[]>([]);
	let category = $state('');
	let saving = $state(false);
	let showDeleteModal = $state(false);
	let deleting = $state(false);
	let deleteForm = $state<HTMLFormElement | null>(null);

	$effect(() => {
		categories = data.categories;
		category = post.category;
	});

	$effect(() => {
		if (form?.error) {
			cmsAlert.error({
				label: 'Could not save post',
				subtext: form.error
			});
		} else if (form?.success) {
			cmsAlert.success({
				label: 'Post saved',
				subtext: 'Your changes have been saved successfully.'
			});
		}
	});

	function openDeleteModal() {
		showDeleteModal = true;
	}

	function closeDeleteModal() {
		if (deleting) return;
		showDeleteModal = false;
	}

	function confirmDelete() {
		deleteForm?.requestSubmit();
	}
</script>

<div>
	<div class="flex items-start justify-between gap-4">
		<h1 class="cms-heading">Edit Post</h1>
		<button type="button" class="cms-btn-danger shrink-0" onclick={openDeleteModal}>
			Delete Post
		</button>
	</div>

	<form
		method="POST"
		action="?/update"
		enctype="multipart/form-data"
		class="mt-6 space-y-4"
		use:enhance={() => {
			saving = true;

			return async ({ result, update }) => {
				saving = false;
				await update();
			};
		}}
	>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<CmsFieldLabel for="title" required>Title</CmsFieldLabel>
				<input id="title" name="title" required value={post.title} class="cms-input" />
			</div>
			<div>
				<CmsFieldLabel
					for="slug"
					tooltip="If left blank, the slug is generated automatically from the title."
				>
					Slug
				</CmsFieldLabel>
				<input id="slug" name="slug" value={post.slug} class="cms-input" />
			</div>
			<CmsCategoryField bind:categories bind:value={category} />
			<CmsFeaturedImageField
				storageConfigured={data.storageConfigured}
				initialImageUrl={post.featuredImage}
			/>
			<div class="sm:col-span-2">
				<CmsFieldLabel for="excerpt">Excerpt</CmsFieldLabel>
				<textarea id="excerpt" name="excerpt" rows="2" class="cms-textarea">{post.excerpt ?? ''}</textarea>
			</div>
			<CmsRichTextEditor value={post.content} required />
			<div>
				<CmsFieldLabel for="status" required>Status</CmsFieldLabel>
				<select id="status" name="status" class="cms-select">
					<option value="draft" selected={post.status === 'draft'}>Draft</option>
					<option value="published" selected={post.status === 'published'}>Published</option>
				</select>
			</div>
		</div>

		<div class="flex gap-3">
			<button type="submit" class="cms-btn-primary" disabled={saving}>
				{#if saving}
					<CmsSpinner />
					Saving...
				{:else}
					Save Changes
				{/if}
			</button>
			{#if post.status === 'published'}
				<a href="{data.blogBasePath}/{post.slug}" class="cms-btn-outline">View Live</a>
			{/if}
		</div>
	</form>
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
></form>

{#if showDeleteModal}
	<div class="cms-modal-backdrop" role="presentation" onclick={closeDeleteModal}></div>
	<div class="cms-modal" role="dialog" aria-modal="true" aria-labelledby="delete-post-title">
		<h2 id="delete-post-title" class="cms-modal__title">Delete post?</h2>
		<p class="cms-modal__message">
			Are you sure you want to delete <strong>{post.title}</strong>? This action cannot be undone.
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
