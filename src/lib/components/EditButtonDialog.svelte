<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Separator } from './ui/separator'
	import ImageUploader from 'src/lib/components/ImageUploader.svelte'
	import Spinner from 'src/lib/components/Spinner.svelte'
	import * as Select from 'src/lib/components/ui/select'
	import Textarea from 'src/lib/components/ui/textarea/textarea.svelte'
	import { toast } from 'svelte-sonner'
	import SuperDebug, { superForm } from 'sveltekit-superforms'
	import * as AlertDialog from 'src/lib/components/ui/alert-dialog'
	import { goto } from '$app/navigation'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { editPlantSchema } from '../zodSchemas/plantSchema'
	// import { enhance as svelteEnhance } from '$app/forms'

	// export let data
	let { data } = $props()

	let isSubmitting = $state(false)

	const { form, enhance, constraints, errors } = superForm(data.editForm, {
		// id: 'edit-plant',
		invalidateAll: 'force',
		onSubmit: () => {
			// Could upload files from here
			isSubmitting = true
		},
		onResult: async ({ result }) => {
			isSubmitting = false
			if (result.type === 'success') {
				await goto('/')
				toast.success(`Edited plant`)
			} else {
				toast.error('Error editing plant')
			}
		},
	})

	const { form: deleteForm2, enhance: deleteEnhance } = superForm(data.deletePlant, {
		id: 'delete-plant',
		invalidateAll: 'force',
		onResult: async ({ result }) => {
			if (result.type === 'success') {
				await goto('/')
				toast.success(`Deleted plant`)
			} else {
				toast.error('Error deleting plant')
			}
		} 
	})

	interface Room {
		id: number
		created_at: number
		house_id: number
		name: string
	}

	// let selectedRoom = $derived({
	// 	label: data.rooms.find((obj: Room) => obj.id === $form.room_id).name,
	// 	value: $form.room_id,
	// })

	let selectedRoom = $state('')

	// function handleSelectedChange(v) {
	// 	v && ($form.room_id = v.value)
	// }

	console.log('data.rooms', data.rooms)
	const triggerContent = $derived(
		data.rooms.find((room) => room.id === $form.room_id)?.name ?? 'Select a room',
	)

	let deleteForm: HTMLFormElement
	let deleteOpen = $state(false)

	function handleDelete() {
		deleteOpen = true
	}
</script>

<Dialog.Root>
	<Dialog.Trigger class={`w-full ${buttonVariants({ variant: 'outline' })}`}>
		✍️ Edit
	</Dialog.Trigger>
	<Dialog.Content class="max-h-full overflow-scroll">
		<Dialog.Header>
			<Dialog.Title>Edit {data.plant.species}</Dialog.Title>
			<!-- <Dialog.Description>
				Make changes to your profile here. Click save when you're done.
				</Dialog.Description> -->
		</Dialog.Header>
		{#if data.plant.image_url}
			<img
				src={data.plant.image_url}
				class="mx-auto aspect-square min-h-16 w-full max-w-60 rounded-lg object-cover"
			/>
		{/if}
		<form
			id="edit-plant"
			use:enhance
			method="POST"
			action="?/editPlant"
			enctype="multipart/form-data"
		>
			<!-- <SuperDebug data={$form} /> -->
			<Label for="image">New Image</Label>
			<div class="self-start">
				<ImageUploader {form} />
			</div>
			<!-- {#if $errors.image}<p class="text-red-500">{$errors.image}</p>{/if} -->

			<Label for="species">Species</Label>
			<Input
				type="text"
				name="species"
				autocomplete="off"
				bind:value={$form.species}
				{...$constraints.species}
			/>
			<!-- {#if $errors.species}<p class="text-red-500">{$errors.species}</p>{/if} -->

			<Label for="name">Name</Label>
			<Input
				type="text"
				name="name"
				autocomplete="off"
				bind:value={$form.name}
				{...$constraints.name}
			/>
			<!-- {#if $errors.name}<p class="text-red-500">{$errors.name}</p>{/if} -->

			<Label for="notes">Notes</Label>
			<Textarea
				name="notes"
				autocomplete="off"
				rows={10}
				bind:value={$form.notes}
				{...$constraints.notes}
			/>
			<!-- {#if $errors.notes}<p class="text-red-500">{$errors.notes}</p>{/if} -->

			<!-- TODO: Add new room option to side of select -->
			<Label for="room">Room</Label>
			<Select.Root bind:value={$form.room_id} type="single">
				<Select.Trigger class="w-[180px]">
					{triggerContent}
					<!-- <Select.Value placeholder="Select a room" /> -->
				</Select.Trigger>
				<Select.Content>
					{#each data.rooms as room (room.id)}
						<Select.Item value={room.id} label={room.name}>{room.name}</Select.Item>
					{/each}
				</Select.Content>
				<input type="hidden" name="room_id" bind:value={$form.room_id} />
			</Select.Root>
			<!-- {#if $errors.room_id}<p class="text-red-500">{$errors.room_id}</p>{/if} -->

			<Label for="water_schedule">Watering Schedule (Every __ days)</Label>
			<Input
				type="number"
				bind:value={$form.water_schedule}
				name="water_schedule"
				{...$constraints.water_schedule}
			/>
			{#if $errors.water_schedule}<p class="text-red-500">{$errors.water_schedule}</p>{/if}

			<Input type="hidden" value={data.plant.id} name="id" />
			<Input type="hidden" value={data.plant.image_url} name="oldImageUrl" />

			<div class="mt-4 flex justify-between gap-4">
				<Button form="edit-plant" type="submit" bind:disabled={isSubmitting} class="w-full"
					>Save
					{#if isSubmitting}
						<Spinner className="w-4 h-4 ml-4" />
					{/if}
				</Button>
				<div>
					<Button variant="destructive" onclick={handleDelete}>Delete</Button>
				</div>
			</div>
		</form>

		<form id="delete-plant" method="post" action="?/deletePlant" bind:this={deleteForm} use:deleteEnhance>
			<input type="hidden" value={data.plant.id} name="id" />
			<input type="hidden" value={data.plant.image_url} name="image_url" />
		</form>
		<!-- <Dialog.Footer>
			<Button type="submit">Save</Button>
		</Dialog.Footer> -->
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={deleteOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete this plant.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => deleteForm.submit()}
				class={buttonVariants({ variant: 'destructive' })}
			>
				Delete Plant
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
