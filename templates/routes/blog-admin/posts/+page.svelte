<script lang="ts">
	let { data } = $props();
</script>

<div>
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-white">Posts</h1>
		<a
			href="/blog-admin/posts/new"
			class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
		>
			New Post
		</a>
	</div>

	<div class="mt-6 overflow-hidden rounded-xl border border-slate-800">
		<table class="min-w-full divide-y divide-slate-800 text-sm">
			<thead class="bg-slate-900 text-left text-slate-400">
				<tr>
					<th class="px-4 py-3 font-medium">Title</th>
					<th class="px-4 py-3 font-medium">Category</th>
					<th class="px-4 py-3 font-medium">Status</th>
					<th class="px-4 py-3 font-medium">Updated</th>
					<th class="px-4 py-3 font-medium"></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-800 bg-slate-950">
				{#each data.posts as post (post.id)}
					<tr>
						<td class="px-4 py-3 text-white">{post.title}</td>
						<td class="px-4 py-3 text-slate-300">{post.category}</td>
						<td class="px-4 py-3">
							<span
								class="rounded-full px-2 py-1 text-xs font-medium {post.status === 'published'
									? 'bg-emerald-900 text-emerald-300'
									: 'bg-amber-900 text-amber-300'}"
							>
								{post.status}
							</span>
						</td>
						<td class="px-4 py-3 text-slate-400">
							{new Intl.DateTimeFormat('en-US').format(post.updatedAt)}
						</td>
						<td class="px-4 py-3 text-right">
							<a href="/blog-admin/posts/{post.id}" class="text-blue-400 hover:text-blue-300">Edit</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
