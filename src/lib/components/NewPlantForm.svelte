<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte'
	import * as Dialog from '$lib/components/ui/dialog'
	import * as Form from '$lib/components/ui/form'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import { fileProxy, superForm, superValidate } from 'sveltekit-superforms'
	import SuperDebug from 'sveltekit-superforms'
	import * as Select from '$lib/components/ui/select/index'
	import { faker } from '@faker-js/faker'
	import { toast } from 'svelte-sonner'
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import ImageUploader from '$lib/components/ImageUploader.svelte'
	import Spinner from '$lib/components/Spinner.svelte'
	import ClaudeImage from '$lib/components/ImageUploader.svelte'
	import { goto } from '$app/navigation'
	import Textarea from './ui/textarea/textarea.svelte'
	import { waterPlantSchema } from '../zodSchemas/plantSchema'
	import { zod } from 'sveltekit-superforms/adapters'

	export let data

	// const superform = superForm(data.newPlantForm, {
	// 	validators: zod(waterPlantSchema),
	// 	onSubmit: () => {
	// 		isSubmitting = true
	// 	},
	// 	onResult: ({ result }) => {
	// 		isSubmitting = false
	// 		console.log('result', result)
	// 		if (result.type === 'success') {
	// 			toast.success('Created new plant')
	// 			dialogOpen = false
	// 		} else {
	// 			toast.error('Error creating plant')
	// 		}
	// 		// goto('/');
	// 	},
	// })
	const superform = superForm(data.newPlantForm, {
		validators: zod(waterPlantSchema),
		onResult: async ({ result }) => {
			if (result.type === 'success') {
				await goto('/')
				toast.success('Created new plant')
			}
		},
	})

	const { form, enhance, constraints, errors } = superform

	let dialogOpen = false
	let isSubmitting = false

	const defaultName = faker.person.firstName()

	// Selected Room Memory
	let selectedRoomId = 1
	$form.room_id = selectedRoomId

	$: {
		if (browser) {
			const num = localStorage.getItem('selectedRoom')
			if (num) selectedRoomId = parseInt(num)
		}
	}

	$: selectedRoom = {
		label: data.rooms.find((obj) => obj.id === selectedRoomId).name,
		value: selectedRoomId,
	}

	function handleSelectedChange(v) {
		v && ($form.room_id = v.value)
		selectedRoomId = $form.room_id
		localStorage.setItem('selectedRoom', $form.room_id)
	}
</script>

<!-- <SuperDebug data={{ $form, $errors }} /> -->
<form id="new-plant" method="POST" action="?/newPlant" enctype="multipart/form-data" use:enhance>
	<Label for="image">Image</Label>
	<ImageUploader {form} />
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

	<Label for="name">Name <span class="text-muted-foreground">(optional)</span></Label>
	<Input
		type="text"
		name="name"
		autocomplete="off"
		bind:value={$form.name}
		{...$constraints.name}
		placeholder={defaultName}
	/>
	{#if $errors.name}<p class="text-red-500">{$errors.name}</p>{/if}

	<!-- TODO: Add Care notes textarea field -->
	<Label for="notes">Care Notes <span class="text-muted-foreground">(optional)</span></Label>
	<Textarea name="notes" placeholder="Add your notes on caring for the plant here."></Textarea>

	<!-- TODO: Add new room option to side of select -->
	<Label for="room">Room</Label>
	<Select.Root selected={selectedRoom} onSelectedChange={handleSelectedChange}>
		<Select.Trigger class="w-[180px]">
			<Select.Value placeholder="Select a room" />
		</Select.Trigger>
		<Select.Content>
			{#each data.rooms as room}(room.id)
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
