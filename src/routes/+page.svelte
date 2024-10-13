<script lang="ts">
	import PlantCard from '$lib/components/PlantCard.svelte'
	import Toolbar from 'src/lib/components/Toolbar/Toolbar.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import { Separator } from 'src/lib/components/ui/separator'

	export let data
	console.log('rooms', data.rooms)
	// function groupByRoomId(array) {
	// 	const groupMap = new Map()

	// 	for (const obj of array) {
	// 		const roomId = obj.plant.room_id
	// 		if (!groupMap.has(roomId)) {
	// 			groupMap.set(roomId, [roomId, []])
	// 		}
	// 		groupMap.get(roomId)[1].push(obj)
	// 	}

	// 	return Array.from(groupMap.values())
	// }

	// const grouped = groupByRoomId(data.plantsWater)
	// console.log('grouped', grouped)

	// finish up grouping by rooms logic
</script>

<Toolbar {data} />
<div class="flex flex-col flex-wrap gap-4">
	{#each data.rooms as room}
		<Accordion.Root value={['item-1']} multiple={true}>
			<Accordion.Item value="item-1">
				<Accordion.Trigger>{room.name}</Accordion.Trigger>
				<Accordion.Content>
					{#each data.plantsWater as plantWater}
						{#if plantWater.plant.room_id == room.id}
							<a href={`${plantWater.plant.id}`} class="w-full">
								<PlantCard {plantWater} {data} context="list" />
							</a>
						{/if}
					{/each}
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	{/each}

	<!-- <hr />
	{#each data.plantsWater as plantWater}
		<a href={`${plantWater.plant.id}`} class="w-full">
			<PlantCard {plantWater} {data} />
		</a>
	{/each} -->
</div>
