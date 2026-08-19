<script lang="ts">
	import {
		DEFAULT_BLOG_IMAGE_PLACEHOLDER,
		isBlogImagePlaceholder
	} from '@urixoft/urx-cms-package/blog-image';
	import { resolvePublicBlogImageUrl, urxCmsConfig } from '$lib/urx-cms';

	type Props = {
		src?: string | null;
		alt: string;
		class?: string;
	};

	let { src, alt, class: className = '' }: Props = $props();

	let loadFailed = $state(false);

	$effect(() => {
		src;
		loadFailed = false;
	});

	const placeholder = urxCmsConfig.fallbackImage ?? DEFAULT_BLOG_IMAGE_PLACEHOLDER;
	const requestedSrc = $derived(resolvePublicBlogImageUrl(src, placeholder));
	const showPlaceholder = $derived(
		!requestedSrc || isBlogImagePlaceholder(requestedSrc, placeholder) || loadFailed
	);
	const blurredBackgroundSrc = $derived(
		loadFailed && requestedSrc ? requestedSrc : placeholder
	);
</script>

<div
	class="relative overflow-hidden bg-surface-muted {className}"
	class:aspect-video={!className.includes('h-')}
>
	{#if showPlaceholder}
		<div
			class="relative flex h-full min-h-48 w-full items-center justify-center overflow-hidden"
			role="img"
			aria-label="Image coming soon"
		>
			<img
				src={blurredBackgroundSrc}
				alt=""
				class="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
				aria-hidden="true"
			/>

			<div class="absolute inset-0 bg-surface-muted/40 backdrop-blur-sm" aria-hidden="true"></div>

			<div class="relative z-10 flex flex-col items-center gap-3">
				<svg
					class="h-14 w-14 text-foreground-muted/50 drop-shadow-sm"
					viewBox="0 0 96 72"
					fill="none"
					aria-hidden="true"
				>
					<rect x="1" y="1" width="94" height="70" rx="8" stroke="currentColor" stroke-width="2" />
					<circle cx="30" cy="24" r="8" fill="currentColor" fill-opacity="0.35" />
					<path
						d="M1 54 L28 30 L44 44 L70 18 L95 42 V71 H1 Z"
						fill="currentColor"
						fill-opacity="0.2"
						stroke="currentColor"
						stroke-width="2"
						stroke-linejoin="round"
					/>
				</svg>
				<span
					class="rounded-full border border-white/30 bg-white/60 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-foreground-muted uppercase shadow-sm backdrop-blur-sm"
				>
					Image coming soon
				</span>
			</div>
		</div>
	{:else}
		<img
			src={requestedSrc}
			{alt}
			class="block h-full min-h-48 w-full object-cover"
			loading="lazy"
			decoding="async"
			referrerpolicy="no-referrer"
			onerror={() => {
				loadFailed = true;
			}}
		/>
	{/if}
</div>
