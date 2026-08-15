<script lang="ts">
	import { cmsPaths } from '$lib/urx-cms';

	let { data } = $props();
</script>

<div>
	<h1 class="text-2xl font-bold text-white">Dashboard</h1>
	<p class="mt-2 text-slate-400">Manage your Latest News posts from here.</p>

	<div class="mt-8 grid gap-4 sm:grid-cols-3">
		<div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
			<p class="text-sm text-slate-400">Total Posts</p>
			<p class="mt-2 text-3xl font-bold text-white">{data.posts.length}</p>
		</div>
		<div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
			<p class="text-sm text-slate-400">Published</p>
			<p class="mt-2 text-3xl font-bold text-emerald-400">
				{data.posts.filter((p) => p.status === 'published').length}
			</p>
		</div>
		<div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
			<p class="text-sm text-slate-400">Drafts</p>
			<p class="mt-2 text-3xl font-bold text-amber-400">
				{data.posts.filter((p) => p.status === 'draft').length}
			</p>
		</div>
	</div>

	<div class="mt-8">
		<a
			href={cmsPaths.newPost}
			class="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
		>
			Create New Post
		</a>
	</div>
</div>
