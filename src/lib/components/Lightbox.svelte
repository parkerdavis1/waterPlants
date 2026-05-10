<script lang="ts">
	import CfImage from './CfImage.svelte'
	const { url, className = '' } = $props()

	let dialog: HTMLDialogElement

	function handleClick() {
		dialog.showModal()
	}
</script>

<CfImage
	src={url}
	height={320}
	width={320}
	alt=""
	onclick={handleClick}
	class={`event-thumb cursor-pointer ${className}`}
/>
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
		max-width: 100%;
		max-height: calc(var(--height) - 5rem);
		object-fit: contain;
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
