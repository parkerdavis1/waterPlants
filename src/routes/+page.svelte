<script lang="ts">
	import PlantCard from '$lib/components/PlantCard.svelte';
	import Toolbar from 'src/lib/components/Toolbar.svelte';

	export let data;
	const { plants } = data;
</script>

<Toolbar />
<div class="flex flex-wrap gap-4">
	{#each plants as plant}
		<PlantCard {plant} {data} />
	{/each}
</div>
