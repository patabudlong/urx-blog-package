<script lang="ts">
	import { enhance } from '$app/forms';
	import type { BlogPostWithAuthor, PostQuotaSnapshot } from '@urixoft/urx-cms-package';
	import { cmsAlert } from '$lib/cms-alert';
	import {
		cmsPaths,
		getCmsMediaPreviewUrl,
		isBlogImagePlaceholder,
		isManagedBlogImageUrl,
		resolveBlogImageUrl,
		urxCmsConfig
	} from '$lib/urx-cms';

	let {
		posts,
		quota,
		deleting = false,
		postToDelete = null,
		onDelete
	}: {
		posts: BlogPostWithAuthor[];
		quota: PostQuotaSnapshot;
		deleting?: boolean;
		postToDelete?: BlogPostWithAuthor | null;
		onDelete: (post: BlogPostWithAuthor) => void;
	} = $props();

	let duplicatingId = $state<number | null>(null);
	let searchQuery = $state('');

	const filteredPosts = $derived(
		posts.filter((post) => {
			const query = searchQuery.trim().toLowerCase();
			if (!query) return true;

			const typeLabel = post.kind === 'service' ? quota.service.label : quota.news.label;

			return [post.title, post.category, post.slug, post.excerpt, post.authorName, post.status, typeLabel]
				.filter(Boolean)
				.some((value) => String(value).toLowerCase().includes(query));
		})
	);

	function getPostThumbnailSrc(featuredImage: string | null): string {
		const placeholder = urxCmsConfig.fallbackImage;
		if (isBlogImagePlaceholder(featuredImage, placeholder)) {
			return placeholder;
		}

		const resolved = resolveBlogImageUrl(featuredImage, placeholder);
		if (isManagedBlogImageUrl(resolved)) {
			return getCmsMediaPreviewUrl(resolved);
		}

		return resolved;
	}
</script>

<div class="cms-table-toolbar mt-4">
	<label class="cms-table-search">
		<span class="sr-only">Search posts</span>
		<svg class="cms-table-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
			/>
		</svg>
		<input
			type="search"
			class="cms-input cms-table-search__input"
			placeholder="Search by title, author, category..."
			bind:value={searchQuery}
		/>
	</label>
	{#if searchQuery.trim()}
		<p class="cms-muted text-sm">
			{filteredPosts.length} of {posts.length} posts
		</p>
	{/if}
</div>

<div class="cms-table-wrap mt-3">
	<table class="cms-table">
		<thead>
			<tr>
				<th class="cms-table-thumb-col">Featured</th>
				<th>Title</th>
				<th>Type</th>
				<th>Category</th>
				<th>Author</th>
				<th>Status</th>
				<th>Updated</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each filteredPosts as post (post.id)}
				{@const atKindLimit = quota[post.kind].atLimit}
				{@const thumbnailSrc = getPostThumbnailSrc(post.featuredImage)}
				{@const isPlaceholder = isBlogImagePlaceholder(post.featuredImage, urxCmsConfig.fallbackImage)}
				<tr>
					<td class="cms-table-thumb-cell">
						<img
							src={thumbnailSrc}
							alt={isPlaceholder ? 'No featured image' : `Featured image for ${post.title}`}
							class="cms-table-thumb"
							class:cms-table-thumb--placeholder={isPlaceholder}
							loading="lazy"
							decoding="async"
							onerror={(event) => {
								const img = event.currentTarget as HTMLImageElement;
								img.onerror = null;
								img.src = urxCmsConfig.fallbackImage;
								img.classList.add('cms-table-thumb--placeholder');
							}}
						/>
					</td>
					<td>{post.title}</td>
					<td class="cms-muted">{post.kind === 'service' ? quota.service.label : quota.news.label}</td>
					<td class="cms-muted">{post.category}</td>
					<td class="cms-muted">{post.authorName ?? '—'}</td>
					<td>
						<span class="cms-badge {post.status === 'published' ? 'cms-badge--published' : 'cms-badge--draft'}">
							{post.status}
						</span>
					</td>
					<td class="cms-muted">
						{new Intl.DateTimeFormat('en-US').format(post.updatedAt)}
					</td>
					<td>
						<div class="cms-table-actions">
							<a href={cmsPaths.editPost(post.id)} class="cms-table-action" aria-label="Edit post">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
									/>
								</svg>
								<span class="cms-table-action__tooltip" role="tooltip">Edit</span>
							</a>

							<form
								method="POST"
								action="?/duplicate"
								use:enhance={() => {
									duplicatingId = post.id;
									return async ({ result, update }) => {
										duplicatingId = null;
										if (result.type === 'failure') {
											const message =
												(result.data as { error?: string } | undefined)?.error ??
												'Could not duplicate post.';
											cmsAlert.error({
												label: 'Could not duplicate post',
												subtext: message
											});
										}
										await update();
									};
								}}
							>
								<input type="hidden" name="id" value={post.id} />
								<button
									type="submit"
									class="cms-table-action"
									disabled={atKindLimit || duplicatingId === post.id}
									aria-label={atKindLimit
										? `Plan limit reached for ${quota[post.kind].label} pages`
										: 'Duplicate post'}
								>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m6.75 10.5H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
										/>
									</svg>
									<span class="cms-table-action__tooltip" role="tooltip">
										{atKindLimit
											? `Limit reached for ${quota[post.kind].label}`
											: duplicatingId === post.id
												? 'Duplicating...'
												: 'Duplicate'}
									</span>
								</button>
							</form>

							<button
								type="button"
								class="cms-table-action cms-table-action--danger"
								disabled={deleting && postToDelete?.id === post.id}
								aria-label="Delete post"
								onclick={() => onDelete(post)}
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
									/>
								</svg>
								<span class="cms-table-action__tooltip" role="tooltip">Delete</span>
							</button>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	{#if filteredPosts.length === 0}
		<p class="cms-table-empty">No posts match your search.</p>
	{/if}
</div>
