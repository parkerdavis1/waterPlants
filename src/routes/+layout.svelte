<script>
	import '../app.css';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Separator } from 'bits-ui';
	import { Settings } from 'lucide-svelte';
	import { Toaster } from 'svelte-sonner';
	import bluegrad from 'src/lib/assets/images/bluegrad.png';
</script>

<Toaster richColors />
<div class="container my-8 flex flex-col">
	<header class="flex justify-between">
		<h1 class="text-2xl font-bold">🪴 Happy Plants</h1>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<div use:builder.action {...builder} class="cursor-pointer">
					<Avatar.Root>
						<Avatar.Image src={bluegrad} />
						<Avatar.Fallback>PD</Avatar.Fallback>
					</Avatar.Root>
				</div>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Label>My Account</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<Settings class="mr-2 h-4 w-4" />
						<span>Settings</span>
						<!-- <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut> -->
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<!-- <Sheet.Root>
			<Sheet.Trigger asChild let:builder>
				<div use:builder.action {...builder} class="cursor-pointer">
					<Avatar.Root>
						<Avatar.Image src="/src/lib/assets/images/bluegrad.png" />
						<Avatar.Fallback>PD</Avatar.Fallback>
					</Avatar.Root>
				</div>
			</Sheet.Trigger>
			<Sheet.Content side="right">
				<Sheet.Header>
					<Sheet.Title>User Settings</Sheet.Title>
					<Sheet.Description>Editing your settings</Sheet.Description>
				</Sheet.Header>
				<div>
					<p>S e t t i n g s</p>
				</div>
			</Sheet.Content>
		</Sheet.Root> -->
	</header>
	<main class="grow-1">
		<slot></slot>
	</main>
	<footer>&copy; Parker Davis {new Date().getFullYear()}</footer>
</div>
