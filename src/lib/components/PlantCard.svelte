<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { AspectRatio } from './ui/aspect-ratio';
	import { Label } from './ui/label';
	import { Progress } from './ui/progress';
	import { Textarea } from './ui/textarea';
	import { toast } from 'svelte-sonner';
	import bluegrad from '$lib/assets/images/bluegrad.png';
	import WaterPlantDialog from './WaterPlantDialog.svelte';

	let { plant, data } = $props();
	// let daysSinceLastWatered = $derived(
	// 	Math.round((new Date().getTime() - plant.lastWatered) / (1000 * 60 * 60 * 24))
	// );
	let daysSinceLastWatered = 4;
</script>

<Card.Root class="m-4 w-[350px]">
	<Card.Header>
		<AspectRatio class="overflow-hidden">
			<img
				src={plant.has_image ? `/api/plant/${plant.id}` : bluegrad}
				alt="placeholder"
				class="rounded-lg object-cover"
			/>
		</AspectRatio>
		<Card.Title>{plant.name}</Card.Title>
		<Card.Description>{plant.species}</Card.Description>
	</Card.Header>
	<Card.Content>
		<Label for="progress">Days since last watered: {daysSinceLastWatered}</Label>
		<Progress value={daysSinceLastWatered} max={plant.waterPeriod} id="progress"></Progress>
	</Card.Content>
	<Card.Footer>
		<WaterPlantDialog {plant} {data} />
	</Card.Footer>
</Card.Root>
