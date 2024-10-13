<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import Button from '$lib/components/ui/button/button.svelte'
	import { toast } from 'svelte-sonner'
	import { Textarea } from 'src/lib/components/ui/textarea'
	import { Label } from 'src/lib/components/ui/label'
	import { fileProxy, superForm } from 'sveltekit-superforms'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import { waterPlantSchema } from 'src/lib/zodSchemas/plantSchema'
	import type { SelectPlant } from 'src/db/schema'
	import { Input } from 'src/lib/components/ui/input'
	import { Checkbox } from 'src/lib/components/ui/checkbox'
	import SuperDebug from 'sveltekit-superforms'
	import { invalidateAll } from '$app/navigation'

	const { plant, data }: { plant: SelectPlant; data: any } = $props()
	let dialogOpen = $state(false)

	const { form, enhance, errors, message } = superForm(data.form, {
		validators: zodClient(waterPlantSchema),
		invalidateAll: 'force',
		onResult: () => handleSaveChanges(),
		onError: ({ result }) => console.log(result),
	})

	const file = fileProxy(form, 'image')

	function handleSaveChanges() {
		console.log('Saving changes')
		toast.success('Watered plant!', {
			description: 'Did it',
			action: {
				label: 'Undo',
				onClick: () => console.info('Undo'),
			},
		})
		dialogOpen = false
		invalidateAll()
	}

	const formId = 'waterForm' + plant.id
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger>
		<Button variant="default">Water</Button>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>
				{plant.name}
			</Dialog.Title>
			<Dialog.Description>
				<p>{plant.species}</p>
				<p>Room: {plant.room_id}</p>
			</Dialog.Description>
		</Dialog.Header>
		<!-- <SuperDebug data={$form} /> -->
		<form
			enctype="multipart/form-data"
			action="?/water"
			method="POST"
			id={formId}
			class="flex flex-col gap-8"
			use:enhance
		>
			<div>
				<Label for="notes">Notes</Label>
				<Textarea
					placeholder="Type your message here."
					id="notes"
					name="notes"
					bind:value={$form.notes}
				/>
			</div>
			<div>
				<Input type="file" name="image" accept="image/*" bind:files={$file} />
			</div>
			<div class="flex items-center space-x-2">
				<Checkbox id="fertilized" bind:checked={$form.fertilized} />
				<Input type="hidden" name="fertilized" bind:value={$form.fertilized} />
				<Label
					for="fertilized"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>Fertilized?</Label
				>
			</div>
			<Input type="hidden" name="plant_id" value={plant.id} />
			<!-- <Input type="hidden" name="user_id" value={1} /> -->
			{#if $errors.image}<p class="text-red-500">{$errors.image}</p>{/if}
			{#if $message}<p>{$message}</p>{/if}
		</form>
		<Dialog.Footer>
			<Button type="submit" form={formId}>Save Watering</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
