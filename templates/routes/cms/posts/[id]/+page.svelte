<script lang="ts">
	import { enhance } from '$app/forms';
	import CmsRichTextEditor from '$lib/components/ui/CmsRichTextEditor.svelte';

	let { data, form } = $props();
	const post = $derived(data.post);
</script>

<div>
	<h1 class="cms-heading">Edit Post</h1>

	<form method="POST" action="?/update" enctype="multipart/form-data" use:enhance class="mt-6 space-y-4">
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label for="title" class="cms-label">Title</label>
				<input id="title" name="title" required value={post.title} class="cms-input" />
			</div>
			<div>
				<label for="slug" class="cms-label">Slug</label>
				<input id="slug" name="slug" value={post.slug} class="cms-input" />
			</div>
			<div>
				<label for="category" class="cms-label">Category</label>
				<input id="category" name="category" value={post.category} class="cms-input" />
			</div>
			{#if data.storageConfigured}
				<div class="sm:col-span-2">
					<label for="featuredImageFile" class="cms-label">Replace Featured Image</label>
					<input
						id="featuredImageFile"
						name="featuredImageFile"
						type="file"
						accept="image/jpeg,image/png,image/webp,image/gif"
						class="cms-input"
					/>
					{#if post.featuredImage}
						<img
							src={post.featuredImage}
							alt={post.title}
							class="cms-card mt-3 max-h-40 object-cover"
						/>
					{/if}
				</div>
			{/if}
			<div class="sm:col-span-2">
				<label for="featuredImage" class="cms-label">
					Featured Image URL {data.storageConfigured ? '(optional if uploading)' : ''}
				</label>
				<input
					id="featuredImage"
					name="featuredImage"
					value={post.featuredImage ?? ''}
					class="cms-input"
				/>
			</div>
			<div class="sm:col-span-2">
				<label for="excerpt" class="cms-label">Excerpt</label>
				<textarea id="excerpt" name="excerpt" rows="2" class="cms-textarea">{post.excerpt ?? ''}</textarea>
			</div>
			<CmsRichTextEditor value={post.content} required />
			<div>
				<label for="status" class="cms-label">Status</label>
				<select id="status" name="status" class="cms-select">
					<option value="draft" selected={post.status === 'draft'}>Draft</option>
					<option value="published" selected={post.status === 'published'}>Published</option>
				</select>
			</div>
		</div>

		{#if form?.error}
			<p class="cms-error">{form.error}</p>
		{/if}
		{#if form?.success}
			<p class="cms-success">Post saved.</p>
		{/if}

		<div class="flex gap-3">
			<button type="submit" class="cms-btn-primary">Save Changes</button>
			{#if post.status === 'published'}
				<a href="{data.blogBasePath}/{post.slug}" class="cms-btn-outline">View Live</a>
			{/if}
		</div>
	</form>

	<form method="POST" action="?/delete" use:enhance class="cms-section-divider mt-8 pt-8">
		<button type="submit" class="cms-btn-danger">Delete Post</button>
	</form>
</div>
