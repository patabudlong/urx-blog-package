<script lang="ts">
	import CmsActivityTable from '$lib/components/ui/CmsActivityTable.svelte';

	let { data } = $props();
</script>

<div>
	<h1 class="cms-heading">Activity</h1>
	<p class="cms-muted mt-2">
		Recent CMS actions and sign-in events. Entries are kept for audit and troubleshooting.
	</p>

	<CmsActivityTable events={data.events} filter={data.filter} />
</div>
