<script lang="ts">
	import Button from './ui/button/button.svelte'
	import bluegrad from '$lib/assets/images/bluegrad.png'
	import WaterProgress from './WaterProgress.svelte'

	export let plantWater
	export let daysSinceLastWatered
	export let waterProgressPercent
	export let imageUrl
	export let context
	export let showPlantCare
    export let className
</script>

<div class={`plant-card grid w-full rounded-lg border p-4 ${className}`}>
	<div class="relative">
		<img
			src={imageUrl ? imageUrl : bluegrad}
			alt="placeholder"
			class="mx-auto aspect-square min-h-16 w-full rounded-lg object-cover sm:w-32"
		/>
	</div>
	<div class="flex flex-wrap justify-between gap-4">
		<div>
			<h2 class="text-lg font-bold">{plantWater.plant.species}</h2>
			{#if plantWater.plant.name}<p>{plantWater.plant.name}</p>{/if}
			{#if plantWater.watering_event?.timestamp}
                <p class="text-sm opacity-60">
					{daysSinceLastWatered} day{daysSinceLastWatered === 1 ? '' : 's'} since last water
				</p>
            {/if}
        </div>
            <div class="flex justify-start gap-4">
                <div class="flex flex-col items-center justify-start">
                    <p class="water-label">Water</p>
                    <WaterProgress progress={waterProgressPercent} />
                </div>
            </div>
	</div>
    <div class="flex flex-wrap flex-row items-center gap-4 col-span-2">
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
    </div>
</div>

<style>
	.plant-card {
        grid-template-columns: 8rem minmax(0, 1fr);
        gap: 1rem;
		justify-content: center;
	}

	.progress-ring {
		--size: 2rem;
	}
</style>