<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Switch } from '$lib/components/ui/switch/index.js'

	import { Textarea } from 'src/lib/components/ui/textarea/index'
	import { toast } from 'svelte-sonner'
	import SuperDebug, { fileProxy, superForm } from 'sveltekit-superforms'
	import ImageUploader from 'src/lib/components/ImageUploader.svelte'
	import Spinner from 'src/lib/components/Spinner.svelte'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import { fade } from 'svelte/transition'
	import DatePicker from './DatePicker.svelte'
	import { DAY_MILLISECONDS } from '../utils/constants'

	let { data, wateringEvent, dialogOpen = $bindable(false) } = $props()

	let isSubmitting = $state(false)
	let selectedEventType = $state(wateringEvent.waitUntil ? 'wait' : 'event')
	let wateredTemp = $state(wateringEvent.watered)
	let fertilizedTemp = $state(wateringEvent.fertilized)
	let waitDays = $state(wateringEvent.waitUntil ? Math.round((wateringEvent.waitUntil - new Date().getTime()) / DAY_MILLISECONDS) : null)

	$effect(() => {
		if (selectedEventType === 'wait' && waitDays) {
			$form.waitUntil = calculateWaitDateTime(waitDays)
		}
	})

	function calculateWaitDateTime(days: number | null) {
		if (!days) return undefined
		const currentDate = new Date()
		const futureDate = new Date(currentDate.getTime() + days * DAY_MILLISECONDS)
		return futureDate.getTime()
	}

	function handleTabChange() {
		if (selectedEventType === 'wait') {
			wateredTemp = $form.watered
			fertilizedTemp = $form.fertilized
			// then...
			$form.watered = false
			$form.fertilized = false
		} else if (selectedEventType === 'event') {
			$form.watered = wateredTemp
			$form.fertilized = fertilizedTemp
			$form.waitUntil = undefined
		}
	}

	const { form, enhance, errors, message, constraints } = superForm(data.editEventForm, {
		id: 'edit-event-' + wateringEvent.id,
		invalidateAll: 'force',
		resetForm: false,
		onSubmit: () => {
			isSubmitting = true
		},
		onResult: ({ result }) => {
			isSubmitting = false
			if (result.type === 'success') {
				dialogOpen = false
				toast.success(`Successfully updated event!`)
			} else {
				console.error('result', result)
				toast.error('There was an error.')
			}
		},
	})

	// Pre-fill form when dialog opens or wateringEvent updates
	$effect(() => {
		if (dialogOpen) {
			$form.id = wateringEvent.id
			$form.plant_id = wateringEvent.plant_id
			$form.user_id = wateringEvent.user_id
			$form.timestamp = wateringEvent.timestamp
			$form.notes = wateringEvent.notes ?? ''
			$form.watered = wateringEvent.watered
			$form.fertilized = wateringEvent.fertilized
			$form.waitUntil = wateringEvent.waitUntil
			$form.oldImageUrl = wateringEvent.image_url

			selectedEventType = wateringEvent.waitUntil ? 'wait' : 'event'
			wateredTemp = wateringEvent.watered
			fertilizedTemp = wateringEvent.fertilized
			waitDays = wateringEvent.waitUntil ? Math.round((wateringEvent.waitUntil - new Date().getTime()) / DAY_MILLISECONDS) : null
		}
	})

	const file = fileProxy(form, 'image')

	const formId = 'editEventForm' + wateringEvent.id
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="dialog-content max-h-full overflow-scroll sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>
				{#if selectedEventType === 'wait'}
					<span>Edit Wait Event</span>
				{:else}
					<span>Edit Event</span>
				{/if}
			</Dialog.Title>
		</Dialog.Header>
		<form
			enctype="multipart/form-data"
			action="?/editEvent"
			method="POST"
			id={formId}
			class="flex flex-col gap-8"
			use:enhance
		>
			<!-- <SuperDebug data={$form} /> -->
			<div>
				<Tabs.Root bind:value={selectedEventType} onValueChange={handleTabChange}>
					<Tabs.List class="grid w-full grid-cols-2 ">
						<Tabs.Trigger value="event">Record Event</Tabs.Trigger>
						<Tabs.Trigger value="wait">Wait</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="event">
						<div>
							<div class="my-6 flex justify-stretch">
								<DatePicker {form} />
								<input type="hidden" name="timestamp" bind:value={$form.timestamp} />
							</div>
							<div class="my-6 flex items-center space-x-2">
								<Switch id="water" bind:checked={$form.watered} />
								<Label for="water">
									Water{' '}
									{#if $form.watered}<span transition:fade>💧</span>
									{/if}
								</Label>
							</div>
							<div class="my-6 flex items-center space-x-2">
								<Switch id="fertilized" bind:checked={$form.fertilized} />
								<Label for="fertilized">Fertilize</Label>
							</div>
						</div>
					</Tabs.Content>
					<Tabs.Content value="wait">
						<div class="pt-4">
							<Label for="wait">Wait for __ days</Label>
							<Input type="number" bind:value={waitDays} name="waitDays" />
						</div>
					</Tabs.Content>
				</Tabs.Root>
			</div>
			<div>
				{#if wateringEvent.image_url}
					<div class="mb-4">
						<Label>Current Image</Label>
						<img src={wateringEvent.image_url} alt="Event" class="mt-2 h-32 w-32 rounded-md object-cover" />
					</div>
				{/if}
				<Label for="image"
					>{wateringEvent.image_url ? 'Replace Image' : 'Image'} <span class="text-xs text-muted-foreground"> (optional)</span></Label
				>
				<ImageUploader {form} {constraints} />
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
			<Input type="hidden" name="id" value={$form.id} />
			<Input type="hidden" name="plant_id" value={$form.plant_id} />
			<Input type="hidden" name="user_id" value={$form.user_id} />
			<Input type="hidden" name="watered" bind:value={$form.watered} />
			<Input type="hidden" name="fertilized" bind:value={$form.fertilized} />
			<Input type="hidden" name="waitUntil" bind:value={$form.waitUntil} />
			<Input type="hidden" name="oldImageUrl" value={$form.oldImageUrl} />
			<Button form={formId} type="submit" bind:disabled={isSubmitting}
				>Save Changes
				{#if isSubmitting}
					<Spinner className="w-4 h-4 ml-4" />
				{/if}
			</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
