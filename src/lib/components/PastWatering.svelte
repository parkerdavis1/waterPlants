<script lang="ts">
	import { format } from 'date-fns'
	import * as Table from '$lib/components/ui/table/index.js'
	import PastWateringRow from './PastWateringRow.svelte'

	let { data } = $props()
</script>

<!-- <pre>{JSON.stringify(data.wateringEvents, null, 2)}</pre> -->

<Table.Root>
	<!-- <Table.Caption>Recent Watering Events</Table.Caption> -->
	<Table.Header>
		<Table.Row>
			<Table.Head class="min-w-32">Date</Table.Head>
			<Table.Head class="min-w-48">Notes</Table.Head>
			<Table.Head>Water</Table.Head>
			<Table.Head>Fert.</Table.Head>
			<Table.Head>Wait Until</Table.Head>
			<Table.Head>User</Table.Head>
			<Table.Head class="text-center">🗑️</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each data.wateringEvents.sort((a, b) => b.timestamp - a.timestamp) as event (event.id)}
			<PastWateringRow wateringEvent={event} {data} />
		{/each}
	</Table.Body>
</Table.Root>
