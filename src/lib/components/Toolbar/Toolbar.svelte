<script>
	import Button from '../ui/button/button.svelte';
	import AddNewPlant from './AddNewPlant.svelte';

	export let data;
</script>

<div class="my-4 flex gap-2">
	<Button variant="outline">Select House</Button>
	<!-- <Button variant="outline">Select Room</Button> -->
	<AddNewPlant {data} />
</div>
