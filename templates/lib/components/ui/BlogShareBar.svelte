<script lang="ts">
	import type { BlogShareData, BlogShareLink } from '@urixoft/urx-cms-package';
	import BlogShareIcon from './BlogShareIcon.svelte';

	type Props = {
		share: BlogShareData;
		heading?: string;
		class?: string;
	};

	let { share, heading = 'Share this article', class: className = '' }: Props = $props();

	let copied = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout> | undefined;

	async function copyLink(link: BlogShareLink) {
		try {
			await navigator.clipboard.writeText(link.href);
			copied = true;
			clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			window.prompt('Copy this link:', link.href);
		}
	}
</script>

<div class="blog-share {className}">
	<p class="blog-share__label">{heading}</p>
	<div class="blog-share__actions" role="list">
		{#each share.links as link (link.platform)}
			{#if link.platform === 'copy'}
				<button
					type="button"
					class="blog-share__button"
					aria-label={copied ? 'Link copied' : link.label}
					onclick={() => copyLink(link)}
				>
					{#if copied}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="blog-share-icon"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M20 6 9 17l-5-5" />
						</svg>
					{:else}
						<BlogShareIcon platform={link.platform} />
					{/if}
					<span class="blog-share__text">{copied ? 'Copied!' : link.label}</span>
				</button>
			{:else}
				<a
					class="blog-share__button"
					href={link.href}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={`Share on ${link.label}`}
				>
					<BlogShareIcon platform={link.platform} />
					<span class="blog-share__text">{link.label}</span>
				</a>
			{/if}
		{/each}
	</div>
</div>

<style>
	.blog-share {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.blog-share__label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-foreground-muted, #64748b);
	}

	.blog-share__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.blog-share__button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border, #e2e8f0);
		border-radius: 9999px;
		background: var(--color-surface, #fff);
		color: var(--color-foreground, #0f172a);
		font-size: 0.8125rem;
		font-weight: 500;
		line-height: 1;
		text-decoration: none;
		transition:
			border-color 0.15s ease,
			color 0.15s ease,
			background-color 0.15s ease;
	}

	.blog-share__button:hover {
		border-color: var(--color-brand, #2563eb);
		color: var(--color-brand, #2563eb);
		background: color-mix(in srgb, var(--color-brand, #2563eb) 6%, transparent);
	}

	.blog-share__text {
		white-space: nowrap;
	}
</style>
