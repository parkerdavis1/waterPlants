<script lang="ts">
	import bluegrad from '$lib/assets/images/bluegrad.png';
	import '@shoelace-style/shoelace/dist/themes/light.css';
	import RadialProgress from './RadialProgress.svelte';
	import WaterProgress from './WaterProgress.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Button } from './ui/button';

	export let data;
	export let plantWater;
	export let context = 'default';

	let showPlantCare = false;

	$: daysSinceLastWatered = plantWater.watering_event
		? Math.round(
				(new Date().getTime() - new Date(plantWater.watering_event?.timestamp).getTime()) /
					(1000 * 60 * 60 * 24)
			)
		: 0;

	const waterPeriod = plantWater.plant.water_schedule;

	$: waterProgressPercent = 100 - (daysSinceLastWatered / waterPeriod) * 100;

	const url = `/event/${plantWater.plant.id}`;
	const imageUrl = plantWater.plant.image_url;
</script>

<div class="plant-card w-full rounded-lg border p-4">
	<div class="relative">
		<img
			src={imageUrl ? imageUrl : bluegrad}
			alt="placeholder"
			class="aspect-square min-h-32 rounded-lg object-cover sm:w-32"
		/>
		<div class="absolute bottom-4 right-4 sm:hidden">
			<WaterProgress progress={waterProgressPercent} />
		</div>
	</div>
	<div class="flex-wrap justify-between gap-4 sm:flex sm:flex-row-reverse">
		<div class="flex justify-start gap-4">
			<div class="flex flex-col items-center justify-start">
				<p class="water-label">Water</p>
				<!-- <RadialProgress progress={waterProgressPercent} /> -->
				<div class="hidden sm:inline">
					<WaterProgress progress={waterProgressPercent} />
				</div>
			</div>
			<!-- <div class="flex flex-col items-center justify-start">
				<p>Fertilized</p>
				<RadialProgress progress={waterProgressPercent} />
			</div> -->
		</div>
		<div>
			<h2 class="text-lg font-bold">{plantWater.plant.species}</h2>
			{#if plantWater.plant.name}<p>{plantWater.plant.name}</p>{/if}
			<p class="text-sm opacity-60">Days since last watered: {daysSinceLastWatered}</p>
			<!-- <Button variant="secondary" on:click={() => (showPlantCare = !showPlantCare)}
				>Plant Care Info</Button
			> -->

			{#if context !== 'edit'}<a href={`/edit/${plantWater.plant.id}`} class="text-primary"
					><Button>Edit Plant</Button></a
				>{/if}
			{#if context !== 'event'}<a href={`/event/${plantWater.plant.id}`}
					><Button>Water Plant</Button></a
				>{/if}
		</div>
	</div>
	{#if showPlantCare}
		<div class="col-span-2">Plant Care INFO</div>
	{/if}
</div>

<style>
	.plant-card {
		display: grid;
		justify-content: center;
	}
	.water-label {
		display: none;
	}
	@media (min-width: 640px) {
		.plant-card {
			display: grid;
			grid-template-columns: 8rem minmax(0, 1fr);
			gap: 1rem;
		}
		.water-label {
			display: block;
		}
	}

	.progress-ring {
		--size: 2rem;
	}
</style>
