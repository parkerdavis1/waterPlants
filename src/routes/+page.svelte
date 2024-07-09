<script lang="ts">
	import PlantCard from '$lib/components/PlantCard.svelte';

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

<div class="flex flex-wrap">
	{#each plants as plant}
		<PlantCard {plant} />
	{/each}
</div>
