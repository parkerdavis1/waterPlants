<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Button } from 'src/lib/components/ui/button';
	import { Checkbox } from 'src/lib/components/ui/checkbox/index';
	import { Input } from 'src/lib/components/ui/input/index';
	import { Label } from 'src/lib/components/ui/label/index';
	import { Textarea } from 'src/lib/components/ui/textarea/index';
	import { waterPlantSchema } from 'src/lib/formSchemas/waterPlantSchema';
	import { toast } from 'svelte-sonner';
	import SuperDebug, { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import PlantCard from 'src/lib/components/PlantCard.svelte';
	import ImageUploader from 'src/lib/components/ImageUploader.svelte';
	import Spinner from 'src/lib/components/Spinner.svelte';
	import Separator from 'src/lib/components/ui/separator/separator.svelte';

	export let data;

	let isSubmitting = false;

	const { form, enhance, errors, message, constraints } = superForm(data.form, {
		onSubmit: () => (isSubmitting = true),
		onResult: ({ result }) => {
			isSubmitting = false;
			if (result.type === 'success') {
				toast.success(`Successfully watered ${data.plant.name}!`);
			}
		}
	});

	const file = fileProxy(form, 'image');

	const formId = 'waterForm' + data.plant.id;

	// function handleSaveChanges() {
	// 	console.log('Saving changes');
	// 	toast.success('Watered plant!', {
	// 		description: 'Did it',
	// 		action: {
	// 			label: 'Undo',
	// 			onClick: () => console.info('Undo')
	// 		}
	// 	});
	// 	invalidateAll();
	// }

	$: plantCardData = {
		plant: data.plant,
		watering_event: data.wateringEvents[0]
	};
</script>

<div class="mt-8 flex max-w-4xl flex-col gap-4">
	<h1 class="text-3xl font-bold">Watering</h1>
	<!-- <SuperDebug data={form} /> -->
	<PlantCard plantWater={plantCardData} {data} context="event" />
	<h2 class="text-xl font-bold">Plant Care Info</h2>
	<div class="whitespace-pre-wrap">
		{data.plant.care}
	</div>
	<Separator />
	<h2 class="text-xl font-bold">Water Event</h2>
	<form
		enctype="multipart/form-data"
		action="?/water"
		method="POST"
		id={formId}
		class="flex flex-col gap-8"
		use:enhance
	>
		<div class="self-start">
			<Label for="image">Image</Label>
			<ImageUploader {form} {constraints} />
			<!-- <Input type="file" name="image" accept="image/*" bind:files={$file} {...$constraints.image} /> -->
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
		<!-- <div class="flex items-center space-x-2">
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
		</div> -->
		<Input type="hidden" name="plant_id" value={data.plant.id} />
		<Input type="hidden" name="user_id" value={1} />
		<Button form={formId} type="submit" bind:disabled={isSubmitting}
			>Water
			{#if isSubmitting}
				<Spinner className="w-4 h-4 ml-4" />
			{/if}
		</Button>
	</form>
	<!-- <Separator />
	<h2 class="text-xl font-bold">Past Watering Events</h2>
	{#each data.wateringEvents as wateringEvent}
		<pre class="text-xs opacity-50">{JSON.stringify(wateringEvent, null, 2)}</pre>
		<p>{wateringEvent.timestamp}</p>
		<p>{wateringEvent}</p>
	{/each} -->
</div>
