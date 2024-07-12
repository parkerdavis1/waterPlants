<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { fileProxy } from 'sveltekit-superforms';

	export let constraints, form;

	const file = fileProxy(form, 'image');
</script>

<Input type="file" name="image" accept="image/*" bind:files={$file} {...$constraints.image} />
