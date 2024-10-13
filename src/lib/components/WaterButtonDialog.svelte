<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'

	import { Textarea } from 'src/lib/components/ui/textarea/index'
	import { toast } from 'svelte-sonner'
	import SuperDebug, { fileProxy, superForm } from 'sveltekit-superforms'
	import PlantCard from 'src/lib/components/PlantCard.svelte'
	import ImageUploader from 'src/lib/components/ImageUploader.svelte'
	import Spinner from 'src/lib/components/Spinner.svelte'
	import Separator from 'src/lib/components/ui/separator/separator.svelte'
	import { Checkbox } from 'src/lib/components/ui/checkbox/'
	import { currentUserId } from '../stores/user'

	export let data

	let isSubmitting = false
	let dialogOpen = false

	const { form, enhance, errors, message, constraints } = superForm(data.waterForm, {
		onSubmit: () => (isSubmitting = true),
		onResult: ({ result }) => {
			isSubmitting = false
			dialogOpen = false
			if (result.type === 'success') {
				toast.success(`Successfully watered ${data.plant.name}!`)
			}
		},
	})

	const file = fileProxy(form, 'image')

	const formId = 'waterForm' + data.plant.id
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger class={`w-full ${buttonVariants({ variant: 'default' })}`}>
		💧Water
	</Dialog.Trigger>
	<Dialog.Content class="max-h-full overflow-scroll sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Water Event</Dialog.Title>
			<!-- <Dialog.Description>
				Add images, notes, or record a watering/fetilization event
			</Dialog.Description> -->
		</Dialog.Header>
		<form
			enctype="multipart/form-data"
			action="?/water"
			method="POST"
			id={formId}
			class="flex flex-col gap-8"
			use:enhance
		>
			<!-- <SuperDebug data={$form} /> -->
			<div class="self-start">
				<Label for="image"
					>Image <span class="text-xs text-muted-foreground"> (optional)</span></Label
				>
				<ImageUploader {form} {constraints} />
				<!-- <Input type="file" name="image" accept="image/*" bind:files={$file} {...$constraints.image} /> -->
				{#if $errors.image}<p class="text-red-500">{$errors.image}</p>{/if}
			</div>
			<div>
				<Label for="notes"
					>Notes <span class="text-xs text-muted-foreground"> (optional)</span></Label
				>
				<Textarea
					placeholder="Type your message here."
					id="notes"
					name="notes"
					bind:value={$form.notes}
					{...$constraints.notes}
				/>
				{#if $errors.notes}<p class="text-red-500">{$errors.notes}</p>{/if}
			</div>
			<div class="flex items-center space-x-2">
				<Checkbox id="watered" bind:checked={$form.watered} />
				<Input type="hidden" name="watered" bind:value={$form.watered} {...$constraints.watered} />
				<Label
					for="watered"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>Watering</Label
				>
				{#if $errors.watered}<p class="text-red-500">{$errors.watered}</p>{/if}
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
					>Fertilizing</Label
				>
				{#if $errors.fertilized}<p class="text-red-500">{$errors.fertilized}</p>{/if}
			</div>
			<Input type="hidden" name="plant_id" value={data.plant.id} />
			<Input type="hidden" name="user_id" value={$currentUserId} />
			<Button form={formId} type="submit" bind:disabled={isSubmitting}
				>Water
				{#if isSubmitting}
					<Spinner className="w-4 h-4 ml-4" />
				{/if}
			</Button>
		</form>
		<!-- <Dialog.Footer>
			<Button type="submit">Water</Button>
		</Dialog.Footer> -->
	</Dialog.Content>
</Dialog.Root>
