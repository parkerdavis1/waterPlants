<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import * as Table from '$lib/components/ui/table/index.js'
	import { format } from 'date-fns'
	import { toast } from 'svelte-sonner'
	import { superForm } from 'sveltekit-superforms'
	import { buttonVariants } from './ui/button'
	import Lightbox from './Lightbox.svelte'
	import EditWateringEventDialog from './EditWateringEventDialog.svelte'
	import { Ellipsis } from 'lucide-svelte'

	let { data, wateringEvent } = $props()
	const waterer = data.users.find((u) => u.id == wateringEvent.user_id)?.name

	let deleteEventForm: HTMLFormElement
	let deleteDialogOpen = $state(false)
	let editDialogOpen = $state(false)

	const { form, enhance } = superForm(data.deleteEvent, {
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success(`Successfully deleted event from ${wateringEvent.timestamp}!`)
			}
		},
	})
</script>

<Table.Row>
	<Table.Cell class="min-w-32 text-xs">
		{format(new Date(wateringEvent.timestamp), 'PPp')}
	</Table.Cell>
	<Table.Cell class="min-w-48">
		<div>
			{wateringEvent.notes || ''}
		</div>
		<div class="event-thumb">
			{#if wateringEvent.image_url}
				<Lightbox url={wateringEvent.image_url} />
			{/if}
		</div>
	</Table.Cell>
	<Table.Cell class="text-center">{wateringEvent.watered ? '💧' : ''}</Table.Cell>
	<Table.Cell class="text-center">{wateringEvent.fertilized ? '✅' : ''}</Table.Cell>
	{#if wateringEvent.waitUntil}
		<Table.Cell class="whitespace-nowrap text-center text-xs"
			>{format(new Date(wateringEvent.waitUntil), 'PP')}</Table.Cell
		>
	{:else}
		<Table.Cell class="text-center"></Table.Cell>
	{/if}
	<Table.Cell class="text-center">{waterer}</Table.Cell>
	<Table.Cell class="text-center">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
				<span class="sr-only">Open menu</span>
				<Ellipsis class="h-4 w-4" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Item onclick={() => (editDialogOpen = true)}>Edit</DropdownMenu.Item>
				<DropdownMenu.Item
					class="text-destructive focus:bg-destructive/10 focus:text-destructive"
					onclick={() => (deleteDialogOpen = true)}>Delete</DropdownMenu.Item
				>
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<AlertDialog.Root bind:open={deleteDialogOpen}>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Delete watering event?</AlertDialog.Title>
					<AlertDialog.Description>
						This action cannot be undone. This will permanently delete this watering event.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action
						class={buttonVariants({ variant: 'destructive' })}
						onclick={() => deleteEventForm.submit()}
					>
						Delete
					</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>

		<EditWateringEventDialog bind:dialogOpen={editDialogOpen} {data} {wateringEvent} />
	</Table.Cell>
</Table.Row>

<form
	action={`/${wateringEvent.plant_id}?/deleteEvent`}
	bind:this={deleteEventForm}
	method="POST"
	use:enhance
>
	<input type="hidden" value={wateringEvent.id} name="id" />
	<input type="hidden" value={wateringEvent.plant_id} name="plantId" />
</form>
