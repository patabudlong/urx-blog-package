<script lang="ts">
	import BlogPostPage from '../../blog/[slug]/+page.svelte';

	let { data } = $props();
</script>

<BlogPostPage {data} />
