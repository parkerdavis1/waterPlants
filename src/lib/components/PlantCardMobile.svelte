<script lang="ts">
	import Button from './ui/button/button.svelte'
	import bluegrad from '$lib/assets/images/bluegrad.png'
	import WaterProgress from './WaterProgress.svelte'
	import { checkedObj } from '../stores/selectedPlants.svelte'
	import { Checkbox } from '$lib/components/ui/checkbox/index.js'
	import WaterProgress2 from './WaterProgress2.svelte'

	export let plantWater
	export let daysSinceLastWatered
	export let waterProgressPercent
	export let imageUrl
	export let context
	export let showPlantCare
	export let className

	console.log('context in plantcardmobile:', context)
</script>

<div
	class={`plant-card grid w-full rounded-lg border p-4 ${className} ${$checkedObj[plantWater.plant.id] ? 'bg-blue-100' : ''}`}
>
	{#if context === 'list'}
		<!-- <input type="checkbox" bind:checked={$checkedObj[plantWater.plant.id]} /> -->
		<Checkbox bind:checked={$checkedObj[plantWater.plant.id]} class="h-8 w-8 self-center" />
	{:else}
		<span></span>
	{/if}
	<div class="relative">
		<a href={`${plantWater.plant.id}`}>
			<img
				src={imageUrl ? imageUrl : bluegrad}
				alt="placeholder"
				class={`mx-auto aspect-square ${context === 'list' ? 'max-h-32' : ''} min-h-16 w-full rounded-lg object-cover sm:w-32`}
			/>
		</a>
	</div>
	<div class="flex justify-between gap-4">
		<div>
			<a href={`${plantWater.plant.id}`}>
				<h2 class="name-wrap text-lg font-bold">{plantWater.plant.species}</h2>
			</a>
			{#if plantWater.plant.name}<p>{plantWater.plant.name}</p>{/if}
			{#if plantWater.watering_event?.timestamp}
				<p class="text-sm opacity-60">
					{daysSinceLastWatered} day{daysSinceLastWatered === 1 ? '' : 's'} since last water
				</p>
			{/if}
		</div>
		<div class="flex justify-end gap-4">
			<div class="flex flex-col items-center justify-start">
				<p class="water-label">Water</p>
				<a href={`${plantWater.plant.id}`}>
					<!-- <WaterProgress progress={waterProgressPercent} /> -->
					<WaterProgress2 fillPercentage={waterProgressPercent} />
				</a>
			</div>
		</div>
	</div>
	<!-- <div class="flex flex-wrap flex-row items-center gap-4 col-span-2">
        {#if context !== 'edit'}
            <a href={`/edit/${plantWater.plant.id}`} class="text-primary">
                <Button>Edit Plant</Button>
            </a>
        {/if}
        {#if context !== 'event'}
            <a href={`/event/${plantWater.plant.id}`}>
                <Button>Water Plant</Button>
            </a>
        {/if}
    </div> -->
</div>

<style>
	.plant-card {
		grid-template-columns: auto 8rem minmax(0, 1fr);
		gap: 1rem;
		justify-content: center;
	}

	.progress-ring {
		--size: 2rem;
	}

	@media (max-width: 450px) {
		.plant-card {
			grid-template-columns: 1fr;
		}
	}
</style>
