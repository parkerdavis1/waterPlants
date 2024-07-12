<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { AspectRatio } from './ui/aspect-ratio';
	import { Label } from './ui/label';
	import { Progress } from './ui/progress';
	import bluegrad from '$lib/assets/images/bluegrad.png';
	import WaterPlantDialog from './WaterPlantDialog.svelte';
	import { type PlantWateringEventJoin } from 'src/db/schema';
	import { onMount } from 'svelte';
	import '@shoelace-style/shoelace/dist/themes/light.css';
	import RadialProgress from './RadialProgress.svelte';

	export let data;
	export let plantWater;
	console.log('plantWater', plantWater);

	$: daysSinceLastWatered = plantWater.watering_event
		? Math.round(
				(new Date().getTime() - new Date(plantWater.watering_event?.timestamp).getTime()) /
					(1000 * 60 * 60 * 24)
			)
		: 0;
	// const daysSinceLastWatered = $derived(
	// 	Math.round(
	// 		(new Date().getTime() - new Date(plantWater.watering_event.timestamp).getTime()) /
	// 			(1000 * 60 * 60 * 24)
	// 	)
	// );
	const waterPeriod = plantWater.plant.water_schedule;

	// let waterProgressPercent = $derived((daysSinceLastWatered / waterPeriod) * 100);
	$: waterProgressPercent = (daysSinceLastWatered / waterPeriod) * 100;

	const url = `/${plantWater.plant.id}`;
</script>

<div class="plant-card w-full">
	<a href={url}>
		<img src={bluegrad} alt="placeholder" class="w-32 rounded-lg object-cover" />
	</a>
	<div class="grid grid-cols-2 gap-4">
		<div>
			<h2 class="text-lg font-bold"><a href={url}>{plantWater.plant.name}</a></h2>
			<p>{plantWater.plant.species}</p>
			<p>Days since last watered: {daysSinceLastWatered}</p>
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

<!-- <Card.Root class="w-[350px]">
	<Card.Header>
		<AspectRatio class="overflow-hidden">
			<img src={bluegrad} alt="placeholder" class="rounded-lg object-cover" />
		</AspectRatio>
		<Card.Title>{plantWater.plant.name}</Card.Title>
		<Card.Description>{plantWater.plant.species}</Card.Description>
	</Card.Header>
	<Card.Content>
		<Label for="progress">Days since last watered: {daysSinceLastWatered}</Label>
		<Progress value={daysSinceLastWatered} max={plantWater.plant.water_schedule || 0} id="progress"
		></Progress>
	</Card.Content>
	<Card.Footer>
		<WaterPlantDialog plant={plantWater.plant} {data} />
	</Card.Footer>
</Card.Root> -->

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
