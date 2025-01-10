<script lang="ts">
	import PlantCard from '$lib/components/PlantCard.svelte'
	import Toolbar from 'src/lib/components/Toolbar/Toolbar.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import { superForm } from 'sveltekit-superforms'
	import SuperDebug from 'sveltekit-superforms'
	import { toast } from 'svelte-sonner'
	import { waterPlantsView } from 'src/lib/stores/viewStore'
	import { writable, type Writable } from 'svelte/store'
	import { checkedObj } from 'src/lib/stores/selectedPlants.svelte.js'

	let { data } = $props()

	const plantsThatNeedWater = $derived(
		data.plantsWater.filter((plantWater) => {
			console.log(
				`${plantWater.plant.species} due date`,
				new Date(plantWater.dueDate).toLocaleString(),
				'now',
				new Date().toLocaleString(),
				'pass',
				plantWater.dueDate < new Date().getTime(),
			)
			return plantWater.dueDate < new Date().getTime()
		}),
	)
	$inspect(plantsThatNeedWater)

	let activePlants = $state(data.plantsWater)
	// Using a store because it is updated by the toolbar component
	waterPlantsView.subscribe((value) => {
		activePlants = value ? plantsThatNeedWater : data.plantsWater
	})

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
			} else {
				toast.error('error')
			}
		},
	})

	// let selectedPlants = $state(new Set<number>())
	let waterDisabled = $derived($form.plantIds.length === 0)

	$effect(() => {
		const stringArray = Object.keys($checkedObj).filter((key) => $checkedObj[key] === true)
		$form.plantIds = stringArray.map((string) => Number(string))
	})

	// const roomNames = data.rooms.map((room) => room.name)
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

<Toolbar {data} {waterDisabled} />
<!-- <SuperDebug data={$form} /> -->
<div class="flex flex-col flex-wrap gap-4">
	<form method="POST" action="?/waterPlants" use:enhance id="multiplantwater">
		<input type="hidden" name="userId" bind:value={data.user.id} />
		<input type="hidden" name="plantIds" bind:value={$form.plantIds} />

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
	</form>
</div>
