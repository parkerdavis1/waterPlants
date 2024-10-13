<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import * as Avatar from '$lib/components/ui/avatar'
	const { initials, name, id } = $props()
	import { currentUserId } from '../stores/user'
	import { goto, invalidate, invalidateAll } from '$app/navigation'
	import { enhance } from '$app/forms'

	let form: HTMLFormElement
	async function handleClick() {
		const response = await fetch('/api/setUser', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId: id }),
		})
		console.log('response', response)
		if (response.ok) {
			window.location.href = window.location.pathname
		}
	}
</script>

<DropdownMenu.Item onclick={handleClick}>
	<Avatar.Root>
		<Avatar.Image src="" class="object-cover px-4" />
		<Avatar.Fallback>{initials}</Avatar.Fallback>
	</Avatar.Root>
	<span class="pl-1">{name}</span>
	<!-- <Settings class="mr-2 h-4 w-4" />
    <span on:click={() => alert("This doesn't do anything yet")}>Settings</span> -->
</DropdownMenu.Item>
<form method="POST" bind:this={form} use:enhance>
	<input type="hidden" value={id} name="userId" />
</form>
