<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from './ui/button/button.svelte';
	import { fileProxy } from 'sveltekit-superforms';

	export let form, constraints;

	let fileInput: HTMLInputElement;
	let previewImage: string | null = null;
	let fileName: string = '';

	// const dispatch = createEventDispatcher();

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			loadFile(file);
		}
	}

	function loadFile(file: File) {
		if (file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (e) => {
				previewImage = e.target?.result as string;
				fileName = file.name;
				// dispatch('fileSelected', { file });
			};
			reader.readAsDataURL(file);
		} else {
			alert('Please select an image file.');
		}
	}

	function triggerFileInput() {
		fileInput.click();
	}

	const file = fileProxy(form, 'image');
</script>

<div class="flex flex-col gap-4">
	<input
		type="file"
		accept="image/*"
		on:change={handleFileSelect}
		bind:this={fileInput}
		bind:files={$file}
		id="file-input"
		name="image"
		class="visually-hidden"
		capture="environment"
		aria-describedby="file-input-description"
		{...constraints}
	/>

	{#if previewImage}
		<div class="w-full">
			<img
				src={previewImage}
				alt="Selected image preview"
				class="aspect-square w-full max-w-[400px] rounded-lg object-cover"
			/>
		</div>
		<div class="flex max-w-full items-center gap-4">
			<Button on:click={triggerFileInput} variant="secondary">Select new Image</Button>
			<p
				class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs italic opacity-50"
			>
				{fileName}
			</p>
		</div>
	{:else}
		<Button on:click={triggerFileInput}>
			<svg aria-hidden="true" class="image-icon" viewBox="0 0 24 24" width="24" height="24">
				<path
					fill="currentColor"
					d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
				/>
			</svg>Select Image</Button
		>
	{/if}
</div>

<style>
	.select-image-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 16px;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.select-image-button:hover,
	.select-image-button:focus {
		background-color: #0056b3;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	.long-content {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
