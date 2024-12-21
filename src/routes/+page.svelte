<script lang="ts">
	import PlantCard from '$lib/components/PlantCard.svelte'
	import Toolbar from 'src/lib/components/Toolbar/Toolbar.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import { Separator } from 'src/lib/components/ui/separator'
	import { Button } from 'src/lib/components/ui/button/'
	import { superForm } from 'sveltekit-superforms'
	import SuperDebug from 'sveltekit-superforms'
	import { checkedObj } from 'src/lib/stores/selectedPlants.svelte.js'
	import { toast } from 'svelte-sonner'
	import { waterPlantsView } from 'src/lib/stores/viewStore'
	import { fade, slide } from 'svelte/transition'

	let { data } = $props()
	console.log('data', data)

	const plantsThatNeedWater = data.plantsWater.filter((plantWater) => {
		console.log('plantWater in filter function', plantWater.dueDate)
		console.log('now', new Date().getTime())
		return plantWater.dueDate < new Date().getTime()
	})
	console.log('plantsThatNeedWater', plantsThatNeedWater)

	let activePlants = $state()
	waterPlantsView.subscribe((value) => {
		activePlants = value ? plantsThatNeedWater : data.plantsWater
	})
	// const activePlants = $derived(waterPlantsView ? plantsThatNeedWater : data.plantsWater)

	console.log('waterPlantsView', waterPlantsView)
	console.log('activePlants', activePlants)

	const { form, enhance, isTainted } = superForm(data.form, {
		dataType: 'json',
		invalidateAll: true,
		onSubmit: ({ jsonData }) => {
			$form.userId = data.user.id
		},
		onResult: ({ result }) => {
			if (result.type === 'success') {
				console.log('result', result)
				const numPlants = result.data.form.data.plantIds.length
				for (const key in $checkedObj) {
					$checkedObj[key] = false
				}
				toast.success(`Successfully watered ${numPlants} plant${numPlants > 1 ? 's' : ''}`)
			} else {
				toast.error('error')
			}
		},
	})

	let selectedPlants = $state(new Set<number>())
	let waterDisabled = $derived($form.plantIds.length === 0)

	$checkedObj = Object.fromEntries(
		data.plantsWater.map((plantWater) => [plantWater.plant.id, false]),
	)

	$effect(() => {
		const stringArray = Object.keys($checkedObj).filter((key) => $checkedObj[key] === true)
		$form.plantIds = stringArray.map((string) => Number(string))
	})
</script>

<Toolbar {data} {waterDisabled} />
<!-- <SuperDebug data={$form} /> -->
<div class="flex flex-col flex-wrap gap-4">
	<form method="POST" action="?/waterPlants" use:enhance id="multiplantwater">
		<input type="hidden" name="userId" bind:value={data.user.id} />
		<input type="hidden" name="plantIds" bind:value={$form.plantIds} />

		{#each data.rooms as room (room.id)}
			<Accordion.Root value={['item-1']} multiple={true}>
				<Accordion.Item value="item-1">
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
			</Accordion.Root>
		{/each}
	</form>
</div>
