<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { AspectRatio } from './ui/aspect-ratio';
	import { Label } from './ui/label';
	import { Progress } from './ui/progress';
	import { Textarea } from './ui/textarea';

	import bluegrad from '$lib/assets/images/bluegrad.png';

	interface Plant {
		name: string;
		species: string;
		image: string;
		waterPeriod: number;
		lastWatered: number;
	}
	let { plant }: { plant: Plant } = $props();
	let daysSinceLastWatered = $derived(
		Math.round((new Date().getTime() - plant.lastWatered) / (1000 * 60 * 60 * 24))
	);

	let dialogOpen = $state(false);

	function handleSaveChanges() {
		dialogOpen = false;
	}

	function randomProgress(max: number) {
		return Math.floor(Math.random() * max);
	}
</script>

<Card.Root class="m-4 w-[350px]">
	<Card.Header>
		<AspectRatio class="overflow-hidden">
			<img
				src={plant.image ? `/src/lib/assets/images/${plant.image}` : bluegrad}
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
		<Dialog.Root bind:open={dialogOpen}>
			<Dialog.Trigger>
				<Button variant="default">Water</Button>
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-[425px]">
				<Dialog.Header>
					<Dialog.Title>
						Water {plant.name}
					</Dialog.Title>
					<Dialog.Description>Water plant, add any notes or photos if wanted.</Dialog.Description>
				</Dialog.Header>
				<div class="grid w-full gap-1.5">
					<Label for="message">Notes</Label>
					<Textarea placeholder="Type your message here." id="message" />
				</div>
				<Dialog.Footer>
					<Button type="submit" on:click={handleSaveChanges}>Save changes</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</Card.Footer>
</Card.Root>
