<script lang="ts">
	import PlantCard from './PlantCard.svelte'
	export let data
	export let plantWater
</script>

<div>
	<PlantCard {data} {plantWater}></PlantCard>
</div>
