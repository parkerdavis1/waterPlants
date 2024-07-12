<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { fileProxy, superForm, superValidate } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';
	import * as Select from '$lib/components/ui/select/index';
	import { faker } from '@faker-js/faker';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import ImageUploader from '../ImageUploader.svelte';
	import Spinner from '../Spinner.svelte';

	export let data;

	const { form, enhance, constraints, errors } = superForm(data.newPlantForm, {
		onSubmit: () => (isSubmitting = true),
		onResult: ({ result }) => {
			isSubmitting = false;
			if (result.type === 'success') {
				toast.success('Created new plant');
				dialogOpen = false;
			} else {
				toast.error('Error creating plant');
			}
		}
	});

	let dialogOpen = false;
	let isSubmitting = false;

	const defaultName = faker.person.firstName();

	// Selected Room Memory
	let selectedRoomId = 1;
	$form.room_id = selectedRoomId;

	$: {
		if (browser) {
			const num = localStorage.getItem('selectedRoom');
			console.log('num', num);
			if (num) selectedRoomId = parseInt(num);
			console.log('selectedRoomId', selectedRoomId);
		}
	}

	$: selectedRoom = {
		label: data.rooms.find((obj) => obj.id === selectedRoomId).name,
		value: selectedRoomId
	};

	function handleSelectedChange(v) {
		v && ($form.room_id = v.value);
		selectedRoomId = $form.room_id;
		localStorage.setItem('selectedRoom', $form.room_id);
	}
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger>
		<Button variant="outline">Add new plant</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Title>Add New Plant</Dialog.Title>
		<!-- <Dialog.Description>Add a friendly new plant.</Dialog.Description> -->
		<SuperDebug data={form} />
		<form
			id="new-plant"
			use:enhance
			method="POST"
			action="?/newPlant"
			enctype="multipart/form-data"
		>
			<Label for="name">Name</Label>
			<Input
				type="text"
				name="name"
				autocomplete="off"
				bind:value={$form.name}
				{...$constraints.name}
				placeholder={defaultName}
			/>
			{#if $errors.name}<p class="text-red-500">{$errors.name}</p>{/if}

			<Label for="species">Species</Label>
			<Input
				type="text"
				name="species"
				autocomplete="off"
				bind:value={$form.species}
				{...$constraints.species}
			/>
			{#if $errors.species}<p class="text-red-500">{$errors.species}</p>{/if}

			<!-- TODO: add client image resizing -->
			<!-- TODO: show preview image when image selected -->
			<!-- TODO: generally make image component more appealing -->
			<Label for="image">Image</Label>
			<ImageUploader {form} {constraints} />
			<!-- <Input type="file" name="image" accept="image/*" bind:files={$file} {...$constraints.image} /> -->
			{#if $errors.image}<p class="text-red-500">{$errors.image}</p>{/if}

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

			<Label for="water_schedule">Watering Schedule (days)</Label>
			<Input
				type="number"
				bind:value={$form.water_schedule}
				name="water_schedule"
				{...$constraints.water_schedule}
			/>
			{#if $errors.water_schedule}<p class="text-red-500">{$errors.water_schedule}</p>{/if}
		</form>

		<Dialog.Footer>
			<Button form="new-plant" type="submit" bind:disabled={isSubmitting}
				>Submit
				{#if isSubmitting}
					<Spinner className="w-4 h-4 ml-4" />
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
