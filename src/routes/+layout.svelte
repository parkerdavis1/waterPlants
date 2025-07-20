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

	import { navigating } from '$app/state'
	import { onNavigate } from '$app/navigation'
	import { fade, slide } from 'svelte/transition'
	import { expoOut } from 'svelte/easing'

	const { data, children } = $props()
	const { loggedIn } = data
	let logoutForm: HTMLFormElement | undefined = $state()

	onNavigate((navigation) => {
		if (!document.startViewTransition) return

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve()
				await navigation.complete
			})
		})
	})
</script>

<svelte:head>
	<title>Happy Plants</title>
	<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png" />
	<link rel="manifest" href="/site.webmanifest" />
</svelte:head>

{#if navigating.to}
	<div
		class="navigation-loader"
		in:slide={{ delay: 0, duration: 12000, axis: 'x', easing: expoOut }}
	></div>
{/if}

<Toaster richColors />
<div class="container flex h-screen max-w-6xl flex-col pt-8 dark:bg-gray-800 dark:text-white">
	<header class="flex justify-between">
		<h1 class="click text-2xl font-bold"><a href="/">🪴 Happy Plants</a></h1>
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
		<div class="mx-auto max-w-3xl lg:max-w-6xl">
			<!-- <slot></slot> -->
			{@render children()}
		</div>
	</main>
	<!-- <footer class="text-xs opacity-50">&copy; Parker Davis {new Date().getFullYear()}</footer> -->
</div>

<style lang="css">
	.navigation-loader {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		height: 4px;
		z-index: 50;
		background-color: #0284c5;
	}
</style>
