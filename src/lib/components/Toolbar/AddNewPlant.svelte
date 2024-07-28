<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { fileProxy, superForm, superValidate } from 'sveltekit-superforms';
	import SuperDebug from 'sveltekit-superforms';
	import * as Select from '$lib/components/ui/select/index';
	import { faker } from '@faker-js/faker';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import ImageUploader from '../ImageUploader.svelte';
	import Spinner from '../Spinner.svelte';
	import ClaudeImage from '../ImageUploader.svelte';
	import NewPlantForm from '../NewPlantForm.svelte';

	export let data;

	const { form, enhance, constraints, errors } = superForm(data.newPlantForm, {
		onSubmit: () => (isSubmitting = true),
		onResult: ({ result }) => {
			isSubmitting = false;
			if (result.type === 'success') {
				toast.success('Created new plant');
				dialogOpen = false;
			} else {
				toast.error('Error creating plant');
			}
		}
	});

	let dialogOpen = false;
	let isSubmitting = false;

	const defaultName = faker.person.firstName();

	// Selected Room Memory
	let selectedRoomId = 1;
	$form.room_id = selectedRoomId;

	$: {
		if (browser) {
			const num = localStorage.getItem('selectedRoom');
			if (num) selectedRoomId = parseInt(num);
		}
	}

	$: selectedRoom = {
		label: data.rooms.find((obj) => obj.id === selectedRoomId).name,
		value: selectedRoomId
	};

	function handleSelectedChange(v) {
		v && ($form.room_id = v.value);
		selectedRoomId = $form.room_id;
		localStorage.setItem('selectedRoom', $form.room_id);
	}
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger>
		<Button variant="outline">Add new plant</Button>
	</Dialog.Trigger>
	<Dialog.Content class="max-h-screen overflow-auto">
		<Dialog.Title>Add New Plant</Dialog.Title>
		<!-- <SuperDebug data={form} /> -->
		<NewPlantForm {data} />

		<Dialog.Footer>
			<Button form="new-plant" type="submit" bind:disabled={isSubmitting}
				>Submit
				{#if isSubmitting}
					<Spinner className="w-4 h-4 ml-4" />
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
