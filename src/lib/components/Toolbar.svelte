<script>
	import { z } from 'zod';

	import Button from './ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import * as Form from '$lib/components/ui/form/index';
	import { Input } from '$lib/components/ui/input/index';
	import { enhance } from '$app/forms';
	import { superForm, superValidate } from 'sveltekit-superforms';
	// import { Label } from '$lib/components/ui/label/index';

	export const NewPlantSchema = z.object({
		name: z.string()
	});
</script>

<div class="my-4 flex">
	<Dialog.Root>
		<Dialog.Trigger>
			<Button variant="outline">Add new plant</Button>
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Title>Add New Plant</Dialog.Title>
			<Dialog.Description>Add a friendly new plant.</Dialog.Description>
			<form id="new-plant" use:enhance method="POST">
				<p>hello</p>
				<!-- <Form.Field>
					<Form.Control>
						<Form.Label>Label label label</Form.Label>
						<Input type="text" />
						<Form.Description>Descirioption</Form.Description>
						<Form.FieldErrors>Errorsafe</Form.FieldErrors>
					</Form.Control>
				</Form.Field> -->
				<Button>Submit</Button>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
