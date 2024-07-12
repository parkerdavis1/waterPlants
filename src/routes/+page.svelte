<script lang="ts">
	import PlantCard from '$lib/components/PlantCard.svelte';
	import Toolbar from 'src/lib/components/Toolbar/Toolbar.svelte';

	export let data;
	const { plantsWater } = data;
	console.log();
</script>

<Toolbar {data} />
<div class="flex flex-wrap gap-4">
	{#each plantsWater as plantWater}
		<PlantCard {plantWater} {data} />
	{/each}
</div>
