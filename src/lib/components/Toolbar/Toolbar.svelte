<script>
	import Button from '../ui/button/button.svelte'
	import * as Select from '../ui/select'
	import AddNewPlant from './AddNewPlant.svelte'
	import { Switch } from '$lib/components/ui/switch'
	import Label from '../ui/label/label.svelte'

	const { data, waterDisabled } = $props()

	import { waterPlantsView } from 'src/lib/stores/viewStore'
	const checked = $state(waterPlantsView)
</script>

<div class="my-4 flex flex-wrap justify-between gap-2">
	<div>
		<a href="/new/plant"><Button>Add New Plant</Button></a>
		{#if !waterDisabled}
			<Button type="submit" form="multiplantwater" disabled={waterDisabled}
				>Water Selected Plants</Button
			>
		{/if}
	</div>
	<div class="flex items-center gap-2">
		<Switch id="showWaterPlants" bind:checked={$waterPlantsView} />
		<!-- <Switch id="showWaterPlants" /> -->
		<Label for="showWaterPlants">Only Show Thirsty Plants</Label>
	</div>
</div>
