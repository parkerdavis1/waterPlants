<script>
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import { toast } from 'svelte-sonner';
	import { Textarea } from './ui/textarea';
	import { Label } from './ui/label';
	import FileUploader from './FileUploader.svelte';

	let { plant, data } = $props();
	let dialogOpen = $state(false);

	function handleSaveChanges() {
		console.log('Saving changes');
		toast.success('Watered plant!', {
			description: 'Did it',
			action: {
				label: 'Undo',
				onClick: () => console.info('Undo')
			}
		});
		dialogOpen = false;
	}
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger>
		<Button variant="default">Water</Button>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>
				Water {plant.name}
			</Dialog.Title>
			<Dialog.Description>Water plant, add any notes or photos if wanted.</Dialog.Description>
		</Dialog.Header>
		<div class="grid w-full gap-1.5">
			<Label for="message">Notes</Label>
			<Textarea placeholder="Type your message here." id="message" />
		</div>
		<div>
			<FileUploader {data} />
		</div>
		<Dialog.Footer>
			<Button type="submit" on:click={handleSaveChanges}>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
