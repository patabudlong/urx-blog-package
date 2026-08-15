<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<div class="cms-login-card">
	<h1 class="cms-heading">Urixoft CMS</h1>
	<p class="cms-muted mt-2 text-sm">Sign in to manage site content.</p>

	<form method="POST" use:enhance class="mt-8 space-y-4">
		<div>
			<label for="email" class="cms-label">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				class="cms-input"
				placeholder="superadmin@urixoft.com"
			/>
		</div>
		<div>
			<label for="password" class="cms-label">Password</label>
			<input id="password" name="password" type="password" required class="cms-input" />
		</div>

		{#if form?.error}
			<p class="cms-error">{form.error}</p>
		{/if}

		<button type="submit" class="cms-btn-primary w-full">Sign In</button>
	</form>
</div>
