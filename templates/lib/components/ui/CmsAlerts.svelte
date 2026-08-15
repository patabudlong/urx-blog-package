<script lang="ts">
	import { cmsAlerts, dismissCmsAlert, type CmsAlertType } from '$lib/cms-alert';

	function iconPath(type: CmsAlertType): string {
		switch (type) {
			case 'success':
				return 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
			case 'error':
				return 'M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
			case 'warning':
				return 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z';
		}
	}
</script>

{#if $cmsAlerts.length > 0}
	<div class="cms-alerts" aria-live="polite" aria-atomic="true">
		{#each $cmsAlerts as alert (alert.id)}
			<div class="cms-alert cms-alert--{alert.type}" role="alert">
				<span class="cms-alert__icon" aria-hidden="true">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d={iconPath(alert.type)} />
					</svg>
				</span>
				<div class="cms-alert__content">
					<p class="cms-alert__label">{alert.label}</p>
					{#if alert.subtext}
						<p class="cms-alert__subtext">{alert.subtext}</p>
					{/if}
				</div>
				<button
					type="button"
					class="cms-alert__close"
					aria-label="Dismiss alert"
					onclick={() => dismissCmsAlert(alert.id)}
				>
					×
				</button>
			</div>
		{/each}
	</div>
{/if}
