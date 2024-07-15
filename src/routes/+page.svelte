<script lang="ts">
	import PlantCard from '$lib/components/PlantCard.svelte';
	import Toolbar from 'src/lib/components/Toolbar/Toolbar.svelte';
	import { Separator } from 'src/lib/components/ui/separator';

	export let data;
</script>

<Toolbar {data} />
<div class="flex flex-wrap gap-4">
	{#each data.plantsWater as plantWater}
		<PlantCard {plantWater} {data} />
	{/each}
</div>
