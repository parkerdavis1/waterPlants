<script lang="ts">
	import ImageUploader from 'src/lib/components/ImageUploader.svelte';
	import PlantCard from 'src/lib/components/PlantCard.svelte';
	import Spinner from 'src/lib/components/Spinner.svelte';
	import Button from 'src/lib/components/ui/button/button.svelte';
	import { Input } from 'src/lib/components/ui/input';
	import { Label } from 'src/lib/components/ui/label';
	import * as Select from 'src/lib/components/ui/select';
	import Separator from 'src/lib/components/ui/separator/separator.svelte';
	import Textarea from 'src/lib/components/ui/textarea/textarea.svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import * as AlertDialog from 'src/lib/components/ui/alert-dialog';

	export let data;

	$: plantCardData = {
		plant: data.plant,
		watering_event: data.wateringEvents[0]
	};

	let isSubmitting = false;

	const { form, enhance, constraints, errors } = superForm(data.form, {
		id: 'edit-plant',
		invalidateAll: 'force',
		onSubmit: () => (isSubmitting = true),
		onResult: ({ result }) => {
			isSubmitting = false;
			if (result.type === 'success') {
				toast.success(`Edited plant`);
			} else {
				toast.error('Error editing plant');
			}
		}
	});

	$: selectedRoom = {
		label: data.rooms.find((obj) => obj.id === $form.room_id).name,
		value: $form.room_id
	};

	function handleSelectedChange(v) {
		v && ($form.room_id = v.value);
	}

	let deleteForm: HTMLFormElement;
</script>

<h1 class="text-2xl font-bold">Edit Plant</h1>
<PlantCard plantWater={plantCardData} {data} context="edit" />

<Separator class="my-8" />

<form id="edit-plant" use:enhance method="POST" action="?/editPlant" enctype="multipart/form-data">
	<!-- TODO: add client image resizing -->

	<Label for="image">New Image</Label>
	<div class="self-start">
		<ImageUploader {form} {constraints} />
	</div>
	{#if $errors.image}<p class="text-red-500">{$errors.image}</p>{/if}

	<Label for="species">Species</Label>
	<Input
		type="text"
		name="species"
		autocomplete="off"
		bind:value={$form.species}
		{...$constraints.species}
	/>
	{#if $errors.species}<p class="text-red-500">{$errors.species}</p>{/if}

	<Label for="name">Name</Label>
	<Input
		type="text"
		name="name"
		autocomplete="off"
		bind:value={$form.name}
		{...$constraints.name}
	/>
	{#if $errors.name}<p class="text-red-500">{$errors.name}</p>{/if}

	<!-- TODO: Add Care notes textarea field -->

	<Label for="care">Notes on care</Label>
	<Textarea name="care" autocomplete="off" bind:value={$form.care} {...$constraints.care} />
	{#if $errors.care}<p class="text-red-500">{$errors.care}</p>{/if}

	<!-- TODO: Add new room option to side of select -->
	<Label for="room">Room</Label>
	<Select.Root selected={selectedRoom} onSelectedChange={handleSelectedChange}>
		<Select.Trigger class="w-[180px]">
			<Select.Value placeholder="Select a room" />
		</Select.Trigger>
		<Select.Content>
			{#each data.rooms as room}
				<Select.Item value={room.id} label={room.name}>{room.name}</Select.Item>
			{/each}
		</Select.Content>
		<Select.Input name="room_id" bind:value={$form.room_id} />
	</Select.Root>
	{#if $errors.room_id}<p class="text-red-500">{$errors.room_id}</p>{/if}

	<Label for="water_schedule">Watering Schedule (Every __ days)</Label>
	<Input
		type="number"
		bind:value={$form.water_schedule}
		name="water_schedule"
		{...$constraints.water_schedule}
	/>
	{#if $errors.water_schedule}<p class="text-red-500">{$errors.water_schedule}</p>{/if}

	<Input type="hidden" value={data.plant.id} name="id" />

	<!-- <Button type="submit" bind:disabled={isSubmitting}>Save</Button> -->
	<div class="mt-4 flex justify-between">
		<Button form="edit-plant" type="submit" bind:disabled={isSubmitting}
			>Save
			{#if isSubmitting}
				<Spinner className="w-4 h-4 ml-4" />
			{/if}
		</Button>
		<AlertDialog.Root>
			<AlertDialog.Trigger asChild let:builder>
				<Button builders={[builder]} variant="destructive">Delete Plant</Button>
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Are you sure?</AlertDialog.Title>
					<AlertDialog.Description>
						This action cannot be undone. This will permanently delete this plant.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action on:click={() => deleteForm.submit()}>Continue</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
		<!-- <Button on:click={handleDelete} type="submit" variant="destructive">Delete plant</Button> -->
	</div>
</form>

<form id="delete-plant" method="post" action="?/deletePlant" bind:this={deleteForm}>
	<input type="hidden" value={data.plant.id} name="id" />
</form>
