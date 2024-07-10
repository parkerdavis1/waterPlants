<script lang="ts">
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { waterPlantSchema } from '../formSchemas/waterPlantSchema';

	export let data;

	const { form, enhance, errors, message } = superForm(data.form, {
		validators: zodClient(waterPlantSchema)
	});

	const file = fileProxy(form, 'image');
</script>

<form enctype="multipart/form-data" action="?/upload" method="POST" use:enhance>
	<input type="file" name="image" accept="image/*" bind:files={$file} />
	{#if $errors.image}<p class="text-red-500">{$errors.image}</p>{/if}
	{#if $message}<p>{$message}</p>{/if}
	<button type="submit">Upload</button>
</form>
