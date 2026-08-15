<script lang="ts">
	import { enhance } from '$app/forms';
	import CmsRichTextEditor from '$lib/components/ui/CmsRichTextEditor.svelte';

	let { data, form } = $props();
</script>

<div>
	<h1 class="cms-heading">New Post</h1>

	<form method="POST" enctype="multipart/form-data" use:enhance class="mt-6 space-y-4">
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label for="title" class="cms-label">Title</label>
				<input id="title" name="title" required class="cms-input" />
			</div>
			<div>
				<label for="slug" class="cms-label">Slug (optional)</label>
				<input id="slug" name="slug" class="cms-input" />
			</div>
			<div>
				<label for="category" class="cms-label">Category</label>
				<input id="category" name="category" value="News" class="cms-input" />
			</div>
			{#if data.storageConfigured}
				<div class="sm:col-span-2">
					<label for="featuredImageFile" class="cms-label">Featured Image Upload</label>
					<input
						id="featuredImageFile"
						name="featuredImageFile"
						type="file"
						accept="image/jpeg,image/png,image/webp,image/gif"
						class="cms-input"
					/>
					<p class="cms-muted mt-1 text-xs">Uploaded to Linode Object Storage (max 5 MB).</p>
				</div>
			{/if}
			<div class="sm:col-span-2">
				<label for="featuredImage" class="cms-label">
					Featured Image URL {data.storageConfigured ? '(optional if uploading)' : ''}
				</label>
				<input id="featuredImage" name="featuredImage" class="cms-input" />
			</div>
			<div class="sm:col-span-2">
				<label for="excerpt" class="cms-label">Excerpt</label>
				<textarea id="excerpt" name="excerpt" rows="2" class="cms-textarea"></textarea>
			</div>
			<CmsRichTextEditor required />
			<div>
				<label for="status" class="cms-label">Status</label>
				<select id="status" name="status" class="cms-select">
					<option value="draft">Draft</option>
					<option value="published">Published</option>
				</select>
			</div>
		</div>

		{#if form?.error}
			<p class="cms-error">{form.error}</p>
		{/if}

		<button type="submit" class="cms-btn-primary">Create Post</button>
	</form>
</div>
