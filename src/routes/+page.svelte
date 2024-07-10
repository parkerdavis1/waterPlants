<script lang="ts">
	import PlantCard from '$lib/components/PlantCard.svelte';
	import Toolbar from 'src/lib/components/Toolbar.svelte';
	import Button from 'src/lib/components/ui/button/button.svelte';

	export let data;
	const { plants } = data;

	// let plants2 = [
	// 	{
	// 		name: 'Mesquite',
	// 		species: 'Prosopis spp.',
	// 		image: 'plant1.JPG',
	// 		waterPeriod: 4,
	// 		lastWatered: new Date().getTime() - 1000 * 60 * 60 * 24
	// 	}
	// ];
</script>

<Toolbar />
<div class="flex flex-wrap gap-4">
	{#each plants as plant}
		<PlantCard {plant} {data} />
	{/each}
</div>
