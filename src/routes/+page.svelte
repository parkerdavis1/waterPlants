<script lang="ts">
	import PlantCard from '$lib/components/PlantCard.svelte'
	import Toolbar from 'src/lib/components/Toolbar/Toolbar.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import { superForm } from 'sveltekit-superforms'
	import SuperDebug from 'sveltekit-superforms'
	import { toast } from 'svelte-sonner'
	import { waterPlantsView } from 'src/lib/stores/viewStore.svelte.js'
	import { writable, type Writable } from 'svelte/store'
	import { checkedObj } from 'src/lib/stores/selectedPlants.svelte.js'
	import { waterMultipleOpen } from 'src/lib/stores/viewStore.svelte.js'
	import { Label } from 'src/lib/components/ui/label/index.js'
	import { Textarea } from 'src/lib/components/ui/textarea/index.js'
	import { Button } from 'src/lib/components/ui/button/index.js'
	import DatePicker from 'src/lib/components/DatePicker.svelte'
	import { invalidate, invalidateAll } from '$app/navigation'

	let { data } = $props()

	const plantsThatNeedWater = $derived(
		data.plantsWater?.filter((plantWater) => plantWater.dueDate < new Date().getTime()),
	)
	$inspect(plantsThatNeedWater)

	let activePlants = $derived($waterPlantsView ? plantsThatNeedWater : data.plantsWater)

	// State used in many places, so it is stored in a store
	$checkedObj = Object.fromEntries(
		data.plantsWater.map((plantWater) => [plantWater.plant.id, false]),
	)

	const { form, enhance } = superForm(data.form, {
		dataType: 'json',
		invalidateAll: true,
		onSubmit: ({ jsonData }) => {
			$form.userId = data.user.id
		},
		onResult: ({ result }) => {
			if (result.type === 'success') {
				console.log('result', result)
				const numPlants = result.data?.form.data.plantIds.length
				for (const key in $checkedObj) {
					$checkedObj[key] = false
				}
				toast.success(`Successfully watered ${numPlants} plant${numPlants > 1 ? 's' : ''}`)
				waterMultipleOpen.value = false
				invalidateAll()
			} else {
				toast.error('error')
			}
		},
	})

	let waterDisabled = $derived($form.plantIds.length === 0)

	$effect(() => {
		const stringArray = Object.keys($checkedObj).filter((key) => $checkedObj[key] === true)
		$form.plantIds = stringArray.map((string) => Number(string))
	})

	const openRooms =
		// get open rooms from session storage if it exists, otherwise set to all rooms
		window.sessionStorage.getItem('accordionValue') !== null
			? JSON.parse(window.sessionStorage.getItem('accordionValue') ?? '[]')
			: data.rooms?.map((room) => room.name)
	let values = $state([...openRooms])

	function handleAccordionChange(arrayOfValues: string[]) {
		window.sessionStorage.setItem('accordionValue', JSON.stringify(arrayOfValues))
	}
</script>

<svelte:head>
	<title>Happy Plants</title>
</svelte:head>

<Toolbar {data} {waterDisabled} />
<!-- <SuperDebug data={$form} /> -->
<div class="flex flex-col flex-wrap gap-4">
	<Accordion.Root type="multiple" value={values} onValueChange={handleAccordionChange}>
		{#if data.rooms}
			{#each data.rooms as room, index (room.id)}
				<Accordion.Item value={room.name}>
					<Accordion.Trigger>{room.name}</Accordion.Trigger>
					<Accordion.Content>
						{#each activePlants as plantWater}
							{#if plantWater.plant.room_id == room.id}
								<div class="flex gap-2">
									<PlantCard {plantWater} {data} context="list" />
								</div>
							{/if}
						{/each}
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		{/if}
	</Accordion.Root>
</div>

<!-- hidden -->
<form method="POST" action="?/waterPlants" use:enhance id="multiplantwater">
	<input type="hidden" name="userId" bind:value={data.user.id} />
	<input type="hidden" name="plantIds" bind:value={$form.plantIds} />
	<input type="hidden" name="notes" bind:value={$form.notes} />
	<input type="hidden" name="timestamp" bind:value={$form.timestamp} />
</form>

<Dialog.Root bind:open={waterMultipleOpen.value}>
	<!-- <Dialog.Trigger>💧Record Event</Dialog.Trigger> -->
	<Dialog.Content class="max-h-screen overflow-auto">
		<Dialog.Title>Water Plants</Dialog.Title>
		<!-- <SuperDebug data={$form} /> -->
		<Dialog.Description>
			Watering {$form.plantIds.length} plant{$form.plantIds.length > 1 ? 's' : ''}
		</Dialog.Description>
		<!-- <Label for="timestamp">Date</Label> -->
		<DatePicker {form} />
		<Label for="notes">Notes</Label>
		<Textarea id="notes" bind:value={$form.notes} />
		<Button type="submit" form="multiplantwater">Water Plants</Button>
	</Dialog.Content>
</Dialog.Root>
