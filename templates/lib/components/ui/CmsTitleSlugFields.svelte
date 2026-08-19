<script lang="ts">
	import CmsFieldLabel from './CmsFieldLabel.svelte';
	import { slugify } from '$lib/cms-post-form';

	type Props = {
		initialTitle?: string;
		initialSlug?: string;
	};

	let { initialTitle = '', initialSlug = '' }: Props = $props();

	let title = $state('');
	let slug = $state('');
	let slugManual = $state(false);

	$effect(() => {
		title = initialTitle;
		slug = initialSlug;
		slugManual = Boolean(initialSlug) && slugify(initialTitle) !== initialSlug;
	});

	function onTitleInput(event: Event) {
		title = (event.currentTarget as HTMLInputElement).value;
		if (!slugManual) slug = slugify(title);
	}

	function onSlugInput(event: Event) {
		slug = (event.currentTarget as HTMLInputElement).value;
		slugManual = true;
	}
</script>

<div class="sm:col-span-2">
	<CmsFieldLabel for="title" required>Title</CmsFieldLabel>
	<input
		id="title"
		name="title"
		required
		class="cms-input"
		value={title}
		oninput={onTitleInput}
	/>
</div>
<div>
	<CmsFieldLabel
		for="slug"
		tooltip="Updates automatically when you change the title, unless you edit the slug yourself."
	>
		Slug
	</CmsFieldLabel>
	<input
		id="slug"
		name="slug"
		class="cms-input"
		placeholder="auto-generated-from-title"
		value={slug}
		oninput={onSlugInput}
	/>
</div>
