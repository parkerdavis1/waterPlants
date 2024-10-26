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
	import UserChoice from 'src/lib/components/UserChoice.svelte'

	import { users } from 'src/lib/stores/user'
	import { browser } from '$app/environment'
	import { currentUser } from 'src/lib/stores/user'

	// export let data
	// console.log('users from layout', users)
	// console.log('userId from layout', data.userId)
	// const currentUser = users.filter((u) => data.userId == u.id)[0]
</script>

<Toaster richColors />
<div class="container flex h-screen flex-col pt-8">
	<header class="flex justify-between">
		<h1 class="text-2xl font-bold"><a href="/">🪴 Happy Plants</a></h1>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<div use:builder.action {...builder} class="cursor-pointer">
					<Avatar.Root>
						<Avatar.Image src={$currentUser.avatar_url} class="object-cover" />
						<Avatar.Fallback>{$currentUser.name}</Avatar.Fallback>
					</Avatar.Root>
				</div>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Label>Choose User</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<UserChoice id={1} />
					<UserChoice id={2} />
				</DropdownMenu.Group>
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
