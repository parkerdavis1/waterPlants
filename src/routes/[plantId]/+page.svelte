<script lang="ts">
	import { Button } from 'src/lib/components/ui/button'
	import { Input } from 'src/lib/components/ui/input/index'
	import { Label } from 'src/lib/components/ui/label/index'
	import { Textarea } from 'src/lib/components/ui/textarea/index'
	import { toast } from 'svelte-sonner'
	import SuperDebug, { fileProxy, superForm } from 'sveltekit-superforms'
	import PlantCard from 'src/lib/components/PlantCard.svelte'
	import ImageUploader from 'src/lib/components/ImageUploader.svelte'
	import Spinner from 'src/lib/components/Spinner.svelte'
	import Separator from 'src/lib/components/ui/separator/separator.svelte'
	import { Checkbox } from 'src/lib/components/ui/checkbox/'
	import WaterButtonDialog from 'src/lib/components/WaterButtonDialog.svelte'
	import EditButtonDialog from 'src/lib/components/EditButtonDialog.svelte'
	import WaterEventCard from 'src/lib/components/WaterEventCard.svelte'

	export let data

	// function handleSaveChanges() {
	// 	console.log('Saving changes');
	// 	toast.success('Watered plant!', {
	// 		description: 'Did it',
	// 		action: {
	// 			label: 'Undo',
	// 			onClick: () => console.info('Undo')
	// 		}
	// 	});
	// 	invalidateAll();
	// }

	$: plantCardData = {
		plant: data.plant,
		watering_event: data.wateringEvents[0],
	}
</script>

<div class="mt-8 flex flex-col gap-4">
	<h1 class="break-words text-3xl font-bold">{data.plant.species}</h1>
	<!-- <SuperDebug data={form} /> -->
	<PlantCard plantWater={plantCardData} {data} context="event" />
	<div class="flex w-full gap-4">
		<WaterButtonDialog {data} />
		<EditButtonDialog {data} />
	</div>
	<Separator />
	<div>
		<h2 class="text-xl font-bold">Care Notes</h2>
		<div class="whitespace-pre-wrap">
			{data.plant.notes}
		</div>
	</div>
	<Separator />
	<h2 class="text-xl font-bold">Past Watering Events</h2>
	<div class="grid gap-4 sm:grid-cols-3">
		{#each data.wateringEvents as wateringEvent}
			<WaterEventCard {data} {wateringEvent} />
			<!-- <div>
				<p>{wateringEvent.timestamp}</p>
				<pre class="break-words text-xs opacity-50">{JSON.stringify(wateringEvent, null, 2)}</pre>
			</div> -->
		{/each}
	</div>
</div>
