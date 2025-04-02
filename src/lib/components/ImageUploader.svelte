<script lang="ts">
	import Button from './ui/button/button.svelte'
	import { fileProxy } from 'sveltekit-superforms'

	// export let form

	let { form } = $props()

	let fileInput: HTMLInputElement = $state()
	let previewImage: string | null = $state(null)
	let fileName: string = $state('')

	const fileProx = fileProxy(form, 'image')

	async function handleFileSelect(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0]
		console.log('new file', file)
		if (!file) return

		// Create preview
		previewImage = URL.createObjectURL(file)
		console.log('previewImage', previewImage)

		// Resize image
		const resizedBlob = await resizeImage(file, 1600, 1600)
		const newFileName = file.name.split('.').slice(0, -1).join('.') + '.webp' // incase there are multiple . in name
		console.log('resizedBlob', resizedBlob)
		const newImageFile = new File([resizedBlob], newFileName, { type: resizedBlob.type })
		console.log('newImageFile', newImageFile)

		// Update form data
		fileProx.set(newImageFile)
		console.log('$form.image', $form.image)

		// $form.image = newImageFile
	}

	function triggerFileInput() {
		fileInput.click()
	}

	async function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
		console.log('Doing new resizeImage')
		return new Promise((resolve) => {
			const reader = new FileReader()
			reader.onload = (e) => {
				const img = new Image()
				console.log('img', img)
				img.onload = () => {
					console.log('image on load')

					// Calculate new dimensions
					let width = img.width
					let height = img.height

					if (width > maxWidth || height > maxHeight) {
						if (width > height) {
							height *= maxWidth / width
							width = maxWidth
						} else {
							width *= maxHeight / height
							height = maxHeight
						}
					}

					// Resize image
					const canvas = document.createElement('canvas')
					canvas.width = width
					canvas.height = height

					// Draw image to canvas
					const ctx = canvas.getContext('2d')
					ctx?.drawImage(img, 0, 0, width, height)

					// Convert canvas to blob
					canvas.toBlob(
						(blob) => {
							resolve(blob as Blob)
						}, // Callback
						'image/webp', // MIME type
						0.96, // Quality
					)
				}
				img.src = e.target?.result as string
			}
			reader.readAsDataURL(file)
		})
	}
</script>

<div class="flex flex-col gap-4">
	<input
		type="file"
		accept="image/*"
		name="image"
		bind:files={$fileProx}
		bind:this={fileInput}
		onchange={handleFileSelect}
		hidden
	/>

	{#if previewImage}
		<div class="w-full">
			<img
				src={previewImage}
				alt="Selected image preview"
				class="aspect-square w-full max-w-[200px] rounded-lg object-cover"
			/>
		</div>
		<div class="flex max-w-full items-center gap-4">
			<Button onclick={triggerFileInput} variant="secondary">Select new Image</Button>
			<p
				class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs italic opacity-50"
			>
				{fileName}
			</p>
		</div>
	{:else}
		<Button onclick={triggerFileInput} variant="secondary">
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
