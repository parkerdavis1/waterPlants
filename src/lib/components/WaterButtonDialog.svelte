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
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import * as Select from '$lib/components/ui/select/index.js'
	import { fade, scale } from 'svelte/transition'

	const { data } = $props()

	let isSubmitting = $state(false)
	let dialogOpen = $state(false)
	let selectedEventType = $state('water')

	$effect(() => {
		console.log('running effect')
		$form.watered = selectedEventType === 'water'
		$form.fertilized = selectedEventType === 'fertilize'
		if (selectedEventType !== 'wait') {
			$form.wait = null
		}
	})

	const { form, enhance, errors, message, constraints } = superForm(data.waterForm, {
		onSubmit: () => {
			isSubmitting = true
		},
		onResult: ({ result }) => {
			isSubmitting = false
			dialogOpen = false
			if (result.type === 'success') {
				toast.success(`Successfully watered ${data.plant.name}!`)
			}
		},
	})

	console.log('errors from water dialog', $errors)

	const file = fileProxy(form, 'image')

	const formId = 'waterForm' + data.plant.id
	const waitFormId = 'waitWaterForm' + data.plant.id
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger class={`w-full ${buttonVariants({ variant: 'default' })}`}>
		💧Water
	</Dialog.Trigger>
	<Dialog.Content class="max-h-full overflow-scroll sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Record Event</Dialog.Title>
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
				{#if $errors.image}<p class="text-red-500">{$errors.image}</p>{/if}
			</div>
			<div>
				<!-- <Select.Root portal={null} bind:selected={selectedEventType}>
							<Select.Trigger>
								<Select.Value placeholder="Select event type" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="water" label="Water">Water</Select.Item>
								<Select.Item value="fertilize" label="Fertilize">Fertilize</Select.Item>
								<Select.Item value="wait" label="Wait">Wait</Select.Item>
							</Select.Content>
						</Select.Root> -->
				<Tabs.Root bind:value={selectedEventType}>
					<Tabs.List class="grid w-full grid-cols-3">
						<Tabs.Trigger value="water">Water</Tabs.Trigger>
						<Tabs.Trigger value="fertilize">Fertilize</Tabs.Trigger>
						<Tabs.Trigger value="wait">Wait</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
				{#if selectedEventType === 'wait'}
					<div transition:fade class="pt-4">
						<Label for="wait">Wait for __ days</Label>
						<Input type="number" bind:value={$form.wait} name="wait" {...$constraints.wait} />
					</div>
				{/if}
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
			<!-- <div class="flex items-center space-x-2">
						<Checkbox id="watered" bind:checked={$form.watered} />
						<Input
							type="hidden"
							name="watered"
							bind:value={$form.watered}
							{...$constraints.watered}
						/>
						<Label
							for="watered"
							class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>Water</Label
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
							>Fertilize</Label
						>
						{#if $errors.fertilized}<p class="text-red-500">{$errors.fertilized}</p>{/if}
					</div> -->

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
