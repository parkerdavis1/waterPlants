<script lang="ts">
	import bluegrad from '$lib/assets/images/bluegrad.png'
	import WaterProgress2 from './WaterProgress2.svelte'
	import PlantCardMobile from './PlantCardMobile.svelte'
	import { checkedObj } from '../stores/selectedPlants.svelte'
	import { Checkbox } from '$lib/components/ui/checkbox/index.js'
	import { DAY_MILLISECONDS } from '../utils/constants'

	// export let data
	// export let plantWater
	// export let context = 'default'

	let { data, plantWater, context = 'default' } = $props()

	let showPlantCare = $state(false)

	let lastWateringEventTimestamp = $derived(plantWater.watering_event?.timestamp)

	let millisectionsSinceLastWatered = $derived(
		new Date().getTime() - new Date(lastWateringEventTimestamp).getTime(),
	)

	let daysSinceLastWatered = $derived(Math.round(millisectionsSinceLastWatered / DAY_MILLISECONDS))

	let waterPeriod = $derived(plantWater.plant.water_schedule)

	let waterProgressPercent = $derived(
		lastWateringEventTimestamp
			? 100 - (millisectionsSinceLastWatered / (waterPeriod * DAY_MILLISECONDS)) * 100
			: 0,
	)

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
	class={`plant-card hidden w-fit rounded-lg  p-4 sm:block sm:w-full ${$checkedObj[plantWater.plant.id] ? 'bg-blue-100' : ''}`}
>
	{#if context === 'list'}
		<!-- <input type="checkbox" bind:checked={$checkedObj[plantWater.plant.id]} /> -->
		<Checkbox
			bind:checked={$checkedObj[plantWater.plant.id]}
			class="size-6 self-center rounded-full"
		/>
	{:else}
		<span></span>
	{/if}

	<div class="relative">
		<a href={`${plantWater.plant.id}`}>
			<img
				src={imageUrl ? imageUrl : bluegrad}
				alt="placeholder"
				class="click mx-auto aspect-square min-h-16 w-full rounded-lg object-cover sm:w-32"
			/>
		</a>
	</div>
	<div class="flex justify-between gap-4">
		<div>
			<h2 class="name-wrap click text-lg font-bold">
				<a href={`${plantWater.plant.id}`}>
					{plantWater.plant.species}
				</a>
			</h2>
			{#if plantWater.plant.name}<p>{plantWater.plant.name}</p>{/if}
			{#if plantWater.watering_event?.timestamp}<p class="text-sm opacity-60">
					{daysSinceLastWatered} day{daysSinceLastWatered === 1 ? '' : 's'} since last water
				</p>{/if}
		</div>
		<div class="flex justify-start gap-4">
			<div class="flex flex-col items-center justify-start">
				<p class="water-label">Water</p>
				<a href={`${plantWater.plant.id}`} class="click">
					<WaterProgress2 fillPercentage={waterProgressPercent} />
				</a>
			</div>
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
