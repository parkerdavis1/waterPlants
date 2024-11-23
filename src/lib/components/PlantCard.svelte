<script lang="ts">
	import bluegrad from '$lib/assets/images/bluegrad.png'
	import RadialProgress from './RadialProgress.svelte'
	import WaterProgress from './WaterProgress.svelte'
	import WaterProgress2 from './WaterProgress2.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import { Button } from './ui/button'
	import PlantCardMobile from './PlantCardMobile.svelte'
	import { checkedObj } from '../stores/selectedPlants.svelte'
	import { Checkbox } from '$lib/components/ui/checkbox/index.js'

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

<div
	class={`plant-card hidden w-fit rounded-lg border p-4 sm:block sm:w-full ${$checkedObj[plantWater.plant.id] ? 'bg-blue-100' : ''}`}
>
	{#if context === 'list'}
		<!-- <input type="checkbox" bind:checked={$checkedObj[plantWater.plant.id]} /> -->
		<Checkbox bind:checked={$checkedObj[plantWater.plant.id]} class="self-center" />
	{:else}
		<span></span>
	{/if}

	<div class="relative">
		<a href={`${plantWater.plant.id}`}>
			<img
				src={imageUrl ? imageUrl : bluegrad}
				alt="placeholder"
				class="mx-auto aspect-square min-h-16 w-full rounded-lg object-cover sm:w-32"
			/>
		</a>
		<!-- <div class="absolute bottom-4 right-4 sm:hidden">
				<WaterProgress progress={waterProgressPercent} />
			</div> -->
	</div>
	<div class="flex justify-between gap-4">
		<div>
			<a href={`${plantWater.plant.id}`}>
				<h2 class="name-wrap text-lg font-bold">{plantWater.plant.species}</h2>
			</a>
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
				<a href={`${plantWater.plant.id}`}>
					<!-- <WaterProgress progress={waterProgressPercent} /> -->
					<WaterProgress2 fillPercentage={waterProgressPercent} />
					<!-- </div> -->
				</a>
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
			grid-template-columns: auto 8rem minmax(0, 1fr);
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
