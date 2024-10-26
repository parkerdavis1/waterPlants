<script lang="ts">
	import PlantCard from '$lib/components/PlantCard.svelte'
	import Toolbar from 'src/lib/components/Toolbar/Toolbar.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import { Separator } from 'src/lib/components/ui/separator'

	export let data
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
							<div class="flex gap-2">
								<input type="checkbox" name={plantWater.plant.id} id={plantWater.plant.id} />
								<a href={`${plantWater.plant.id}`} class="w-full">
									<PlantCard {plantWater} {data} context="list" />
								</a>
							</div>
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
