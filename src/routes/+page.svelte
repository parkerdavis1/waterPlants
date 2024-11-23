<script lang="ts">
	import PlantCard from '$lib/components/PlantCard.svelte'
	import Toolbar from 'src/lib/components/Toolbar/Toolbar.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import { Separator } from 'src/lib/components/ui/separator'
	import { Button } from 'src/lib/components/ui/button/'
	import { superForm } from 'sveltekit-superforms'
	import SuperDebug from 'sveltekit-superforms'
	// import { currentUser, currentUserId } from 'src/lib/stores/user'
	import { checkedObj } from 'src/lib/stores/selectedPlants.svelte.js'
	import { toast } from 'svelte-sonner'

	// console.log('currentUserid', $currentUserId)

	let { data } = $props()

	const { form, enhance, isTainted } = superForm(data.form, {
		dataType: 'json',
		invalidateAll: true,
		onSubmit: ({ jsonData }) => {
			$form.userId = data.user.id
		},
		onResult: ({ result }) => {
			if (result.type === 'success') {
				// selectedPlants = new Set()
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
	// let waterDisabled = $derived($checkedPlants.length === 0)

	// const checkedObj = $state(
	// 	Object.fromEntries(data.plantsWater.map((plantWater) => [plantWater.plant.id, false])),
	// )

	$checkedObj = Object.fromEntries(
		data.plantsWater.map((plantWater) => [plantWater.plant.id, false]),
	)

	$effect(() => {
		const stringArray = Object.keys($checkedObj).filter((key) => $checkedObj[key] === true)
		$form.plantIds = stringArray.map((string) => Number(string))
	})

	// const togglePlant = (checkbox: HTMLInputElement, plantId: number) => {
	// 	console.log('checkbox', checkbox)
	// 	console.log('selectedPlants', selectedPlants)
	// 	console.log('waterDisabled', waterDisabled)
	// 	if ($form.plantIds.includes(plantId)) {
	// 		$form.plantIds = $form.plantIds.filter((id) => id !== plantId)
	// 	} else {
	// 		$form.plantIds = [...$form.plantIds, plantId]
	// 	}
	// }
</script>

<Toolbar {data} />
<!-- <SuperDebug data={$form} /> -->
<div class="flex flex-col flex-wrap gap-4">
	<form method="POST" action="?/waterPlants" use:enhance id="multiplantwater">
		<input type="hidden" name="userId" bind:value={data.user.id} />
		<input type="hidden" name="plantIds" bind:value={$form.plantIds} />
		<Button type="submit" form="multiplantwater" disabled={waterDisabled}
			>Water Selected Plants</Button
		>
		{#each data.rooms as room}
			<Accordion.Root value={['item-1']} multiple={true}>
				<Accordion.Item value="item-1">
					<Accordion.Trigger>{room.name}</Accordion.Trigger>
					<Accordion.Content>
						{#each data.plantsWater as plantWater}
							{#if plantWater.plant.room_id == room.id}
								<div class="flex gap-2">
									<!-- <input type="checkbox" bind:checked={$checkedObj[plantWater.plant.id]} /> -->
									<!-- bind:checked={$form.plantIds.includes(plantWater.plant.id)} -->
									<!-- <a href={`${plantWater.plant.id}`} class="w-full"> -->
									<PlantCard {plantWater} {data} context="list" />
									<!-- </a> -->
								</div>
							{/if}
						{/each}
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		{/each}
	</form>
</div>
