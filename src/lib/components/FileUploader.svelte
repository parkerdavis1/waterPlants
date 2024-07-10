<script lang="ts">
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { imageSchema } from '../formSchemas/imageSchema';

	export let data;

	const { form, enhance, errors } = superForm(data.form, {
		validators: zodClient(imageSchema)
	});

	const file = fileProxy(form, 'image');
</script>

<form enctype="multipart/form-data" action="?/upload" method="POST" use:enhance>
	<input type="file" name="image" accept="image/*" bind:files={$file} />
	{#if $errors.image}<span class="text-red-500">{$errors.image}</span>{/if}
	<button type="submit">Upload</button>
</form>
