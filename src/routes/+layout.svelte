<script lang="ts">
	import '../app.css'
	import * as Avatar from '$lib/components/ui/avatar'
	import * as Sheet from '$lib/components/ui/sheet'
	import { Button } from '$lib/components/ui/button'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { Separator } from 'bits-ui'
	import { Settings } from 'lucide-svelte'
	import { Toaster } from 'svelte-sonner'
	import bluegrad from 'src/lib/assets/images/bluegrad.png'
	import LogOut from 'lucide-svelte/icons/log-out'

	// import { users } from 'src/lib/stores/user'
	import { browser } from '$app/environment'
	import { enhance } from '$app/forms'
	// import { currentUser } from 'src/lib/stores/user'

	const { data, children } = $props()
	// export let data
	const { loggedIn } = data
	console.log('data layout', data)
	let logoutForm: HTMLFormElement | undefined = $state()

	// console.log('users from layout', users)
	// console.log('userId from layout', data.userId)
	// const currentUser = users.filter((u) => data.userId == u.id)[0]
</script>

<Toaster richColors />
<div class="container flex h-screen max-w-5xl flex-col pt-8 dark:bg-gray-800 dark:text-white">
	<header class="flex justify-between">
		<h1 class="text-2xl font-bold"><a href="/">🪴 Happy Plants</a></h1>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#if loggedIn === true}
					<div class="cursor-pointer">
						<Avatar.Root>
							<Avatar.Image src={data.user.avatar_url} class="object-cover" />
							<Avatar.Fallback>{data.user.name}</Avatar.Fallback>
						</Avatar.Root>
					</div>
				{/if}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Item closeOnSelect={false}>
					<form action="/api?/logout" method="POST">
						<div class="flex items-center">
							<LogOut class="mr-2 h-4 w-4" />
							<button type="submit">Log out</button>
						</div>
					</form>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</header>
	<main class="grow pb-16">
		<div class="max-w-3xl sm:container">
			<!-- <slot></slot> -->
			{@render children()}
		</div>
	</main>
	<!-- <footer class="text-xs opacity-50">&copy; Parker Davis {new Date().getFullYear()}</footer> -->
</div>
