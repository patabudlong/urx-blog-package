<script lang="ts">
	import type { BlogCategory } from '@urixoft/urx-cms-package';
	import { cmsPaths } from '$lib/urx-cms';
	import CmsFieldLabel from './CmsFieldLabel.svelte';

	type Props = {
		categories: BlogCategory[];
		value?: string;
	};

	let { categories = $bindable(), value = $bindable('') }: Props = $props();

	$effect(() => {
		if (!value && categories.length > 0) {
			value = categories[0].name;
		}
	});
</script>

<div>
	<div class="cms-category-field__header">
		<CmsFieldLabel for="category" required>Category</CmsFieldLabel>
		<a href={cmsPaths.categories} class="cms-btn-text">Manage</a>
	</div>

	<select id="category" name="category" bind:value required class="cms-select">
		{#each categories as category (category.id)}
			<option value={category.name}>{category.name}</option>
		{/each}
	</select>
</div>
