<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import * as Avatar from '$lib/components/ui/avatar'
	const { id } = $props()
	import { currentUserId, currentUser, users } from '../stores/user'
	import { goto, invalidate, invalidateAll } from '$app/navigation'
	import { enhance } from '$app/forms'

	const user = users.find((v) => v.id === id)

	let form: HTMLFormElement
	async function handleClick() {
		console.log('currentuserid', $currentUserId)
		$currentUserId = id
	}
</script>

<DropdownMenu.Item onclick={handleClick}>
	<Avatar.Root>
		<Avatar.Image src={user?.avatar_url} class="object-cover" />
		<Avatar.Fallback>{user?.name}</Avatar.Fallback>
	</Avatar.Root>
	<span class="pl-1">{user?.name}</span>
	<!-- <Settings class="mr-2 h-4 w-4" />
    <span on:click={() => alert("This doesn't do anything yet")}>Settings</span> -->
</DropdownMenu.Item>
<form method="POST" bind:this={form} use:enhance>
	<input type="hidden" value={id} name="userId" />
</form>
