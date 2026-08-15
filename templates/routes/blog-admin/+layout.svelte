<script lang="ts">
	let { children, data } = $props();
</script>

<div class="min-h-screen bg-slate-950 text-slate-100">
	{#if data.user}
		<header class="border-b border-slate-800 bg-slate-900">
			<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
				<div class="flex items-center gap-6">
					<a href="/blog-admin" class="font-semibold text-white">URX Blog Admin</a>
					<nav class="flex gap-4 text-sm text-slate-300">
						<a href="/blog-admin" class="hover:text-white">Dashboard</a>
						<a href="/blog-admin/posts" class="hover:text-white">Posts</a>
						<a href="/blog-admin/posts/new" class="hover:text-white">New Post</a>
					</nav>
				</div>
				<div class="flex items-center gap-4 text-sm">
					<span class="text-slate-400">{data.user.email}</span>
					<form method="POST" action="/blog-admin/logout">
						<button type="submit" class="text-slate-300 hover:text-white">Logout</button>
					</form>
				</div>
			</div>
		</header>
	{/if}

	<main class="mx-auto max-w-6xl px-6 py-8">
		{@render children()}
	</main>
</div>
