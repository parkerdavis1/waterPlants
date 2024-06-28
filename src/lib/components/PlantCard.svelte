<script lang="ts">
	interface Plant {
		name: string;
		description: string;
	}
	let { plant }: { plant: Plant } = $props();
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
</script>

<Card.Root class="m-4 w-[350px]">
	<Card.Header>
		<Card.Title>{plant.name}</Card.Title>
		<Card.Description>{plant.description}</Card.Description>
	</Card.Header>
	<Card.Content>
		<p>Card content...!</p>
	</Card.Content>
	<Card.Footer>
		<Button variant="default">Water</Button>
	</Card.Footer>
</Card.Root>
