<script>
	import Button from '../ui/button/button.svelte'
	import * as Select from '../ui/select'
	import AddNewPlant from './AddNewPlant.svelte'
	import { Switch } from '$lib/components/ui/switch'
	import Label from '../ui/label/label.svelte'
	import { scale } from 'svelte/transition'
	import { waterPlantsView, waterMultipleOpen } from 'src/lib/stores/viewStore.svelte'
	import { CirclePlus, Droplets, Plus, Sprout } from 'lucide-svelte'

	const { data, waterDisabled } = $props()

	// const checked = $state(waterPlantsView)
</script>

<div class="sticky top-0 z-50 my-4 flex flex-wrap justify-between gap-2 bg-background py-2">
	<div class="flex flex-wrap items-center gap-2">
		<a href="/new/plant"><Button><Sprout />New</Button></a>
		{#if !waterDisabled}
			<div transition:scale>
				<Button onclick={() => (waterMultipleOpen.value = true)}><Droplets />Water</Button>
			</div>
		{/if}
	</div>
	<div class="flex items-center gap-2">
		<Switch id="showWaterPlants" bind:checked={waterPlantsView.value} />
		<Label for="showWaterPlants" class="hidden sm:inline">Only Show Thirsty Plants</Label>
		<Label for="showWaterPlants" class="sm:hidden">Thirsty Only</Label>
	</div>
</div>
