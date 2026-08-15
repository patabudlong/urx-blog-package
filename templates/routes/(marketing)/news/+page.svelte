<script lang="ts">
	import BlogIndexPage from '../blog/+page.svelte';

	let { data } = $props();
</script>

<BlogIndexPage {data} />
