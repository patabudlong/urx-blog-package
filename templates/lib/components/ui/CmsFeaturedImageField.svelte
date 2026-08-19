<script lang="ts">
	import CmsFieldLabel from './CmsFieldLabel.svelte';
	import { getCmsMediaPreviewUrl, isManagedBlogImageUrl } from '$lib/urx-cms';

	type Props = {
		storageConfigured?: boolean;
		initialImageUrl?: string | null;
	};

	let { storageConfigured = false, initialImageUrl = '' }: Props = $props();

	let mode = $state<'upload' | 'url'>('upload');
	let imageUrl = $state('');
	let selectedFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let dragActive = $state(false);
	let imageLoading = $state(false);
	let imageError = $state(false);

	let fileInput = $state<HTMLInputElement | null>(null);

	const displayUrl = $derived(
		previewUrl ?? (imageUrl.trim() || initialImageUrl?.trim() || null)
	);

	const previewSrc = $derived.by(() => {
		if (!displayUrl) return null;
		if (displayUrl.startsWith('blob:')) return displayUrl;
		if (isManagedBlogImageUrl(displayUrl)) return getCmsMediaPreviewUrl(displayUrl);
		return displayUrl;
	});

	$effect(() => {
		mode = storageConfigured ? 'upload' : 'url';
		imageUrl = initialImageUrl?.trim() ?? '';
	});

	$effect(() => {
		if (previewSrc && !previewUrl) {
			imageLoading = true;
			imageError = false;
		}
	});

	function setMode(next: 'upload' | 'url') {
		mode = next;
	}

	function openFilePicker() {
		fileInput?.click();
	}

	function assignFile(file: File | null) {
		selectedFile = file;
		imageError = false;

		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}

		if (file) {
			previewUrl = URL.createObjectURL(file);
			imageLoading = true;
		}
	}

	function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		assignFile(input.files?.[0] ?? null);
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragActive = false;

		const file = event.dataTransfer?.files?.[0];
		if (!file || !file.type.startsWith('image/')) return;

		assignFile(file);

		if (fileInput) {
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(file);
			fileInput.files = dataTransfer.files;
		}
	}

	function onDragOver(event: DragEvent) {
		event.preventDefault();
		dragActive = true;
	}

	function onDragLeave() {
		dragActive = false;
	}

	function clearUpload() {
		assignFile(null);
		if (fileInput) {
			fileInput.value = '';
		}
	}

	function onImageLoad() {
		imageLoading = false;
		imageError = false;
	}

	function onImageError() {
		imageLoading = false;
		imageError = true;
	}
</script>

