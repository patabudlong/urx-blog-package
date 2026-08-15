<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	const post = $derived(data.post);
</script>

<div>
	<h1 class="text-2xl font-bold text-white">Edit Post</h1>

	<form method="POST" action="?/update" enctype="multipart/form-data" use:enhance class="mt-6 space-y-4">
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label for="title" class="mb-1 block text-sm text-slate-300">Title</label>
				<input
					id="title"
					name="title"
					required
					value={post.title}
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
				/>
			</div>
			<div>
				<label for="slug" class="mb-1 block text-sm text-slate-300">Slug</label>
				<input
					id="slug"
					name="slug"
					value={post.slug}
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
				/>
			</div>
			<div>
				<label for="category" class="mb-1 block text-sm text-slate-300">Category</label>
				<input
					id="category"
					name="category"
					value={post.category}
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
				/>
			</div>
			{#if data.storageConfigured}
				<div class="sm:col-span-2">
					<label for="featuredImageFile" class="mb-1 block text-sm text-slate-300">
						Replace Featured Image
					</label>
					<input
						id="featuredImageFile"
						name="featuredImageFile"
						type="file"
						accept="image/jpeg,image/png,image/webp,image/gif"
						class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white"
					/>
					{#if post.featuredImage}
						<img
							src={post.featuredImage}
							alt={post.title}
							class="mt-3 max-h-40 rounded-lg border border-slate-800 object-cover"
						/>
					{/if}
				</div>
			{/if}
			<div class="sm:col-span-2">
				<label for="featuredImage" class="mb-1 block text-sm text-slate-300">
					Featured Image URL {data.storageConfigured ? '(optional if uploading)' : ''}
				</label>
				<input
					id="featuredImage"
					name="featuredImage"
					value={post.featuredImage ?? ''}
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
				/>
			</div>
			<div class="sm:col-span-2">
				<label for="excerpt" class="mb-1 block text-sm text-slate-300">Excerpt</label>
				<textarea
					id="excerpt"
					name="excerpt"
					rows="2"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
					>{post.excerpt ?? ''}</textarea
				>
			</div>
			<div class="sm:col-span-2">
				<label for="content" class="mb-1 block text-sm text-slate-300">Content (HTML)</label>
				<textarea
					id="content"
					name="content"
					required
					rows="12"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white"
					>{post.content}</textarea
				>
			</div>
			<div>
				<label for="status" class="mb-1 block text-sm text-slate-300">Status</label>
				<select
					id="status"
					name="status"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
				>
					<option value="draft" selected={post.status === 'draft'}>Draft</option>
					<option value="published" selected={post.status === 'published'}>Published</option>
				</select>
			</div>
		</div>

		{#if form?.error}
			<p class="text-sm text-red-400">{form.error}</p>
		{/if}
		{#if form?.success}
			<p class="text-sm text-emerald-400">Post saved.</p>
		{/if}

		<div class="flex gap-3">
			<button
				type="submit"
				class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
			>
				Save Changes
			</button>
			{#if post.status === 'published'}
				<a href="/blog/{post.slug}" class="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:text-white">
					View Live
				</a>
			{/if}
		</div>
	</form>

	<form method="POST" action="?/delete" use:enhance class="mt-8 border-t border-slate-800 pt-8">
		<button type="submit" class="text-sm text-red-400 hover:text-red-300">Delete Post</button>
	</form>
</div>
