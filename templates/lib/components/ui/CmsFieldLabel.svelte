<script lang="ts">
	import CmsTooltip from './CmsTooltip.svelte';

	type Props = {
		for?: string;
		required?: boolean;
		tooltip?: string;
		class?: string;
		children: import('svelte').Snippet;
	};

	let { for: htmlFor, required = false, tooltip, class: className = '', children }: Props = $props();
</script>

{#if htmlFor}
	<label for={htmlFor} class="cms-field-label {className}">
		<span class="cms-field-label__text">{@render children()}</span>
		{#if required}
			<span class="cms-required">Required</span>
		{/if}
		{#if tooltip}
			<CmsTooltip text={tooltip} />
		{/if}
	</label>
{:else}
	<span class="cms-field-label cms-label {className}">
		<span class="cms-field-label__text">{@render children()}</span>
		{#if required}
			<span class="cms-required">Required</span>
		{/if}
		{#if tooltip}
			<CmsTooltip text={tooltip} />
		{/if}
	</span>
{/if}
