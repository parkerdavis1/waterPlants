<script lang="ts">
	import Button from './ui/button/button.svelte'
	const { url, className = '' } = $props()

	let dialog: HTMLDialogElement

	function handleClick() {
		console.log('Clicked!')
		dialog.showModal()
	}
</script>

<img src={url} alt="" onclick={handleClick} class={`cursor-pointer ${className}`} />
<dialog bind:this={dialog}>
	<div class="grid w-full items-center">
		<img src={url} alt="" class="dialog-image object-contain" />
		<!-- <Button variant="secondary" onclick={() => dialog.close()} class="mx-auto">Close</Button> -->
		<button onclick={() => dialog.close()}>Close</button>
	</div>
</dialog>

<style>
	:root {
		--height: 99svh;
		--width: 99vw;
	}

	.dialog-image {
		max-width: 100%; /* No wider than 80% of viewport width */
		max-height: calc(var(--height) - 5rem); /* No taller than 80% of viewport height */
		object-fit: contain; /* Keep full image visible without cropping */
	}

	dialog {
		border-radius: 0.5rem;
		background: var(--background);
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 0.75);
		backdrop-filter: blur(2px);
	}

	button {
		background: hsl(var(--background));
		padding: 0.5rem;
	}
</style>
