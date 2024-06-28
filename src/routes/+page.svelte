<script lang="ts">
	import PlantCard from '$lib/components/PlantCard.svelte';

	let plants = [
		{
			name: 'Mesquite',
			description: 'A nice plant'
		},
		{
			name: 'Palo Verde',
			description: 'A great plant'
		},
		{
			name: 'Mesquite',
			description: 'A nice plant'
		},
		{
			name: 'Palo Verde',
			description: 'A great plant'
		}
	];
</script>

<main class="container mx-auto my-8">
	<h1 class="text-2xl font-bold">🪴 Happy Plants</h1>
	<div class="grid grid-cols-3">
		{#each plants as plant}
			<PlantCard {plant} />
		{/each}
	</div>
</main>
