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
							<td class="cms-category-actions">
								<button type="button" class="cms-link" onclick={() => startEdit(category)}>
									Edit
								</button>
								<button
									type="button"
									class="cms-btn-danger"
									disabled={deletingId === category.id}
									onclick={() => openDeleteModal(category)}
								>
									Delete
								</button>
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
