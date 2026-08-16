<script lang="ts">
	import { enhance } from '$app/forms';
	import type { BlogCategory } from '@urixoft/urx-cms-package';
	import { cmsAlert } from '$lib/cms-alert';
	import { cmsPaths } from '$lib/urx-cms';
	import CmsFieldLabel from '$lib/components/ui/CmsFieldLabel.svelte';
	import CmsSpinner from '$lib/components/ui/CmsSpinner.svelte';

	let { data } = $props();

	let categories = $state<BlogCategory[]>([]);
	let editingId = $state<number | null>(null);
	let editName = $state('');
	let creating = $state(false);
	let savingId = $state<number | null>(null);
	let deletingId = $state<number | null>(null);
	let deleteTarget = $state<BlogCategory | null>(null);
	let deleteForm = $state<HTMLFormElement | null>(null);
	let newCategoryName = $state('');

	$effect(() => {
		categories = data.categories;
	});

	function startEdit(category: BlogCategory) {
		editingId = category.id;
		editName = category.name;
	}

	function cancelEdit() {
		editingId = null;
		editName = '';
	}

	function openDeleteModal(category: BlogCategory) {
		deleteTarget = category;
	}

	function closeDeleteModal() {
		if (deletingId) return;
		deleteTarget = null;
	}

	function confirmDelete() {
		deleteForm?.requestSubmit();
	}

	function handleActionResult(
		result: { type: string; data?: { error?: string; label?: string; message?: string } },
		update: () => Promise<void>,
		options: { closeDeleteModalOnFailure?: boolean } = {}
	) {
		return async () => {
			if (result.type === 'failure') {
				cmsAlert.error({
					label: 'Action failed',
					subtext: result.data?.error ?? 'Something went wrong.'
				});
				if (options.closeDeleteModalOnFailure) {
					deleteTarget = null;
				}
				await update();
				return;
			}

			if (result.type === 'success') {
				const label = result.data?.label;
				const message = result.data?.message;
				if (label || message) {
					cmsAlert.success({
						label: label ?? 'Success',
						subtext: message
					});
				}
				editingId = null;
				editName = '';
				newCategoryName = '';
				deleteTarget = null;
			}

			await update();
		};
	}
</script>

<div>
	<h1 class="cms-heading">Categories</h1>
	<p class="cms-muted mt-2">Add, edit, or remove post categories. Each name must be unique.</p>

	<form
		method="POST"
		action="?/create"
		class="cms-category-create mt-8"
		use:enhance={() => {
			creating = true;

			return async ({ result, update }) => {
				creating = false;
				await handleActionResult(result, update)();
			};
		}}
	>
		<div class="cms-category-create__field">
			<CmsFieldLabel for="new-category" required>New category</CmsFieldLabel>
			<input
				id="new-category"
				name="name"
				bind:value={newCategoryName}
				class="cms-input"
				placeholder="e.g. Operations"
				required
			/>
		</div>
		<button type="submit" class="cms-btn-primary" disabled={creating}>
			{#if creating}
				<CmsSpinner />
				Adding...
			{:else}
				Add Category
			{/if}
		</button>
	</form>

	<div class="cms-table-wrap mt-6">
		<table class="cms-table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Slug</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each categories as category (category.id)}
					<tr>
						{#if editingId === category.id}
							<td colspan="2">
								<form
									method="POST"
									action="?/update"
									class="cms-category-edit"
									use:enhance={() => {
										savingId = category.id;

										return async ({ result, update }) => {
											savingId = null;
											await handleActionResult(result, update)();
										};
									}}
								>
									<input type="hidden" name="id" value={category.id} />
									<input
										name="name"
										bind:value={editName}
										class="cms-input"
										required
										aria-label="Category name"
									/>
									<div class="cms-category-edit__actions">
										<button type="submit" class="cms-btn-primary" disabled={savingId === category.id}>
											{#if savingId === category.id}
												<CmsSpinner />
												Saving...
											{:else}
												Save
											{/if}
										</button>
										<button type="button" class="cms-btn-outline" onclick={cancelEdit}>
											Cancel
										</button>
									</div>
								</form>
							</td>
							<td></td>
						{:else}
							<td>{category.name}</td>
							<td class="cms-muted">{category.slug}</td>
							<td>
								<div class="cms-table-actions">
									<button
										type="button"
										class="cms-table-action"
										aria-label="Edit category"
										onclick={() => startEdit(category)}
									>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
											/>
										</svg>
										<span class="cms-table-action__tooltip" role="tooltip">Edit</span>
									</button>
									<button
										type="button"
										class="cms-table-action cms-table-action--danger"
										disabled={deletingId === category.id}
										aria-label="Delete category"
										onclick={() => openDeleteModal(category)}
									>
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
											/>
										</svg>
										<span class="cms-table-action__tooltip" role="tooltip">Delete</span>
									</button>
								</div>
							</td>
						{/if}
					</tr>
				{:else}
					<tr>
						<td colspan="3" class="cms-muted">No categories yet. Add your first one above.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<p class="cms-muted mt-4 text-xs">
		Need a category while writing a post?
		<a href={cmsPaths.newPost} class="cms-link">Go to New Post</a>
	</p>
</div>

<form
	bind:this={deleteForm}
	method="POST"
	action="?/delete"
	class="sr-only"
	aria-hidden="true"
	use:enhance={() => {
		deletingId = deleteTarget?.id ?? null;

		return async ({ result, update }) => {
			deletingId = null;
			await handleActionResult(result, update, { closeDeleteModalOnFailure: true })();
		};
	}}
>
	<input type="hidden" name="id" value={deleteTarget?.id ?? ''} />
</form>

{#if deleteTarget}
	<div class="cms-modal-backdrop" role="presentation" onclick={closeDeleteModal}></div>
	<div
		class="cms-modal"
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-category-title"
	>
		<h2 id="delete-category-title" class="cms-modal__title">Delete category?</h2>
		<p class="cms-modal__message">
			Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be
			undone. Categories used by existing posts cannot be deleted.
		</p>
		<div class="cms-modal__actions">
			<button type="button" class="cms-btn-outline" onclick={closeDeleteModal} disabled={!!deletingId}>
				Cancel
			</button>
			<button type="button" class="cms-btn-danger-solid" onclick={confirmDelete} disabled={!!deletingId}>
				{#if deletingId === deleteTarget.id}
					<CmsSpinner />
					Deleting...
				{:else}
					Delete Category
				{/if}
			</button>
		</div>
	</div>
{/if}
