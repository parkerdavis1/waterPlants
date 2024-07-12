<script lang="ts">
	import bluegrad from '$lib/assets/images/bluegrad.png';
	import '@shoelace-style/shoelace/dist/themes/light.css';
	import RadialProgress from './RadialProgress.svelte';

	export let data;
	export let plantWater;

	$: daysSinceLastWatered = plantWater.watering_event
		? Math.round(
				(new Date().getTime() - new Date(plantWater.watering_event?.timestamp).getTime()) /
					(1000 * 60 * 60 * 24)
			)
		: 0;

	const waterPeriod = plantWater.plant.water_schedule;

	$: waterProgressPercent = (daysSinceLastWatered / waterPeriod) * 100;

	const url = `/${plantWater.plant.id}`;
	const imageUrl = plantWater.plant.image_url;
</script>

<div class="plant-card w-full">
	<a href={url}>
		<img
			src={imageUrl ? imageUrl : bluegrad}
			alt="placeholder"
			class="aspect-square w-32 rounded-lg object-cover"
		/>
	</a>
	<div class="grid grid-cols-2 gap-4">
		<div>
			<h2 class="text-lg font-bold"><a href={url}>{plantWater.plant.name}</a></h2>
			{#if plantWater.plant.species}<p>{plantWater.plant.species}</p>{/if}
			<p class="text-sm opacity-60">Days since last watered: {daysSinceLastWatered}</p>
		</div>
		<div class="flex gap-4">
			<div class="flex flex-col items-center justify-start">
				<p>Water</p>
				<RadialProgress progress={waterProgressPercent} />
			</div>
			<div class="flex flex-col items-center justify-start">
				<p>Fertilized</p>
				<RadialProgress progress={waterProgressPercent} />
				<!-- <div class="radial-progress" style="--value:70;" role="progressbar">70%</div> -->
			</div>
		</div>
	</div>
</div>

<style>
	.plant-card {
		display: grid;
		grid-template-columns: 8rem minmax(0, 1fr);
		gap: 1rem;
	}

	.progress-ring {
		--size: 2rem;
	}
</style>
