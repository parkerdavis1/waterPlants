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
	// 	},
	// 	{
	// 		name: 'Palo Verde',
	// 		species: 'Parkinsonia spp.',
	// 		image: 'plant2.JPG',
	// 		waterPeriod: 4,
	// 		lastWatered: new Date().getTime() - 1000 * 60 * 60 * 24 * 2
	// 	},
	// 	{
	// 		name: 'Mesquite',
	// 		species: 'Prosopis spp.',
	// 		image: 'plant1.JPG',
	// 		waterPeriod: 4,
	// 		lastWatered: new Date().getTime() - 1000 * 60 * 60 * 24 * 3
	// 	},
	// 	{
	// 		name: 'Palo Verde',
	// 		species: 'Parkinsonia spp.',
	// 		image: 'plant2.JPG',
	// 		waterPeriod: 4,
	// 		lastWatered: new Date().getTime() - 1000 * 60 * 60 * 24 * 4
	// 	},
	// 	{
	// 		name: 'Mesquite',
	// 		species: 'Prosopis spp.',
	// 		image: 'plant1.JPG',
	// 		waterPeriod: 4,
	// 		lastWatered: new Date().getTime() - 1000 * 60 * 60 * 24 * 5
	// 	}
	// ];
</script>

<div class="flex flex-wrap">
	{#each plants as plant}
		<PlantCard {plant} />
	{/each}
</div>
