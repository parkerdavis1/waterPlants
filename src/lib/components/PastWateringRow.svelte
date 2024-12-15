<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js'

	import * as Table from '$lib/components/ui/table/index.js'
	import { format } from 'date-fns'
	import { toast } from 'svelte-sonner'
	import { superForm } from 'sveltekit-superforms'
	import { buttonVariants } from './ui/button'

	let { data, wateringEvent } = $props()
	const waterer = data.users.find((u) => u.id == wateringEvent.user_id)?.name

	let deleteEventForm: HTMLFormElement

	const { form, enhance } = superForm(data.deleteEvent, {
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success(`Successfully deleted event from ${wateringEvent.timestamp}!`)
			}
		},
	})
</script>

<Table.Row>
	<Table.Cell class="whitespace-nowrap text-xs"
		>{format(new Date(wateringEvent.timestamp), 'PPp')}</Table.Cell
	>
	<Table.Cell>
		<div>
			{wateringEvent.notes}
		</div>
		<div>
			{#if wateringEvent.image_url}
				<a href={wateringEvent.image_url} target="_blank">
					<img src={wateringEvent.image_url} />
				</a>
			{/if}
		</div>
	</Table.Cell>
	<Table.Cell class="text-center">{wateringEvent.watered ? '💧' : ''}</Table.Cell>
	<Table.Cell class="text-center">{wateringEvent.fertilized ? '✅' : ''}</Table.Cell>
	<Table.Cell class="text-center">{waterer}</Table.Cell>
	<Table.Cell class="text-center">
		<AlertDialog.Root>
			<AlertDialog.Trigger>
				<div class="close">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						><path
							fill="currentColor"
							d="m12 12.708l-5.246 5.246q-.14.14-.344.15t-.364-.15t-.16-.354t.16-.354L11.292 12L6.046 6.754q-.14-.14-.15-.344t.15-.364t.354-.16t.354.16L12 11.292l5.246-5.246q.14-.14.345-.15q.203-.01.363.15t.16.354t-.16.354L12.708 12l5.246 5.246q.14.14.15.345q.01.203-.15.363t-.354.16t-.354-.16z"
						/></svg
					>
				</div>
			</AlertDialog.Trigger>
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