<div class="cms-featured-image sm:col-span-2">
	<CmsFieldLabel>Featured Image</CmsFieldLabel>
	<p class="cms-featured-image__intro">
		{#if initialImageUrl}
			Current featured image is shown below. {#if storageConfigured}Upload a new file or paste a different
			image link to replace it.{:else}Update the image link below to replace it.{/if}
		{:else if storageConfigured}
			Upload a file from your device or paste an image link.
		{:else}
			Paste a direct link to an image hosted online.
		{/if}
	</p>

	{#if storageConfigured}
		<div class="cms-image-source-picker" role="tablist" aria-label="Featured image source">
			<button
				type="button"
				class="cms-image-source-option {mode === 'upload' ? 'cms-image-source-option--active' : ''}"
				role="tab"
				aria-selected={mode === 'upload'}
				onclick={() => setMode('upload')}
			>
				<span class="cms-image-source-option__icon" aria-hidden="true">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
						/>
					</svg>
				</span>
				<span class="cms-image-source-option__content">
					<span class="cms-image-source-option__title">Upload image</span>
					<span class="cms-image-source-option__desc">JPG, PNG, WebP, or GIF · max 5 MB</span>
				</span>
			</button>
			<button
				type="button"
				class="cms-image-source-option {mode === 'url' ? 'cms-image-source-option--active' : ''}"
				role="tab"
				aria-selected={mode === 'url'}
				onclick={() => setMode('url')}
			>
				<span class="cms-image-source-option__icon" aria-hidden="true">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M8.25 9.75h.008v.008H8.25V9.75z"
						/>
					</svg>
				</span>
				<span class="cms-image-source-option__content">
					<span class="cms-image-source-option__title">Image link</span>
					<span class="cms-image-source-option__desc">Use a URL if the image is already online</span>
				</span>
			</button>
		</div>
	{/if}

	<div class="cms-featured-image__panel">
		{#if mode === 'upload' && storageConfigured}
			<input
				bind:this={fileInput}
				id="featuredImageFile"
				name="featuredImageFile"
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				class="sr-only"
				onchange={onFileChange}
			/>

			<button
				type="button"
				class="cms-dropzone {dragActive ? 'cms-dropzone--active' : ''}"
				ondragover={onDragOver}
				ondragleave={onDragLeave}
				ondrop={onDrop}
				onclick={openFilePicker}
			>
				{#if displayUrl}
					<div class="cms-dropzone__preview-wrap">
						{#if imageLoading}
							<div class="cms-image-skeleton" aria-hidden="true"></div>
						{/if}
						{#if imageError}
							<div class="cms-dropzone__placeholder" aria-hidden="true">
								<svg
									class="cms-dropzone__placeholder-icon"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
								>
									<rect x="3" y="3" width="18" height="18" rx="2.5" />
									<circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
									<path stroke-linecap="round" stroke-linejoin="round" d="M21 15l-5-5L5 21" />
								</svg>
							</div>
							<p class="cms-dropzone__hint">Could not load image preview</p>
						{:else}
							<img
								src={previewSrc}
								alt=""
								class="cms-dropzone__preview"
								class:cms-dropzone__preview--loading={imageLoading}
								onload={onImageLoad}
								onerror={onImageError}
							/>
						{/if}
					</div>
					<p class="cms-dropzone__hint">
						{selectedFile ? 'Click or drop another image to replace' : 'Click or drop to replace this image'}
					</p>
				{:else}
					<div class="cms-dropzone__placeholder" aria-hidden="true">
						<svg
							class="cms-dropzone__placeholder-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<rect x="3" y="3" width="18" height="18" rx="2.5" />
							<circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M21 15l-5-5L5 21" />
						</svg>
					</div>
					<p class="cms-dropzone__title">Drop or upload image here</p>
					<p class="cms-dropzone__hint">Click to browse from your device</p>
				{/if}
			</button>

			{#if selectedFile}
				<div class="cms-dropzone__meta">
					<span class="cms-muted text-xs">{selectedFile.name}</span>
					<button type="button" class="cms-btn-text" onclick={clearUpload}>Remove</button>
				</div>
			{/if}
		{:else}
			<div class="cms-image-url-field">
				<label for="featuredImage" class="sr-only">Featured image URL</label>
				<div class="cms-image-url-field__input-wrap">
					<span class="cms-image-url-field__icon" aria-hidden="true">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M8.25 9.75h.008v.008H8.25V9.75z"
							/>
						</svg>
					</span>
					<input
						id="featuredImage"
						name="featuredImage"
						bind:value={imageUrl}
						class="cms-input cms-image-url-field__input"
						placeholder="https://example.com/your-image.jpg"
					/>
				</div>
				<p class="cms-image-url-field__help">
					Paste a direct link to the image file. The URL should end in .jpg, .png, .webp, or similar.
				</p>

				{#if displayUrl}
					<div class="cms-image-preview-card">
						<div class="cms-dropzone__preview-wrap">
							{#if imageLoading}
								<div class="cms-image-skeleton cms-image-skeleton--card" aria-hidden="true"></div>
							{/if}
							{#if imageError}
								<p class="cms-muted text-xs">Could not load image preview.</p>
							{:else}
								<img
									src={previewSrc}
									alt=""
									class="cms-image-preview-card__image"
									class:cms-dropzone__preview--loading={imageLoading}
									onload={onImageLoad}
									onerror={onImageError}
								/>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
