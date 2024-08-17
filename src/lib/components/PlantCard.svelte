<script lang="ts">
	import bluegrad from '$lib/assets/images/bluegrad.png'
	import '@shoelace-style/shoelace/dist/themes/light.css'
	import RadialProgress from './RadialProgress.svelte'
	import WaterProgress from './WaterProgress.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import { Button } from './ui/button'
	import PlantCardMobile from './PlantCardMobile.svelte'

	export let data
	export let plantWater
	export let context = 'default'

	let showPlantCare = false

	$: lastWateringEventTimestamp = plantWater.watering_event?.timestamp

	$: daysSinceLastWatered = Math.round(
		(new Date().getTime() - new Date(lastWateringEventTimestamp).getTime()) / (1000 * 60 * 60 * 24),
	)

	const waterPeriod = plantWater.plant.water_schedule

	$: waterProgressPercent = lastWateringEventTimestamp
		? 100 - (daysSinceLastWatered / waterPeriod) * 100
		: 0

	const url = `/event/${plantWater.plant.id}`
	const imageUrl = plantWater.plant.image_url
</script>

<PlantCardMobile
	{plantWater}
	{daysSinceLastWatered}
	{waterProgressPercent}
	{imageUrl}
	{context}
	{showPlantCare}
	className="sm:hidden"
/>

<div class="plant-card hidden w-fit rounded-lg border p-4 sm:block sm:w-full">
	<div class="relative">
		<img
			src={imageUrl ? imageUrl : bluegrad}
			alt="placeholder"
			class="mx-auto aspect-square min-h-16 w-full rounded-lg object-cover sm:w-32"
		/>
		<!-- <div class="absolute bottom-4 right-4 sm:hidden">
				<WaterProgress progress={waterProgressPercent} />
			</div> -->
	</div>
	<div class="flex flex-wrap justify-between gap-4">
		<div>
			<h2 class="text-lg font-bold">{plantWater.plant.species}</h2>
			{#if plantWater.plant.name}<p>{plantWater.plant.name}</p>{/if}
			{#if plantWater.watering_event?.timestamp}<p class="text-sm opacity-60">
					{daysSinceLastWatered} day{daysSinceLastWatered === 1 ? '' : 's'} since last water
				</p>{/if}
			<!-- <Button variant="secondary" on:click={() => (showPlantCare = !showPlantCare)}
					>Plant Care Info</Button
				> -->

			<!-- {#if context !== 'edit'}<a href={`/edit/${plantWater.plant.id}`} class="text-primary"
						><Button>Edit Plant</Button></a
					>{/if}
				{#if context !== 'event'}<a href={`/event/${plantWater.plant.id}`}
						><Button>Water Plant</Button></a
					>{/if} -->
		</div>
		<div class="flex justify-start gap-4">
			<div class="flex flex-col items-center justify-start">
				<p class="water-label">Water</p>
				<!-- <RadialProgress progress={waterProgressPercent} /> -->
				<!-- <div class="hidden sm:inline"> -->
				<WaterProgress progress={waterProgressPercent} />
				<!-- </div> -->
			</div>
			<!-- <div class="flex flex-col items-center justify-start">
					<p>Fertilized</p>
					<RadialProgress progress={waterProgressPercent} />
				</div> -->
		</div>
	</div>
	{#if showPlantCare}
		<div class="col-span-2">Plant Care INFO</div>
	{/if}
</div>

<style>
	.plant-card {
		/* display: grid; */
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
