<script lang="ts">
	import { cmsPaths } from '$lib/urx-cms';

	let { data } = $props();
</script>

<div>
	<div class="flex items-start justify-between gap-4">
		<div>
			<h1 class="cms-heading">Dashboard</h1>
			<p class="cms-muted mt-2">Manage your Latest News posts from here.</p>
		</div>
		<a href={cmsPaths.newPost} class="cms-btn-primary shrink-0">Create New Post</a>
	</div>

	<div class="mt-8 grid gap-4 sm:grid-cols-3">
		<div class="cms-card p-6">
			<p class="cms-stat-label">Total Posts</p>
			<p class="cms-stat-value">{data.posts.length}</p>
		</div>
		<div class="cms-card p-6">
			<p class="cms-stat-label">Published</p>
			<p class="cms-stat-value cms-stat-value--success">
				{data.posts.filter((p) => p.status === 'published').length}
			</p>
		</div>
		<div class="cms-card p-6">
			<p class="cms-stat-label">Drafts</p>
			<p class="cms-stat-value cms-stat-value--draft">
				{data.posts.filter((p) => p.status === 'draft').length}
			</p>
		</div>
	</div>
</div>
