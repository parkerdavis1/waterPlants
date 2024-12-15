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
			<Table.Head>Date</Table.Head>
			<Table.Head>Notes</Table.Head>
			<Table.Head>Watered</Table.Head>
			<Table.Head>Fertilized</Table.Head>
			<Table.Head>Waterer</Table.Head>
			<Table.Head class="text-center">🗑️</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each data.wateringEvents as event}
			<PastWateringRow wateringEvent={event} {data} />
		{/each}
	</Table.Body>
</Table.Root>
