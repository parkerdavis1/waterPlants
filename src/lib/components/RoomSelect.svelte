<script lang="ts">
	import * as Select from '#lib/components/ui/select/index.js'

	type Room = { id: number; name: string }

	let {
		rooms = [],
		value = $bindable(),
		name = 'room_id',
		class: className = 'w-[180px]',
	}: {
		rooms?: Room[]
		value: number
		name?: string
		class?: string
	} = $props()

	const selectedName = $derived(
		rooms.find((room) => room.id === value)?.name ?? 'Select a room',
	)

	// bits-ui Select values must be strings; the form keeps room_id as a number.
	const stringValue = $derived(String(value))

	function handleValueChange(next: string) {
		if (next) value = Number(next)
	}
</script>

<Select.Root value={stringValue} onValueChange={handleValueChange} type="single">
	<Select.Trigger class={className}>
		{selectedName}
	</Select.Trigger>
	<Select.Content>
		{#each rooms as room (room.id)}
			<Select.Item value={String(room.id)} label={room.name}>{room.name}</Select.Item>
		{/each}
	</Select.Content>
	<input type="hidden" {name} value={value} />
</Select.Root>
