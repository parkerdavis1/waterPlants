<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Button } from 'src/lib/components/ui/button';
	import { Checkbox } from 'src/lib/components/ui/checkbox/index';
	import { Input } from 'src/lib/components/ui/input/index';
	import { Label } from 'src/lib/components/ui/label/index';
	import { Textarea } from 'src/lib/components/ui/textarea/index';
	import { waterPlantSchema } from 'src/lib/formSchemas/waterPlantSchema';
	import { toast } from 'svelte-sonner';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import PlantCard from 'src/lib/components/PlantCard.svelte';

	export let data;

	const { form, enhance, errors, message, constraints } = superForm(data.form);

	const file = fileProxy(form, 'image');

	const formId = 'waterForm' + data.plant.id;

	function handleSaveChanges() {
		console.log('Saving changes');
		toast.success('Watered plant!', {
			description: 'Did it',
			action: {
				label: 'Undo',
				onClick: () => console.info('Undo')
			}
		});
		invalidateAll();
	}

	const plantCardData = {
		plant: data.plant,
		watering_event: data.wateringEvents[0]
	};
</script>

<div class="container mt-8 flex flex-col gap-4">
	<PlantCard plant={plantCardData} {data} />
	<form
		enctype="multipart/form-data"
		action="?/water"
		method="POST"
		id={formId}
		class="flex flex-col gap-8"
		use:enhance
	>
		<div>
			<Label for="image">Image</Label>
			<Input type="file" name="image" accept="image/*" bind:files={$file} {...$constraints.image} />
			{#if $errors.image}<p class="text-red-500">{$errors.image}</p>{/if}
		</div>
		<div>
			<Label for="comments">Notes</Label>
			<Textarea
				placeholder="Type your message here."
				id="comments"
				name="comments"
				bind:value={$form.comments}
				{...$constraints.comments}
			/>
			{#if $errors.comments}<p class="text-red-500">{$errors.comments}</p>{/if}
		</div>
		<div class="flex items-center space-x-2">
			<Checkbox id="fertilized" bind:checked={$form.fertilized} />
			<Input
				type="hidden"
				name="fertilized"
				bind:value={$form.fertilized}
				{...$constraints.fertilized}
			/>
			<Label
				for="fertilized"
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>Fertilized?</Label
			>
			{#if $errors.fertilized}<p class="text-red-500">{$errors.fertilized}</p>{/if}
		</div>
		<Input type="hidden" name="plant_id" value={data.plant.id} />
		<Input type="hidden" name="user_id" value={1} />
		<!-- {#if $message}<p>{$message}</p>{/if} -->
		<Button type="submit">Water</Button>
	</form>

	<!-- <pre class="text-xs text-black/30">
Plant Info:
    {JSON.stringify(plant, null, 2)}
Watering Events: -->
	{#each data.wateringEvents as wateringEvent}
		<p>{wateringEvent.id} - {wateringEvent.comments}</p>
	{/each}
	<!-- </pre> -->
</div>
