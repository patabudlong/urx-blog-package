<script lang="ts">
	import { cmsPaths } from '$lib/urx-cms';

	let { data } = $props();
</script>

<div>
	<div class="flex items-center justify-between">
		<h1 class="cms-heading">Posts</h1>
		<a href={cmsPaths.newPost} class="cms-btn-primary">New Post</a>
	</div>

	<div class="cms-table-wrap mt-6">
		<table class="cms-table">
			<thead>
				<tr>
					<th>Title</th>
					<th>Category</th>
					<th>Status</th>
					<th>Updated</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each data.posts as post (post.id)}
					<tr>
						<td>{post.title}</td>
						<td class="cms-muted">{post.category}</td>
						<td>
							<span class="cms-badge {post.status === 'published' ? 'cms-badge--published' : 'cms-badge--draft'}">
								{post.status}
							</span>
						</td>
						<td class="cms-muted">
							{new Intl.DateTimeFormat('en-US').format(post.updatedAt)}
						</td>
						<td class="text-right">
							<a href={cmsPaths.editPost(post.id)} class="cms-link">Edit</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
