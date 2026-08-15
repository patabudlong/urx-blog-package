<script lang="ts">
	type Props = {
		size?: 'sm' | 'md';
	};

	let { size = 'sm' }: Props = $props();
</script>

<span class="cms-spinner cms-spinner--{size}" aria-hidden="true"></span>
