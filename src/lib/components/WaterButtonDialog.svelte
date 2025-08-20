<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Switch } from '$lib/components/ui/switch/index.js'

	import { Textarea } from 'src/lib/components/ui/textarea/index'
	import { toast } from 'svelte-sonner'
	import SuperDebug, { fileProxy, superForm } from 'sveltekit-superforms'
	import PlantCard from 'src/lib/components/PlantCard.svelte'
	import ImageUploader from 'src/lib/components/ImageUploader.svelte'
	import Spinner from 'src/lib/components/Spinner.svelte'
	import Separator from 'src/lib/components/ui/separator/separator.svelte'
	import { Checkbox } from 'src/lib/components/ui/checkbox/'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import * as Select from '$lib/components/ui/select/index.js'
	import { fade, scale, slide } from 'svelte/transition'
	import { id } from 'date-fns/locale'
	import DatePicker from './DatePicker.svelte'
	import { createJoyfulFuzzyGurgle } from '$lib/utils/fizzy-bubble'

	const { data } = $props()

	let isSubmitting = $state(false)
	let dialogOpen = $state(false)
	let selectedEventType = $state('event')
	let wateredTemp = $state(true)
	let fertilizedTemp = $state(false)

	function handleTabChange() {
		if (selectedEventType === 'wait') {
			console.log('Wait selected')
			wateredTemp = $form.watered
			fertilizedTemp = $form.fertilized
			// then...
			$form.watered = false
			$form.fertilized = false
		} else if (selectedEventType === 'event') {
			console.log('event selected')
			$form.watered = wateredTemp
			$form.fertilized = fertilizedTemp
			$form.wait = undefined
		}
	}

	const { form, enhance, errors, message, constraints } = superForm(data.waterForm, {
		invalidateAll: 'force',
		onSubmit: () => {
			isSubmitting = true
			console.log('submitting')
			console.log('form', $form)
			console.log('errors', $errors)
		},
		onResult: ({ result }) => {
			isSubmitting = false
			dialogOpen = false
			if (result.type === 'success') {
				toast.success(`Successfully watered ${data.plant.name ?? data.plant.species ?? 'plant'}!`)
				createJoyfulFuzzyGurgle()
			} else {
				console.log('result', result)
				toast.error('There was an error.')
			}
		},
	})

	const file = fileProxy(form, 'image')

	const formId = 'waterForm' + data.plant.id
	const waitFormId = 'waitWaterForm' + data.plant.id

	// Picture Timer
	const suggestPicture = data.plant.daysSinceLastPhoto > 30 // 30 days
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger class={`w-full ${buttonVariants({ variant: 'default' })}`}>
		💧Record Event
	</Dialog.Trigger>
	<Dialog.Content class="dialog-content max-h-full overflow-scroll sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>
				{#if selectedEventType === 'wait'}
					<span>Wait</span>
				{:else}
					<span>Record Event</span>
				{/if}
			</Dialog.Title>
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
			<div>
				<Tabs.Root bind:value={selectedEventType} onValueChange={handleTabChange}>
					<Tabs.List class="grid w-full grid-cols-2 bg-gray-100">
						<Tabs.Trigger value="event">Record Event</Tabs.Trigger>
						<!-- <Tabs.Trigger value="fertilize">Fertilize</Tabs.Trigger> -->
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
							<Input type="number" bind:value={$form.wait} name="wait" {...$constraints.wait} />
						</div>
					</Tabs.Content>
				</Tabs.Root>
			</div>
			<div>
				<Label for="image"
					>Image <span class="text-xs text-muted-foreground"> (optional)</span></Label
				>
				<ImageUploader {form} {constraints} />
				<p class="text-center text-xs text-muted-foreground">
					<span>
						{data.plant.daysSinceLastPhoto} day{data.plant.daysSinceLastPhoto === 1 ? '' : 's'} since
						last photo
					</span>
					{#if suggestPicture}
						<span>(Snap a pic! 📸)</span>
					{/if}
				</p>
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
			<Input type="hidden" name="plant_id" value={data.plant.id} />
			<Input type="hidden" name="user_id" value={data.user.id} />
			<Input type="hidden" name="watered" bind:value={$form.watered} />
			<Input type="hidden" name="fertilized" bind:value={$form.fertilized} />
			<Input type="hidden" name="wait" bind:value={$form.wait} />
			<Button form={formId} type="submit" bind:disabled={isSubmitting}
				>Submit
				{#if isSubmitting}
					<Spinner className="w-4 h-4 ml-4" />
				{/if}
			</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
