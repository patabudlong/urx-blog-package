<script lang="ts">
	let { rows = 6 }: { rows?: number } = $props();
</script>

<div class="cms-table-wrap mt-3" aria-hidden="true">
	<table class="cms-table cms-table--skeleton">
		<thead>
			<tr>
				<th class="cms-table-thumb-col">Featured</th>
				<th>Title</th>
				<th>Type</th>
				<th>Category</th>
				<th>Author</th>
				<th>Status</th>
				<th>Updated</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each Array.from({ length: rows }, (_, index) => index) as row (row)}
				<tr>
					<td class="cms-table-thumb-cell">
						<div class="cms-skeleton cms-skeleton--thumb"></div>
					</td>
					<td>
						<div class="cms-skeleton cms-skeleton--line cms-skeleton--line-lg"></div>
					</td>
					<td>
						<div class="cms-skeleton cms-skeleton--line cms-skeleton--line-sm"></div>
					</td>
					<td>
						<div class="cms-skeleton cms-skeleton--line cms-skeleton--line-md"></div>
					</td>
					<td>
						<div class="cms-skeleton cms-skeleton--line cms-skeleton--line-md"></div>
					</td>
					<td>
						<div class="cms-skeleton cms-skeleton--badge"></div>
					</td>
					<td>
						<div class="cms-skeleton cms-skeleton--line cms-skeleton--line-sm"></div>
					</td>
					<td>
						<div class="cms-skeleton cms-skeleton--actions"></div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
