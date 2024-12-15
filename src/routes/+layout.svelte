<script>
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
	// import { currentUser } from 'src/lib/stores/user'

	const { data } = $props()
	const { loggedIn } = data
	console.log('data layout', data)

	// export let data
	// console.log('users from layout', users)
	// console.log('userId from layout', data.userId)
	// const currentUser = users.filter((u) => data.userId == u.id)[0]
</script>

<Toaster richColors />
<div class="container flex h-screen max-w-5xl flex-col pt-8 dark:bg-gray-800 dark:text-white">
	<header class="flex justify-between">
		<h1 class="text-2xl font-bold"><a href="/">🪴 Happy Plants</a></h1>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				{#if loggedIn === true}
					<div use:builder.action {...builder} class="cursor-pointer">
						<Avatar.Root>
							<Avatar.Image src={data.user.avatar_url} class="object-cover" />
							<Avatar.Fallback>{data.user.name}</Avatar.Fallback>
						</Avatar.Root>
					</div>
				{/if}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Item>
					<LogOut class="mr-2 h-4 w-4" />
					<form action="/api?/logout" method="POST">
						<button>Log out</button>
					</form>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</header>
	<main class="grow pb-16">
		<div class="max-w-3xl sm:container">
			<slot></slot>
		</div>
	</main>
	<!-- <footer class="text-xs opacity-50">&copy; Parker Davis {new Date().getFullYear()}</footer> -->
</div>
