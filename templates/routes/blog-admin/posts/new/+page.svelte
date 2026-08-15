<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<div>
	<h1 class="text-2xl font-bold text-white">New Post</h1>

	<form method="POST" use:enhance class="mt-6 space-y-4">
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label for="title" class="mb-1 block text-sm text-slate-300">Title</label>
				<input
					id="title"
					name="title"
					required
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
				/>
			</div>
			<div>
				<label for="slug" class="mb-1 block text-sm text-slate-300">Slug (optional)</label>
				<input
					id="slug"
					name="slug"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
				/>
			</div>
			<div>
				<label for="category" class="mb-1 block text-sm text-slate-300">Category</label>
				<input
					id="category"
					name="category"
					value="News"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
				/>
			</div>
			<div class="sm:col-span-2">
				<label for="featuredImage" class="mb-1 block text-sm text-slate-300">Featured Image URL</label>
				<input
					id="featuredImage"
					name="featuredImage"
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
				></textarea>
			</div>
			<div class="sm:col-span-2">
				<label for="content" class="mb-1 block text-sm text-slate-300">Content (HTML)</label>
				<textarea
					id="content"
					name="content"
					required
					rows="12"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white"
				></textarea>
			</div>
			<div>
				<label for="status" class="mb-1 block text-sm text-slate-300">Status</label>
				<select
					id="status"
					name="status"
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
				>
					<option value="draft">Draft</option>
					<option value="published">Published</option>
				</select>
			</div>
		</div>

		{#if form?.error}
			<p class="text-sm text-red-400">{form.error}</p>
		{/if}

		<button
			type="submit"
			class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
		>
			Create Post
		</button>
	</form>
</div>
