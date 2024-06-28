<script>
	import '../app.css';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="container my-8 flex flex-col">
	<header class="flex justify-between">
		<h1 class="text-2xl font-bold">🪴 Happy Plants</h1>
		<!-- TODO: Make this a Dropdown Menu or something else -->
		<Sheet.Root>
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
		</Sheet.Root>
	</header>
	<main class="grow-1">
		<slot></slot>
	</main>
	<footer>&copy; Parker Davis {new Date().getFullYear()}</footer>
</div>
