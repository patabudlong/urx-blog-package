<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<div class="mx-auto max-w-md">
	<div class="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
		<h1 class="text-2xl font-bold text-white">Urixoft CMS</h1>
		<p class="mt-2 text-sm text-slate-400">Sign in to manage site content.</p>

		<form method="POST" use:enhance class="mt-8 space-y-4">
			<div>
				<label for="email" class="mb-1 block text-sm text-slate-300">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
					placeholder="superadmin@urixoft.com"
				/>
			</div>
			<div>
				<label for="password" class="mb-1 block text-sm text-slate-300">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
				/>
			</div>

			{#if form?.error}
				<p class="text-sm text-red-400">{form.error}</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
			>
				Sign In
			</button>
		</form>
	</div>
</div>
