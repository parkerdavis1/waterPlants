<script>
	import Button from '../ui/button/button.svelte'
	import * as Select from '../ui/select'
	import AddNewPlant from './AddNewPlant.svelte'
	import { Switch } from '$lib/components/ui/switch'
	import Label from '../ui/label/label.svelte'
	import { scale } from 'svelte/transition'
	import { waterPlantsView, waterMultipleOpen } from 'src/lib/stores/viewStore.svelte'

	const { data, waterDisabled } = $props()

	// const checked = $state(waterPlantsView)
</script>

<div class="my-4 flex flex-wrap justify-between gap-2">
	<div class="flex flex-wrap items-center gap-2">
		<a href="/new/plant"><Button>Add New Plant</Button></a>
		{#if !waterDisabled}
			<div transition:scale>
				<Button onclick={() => (waterMultipleOpen.value = true)}>Water Plants</Button>
			</div>
		{/if}
	</div>
	<div class="flex items-center gap-2">
		<Switch id="showWaterPlants" bind:checked={$waterPlantsView} />
		<Label for="showWaterPlants">Only Show Thirsty Plants</Label>
	</div>
</div>
