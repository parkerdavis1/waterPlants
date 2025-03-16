<script lang="ts">
	import CalendarIcon from 'lucide-svelte/icons/calendar'
	import {
		type DateValue,
		DateFormatter,
		getLocalTimeZone,
		today,
		now,
	} from '@internationalized/date'
	import { cn } from '$lib/utils.js'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Calendar } from '$lib/components/ui/calendar/index.js'
	import * as Popover from '$lib/components/ui/popover/index.js'
	import { Label } from './ui/label'
	import { Input } from './ui/input'

	const { form } = $props()

	const df = new DateFormatter('en-US', {
		dateStyle: 'long',
		// timeStyle: 'short',
	})

	let value = $state<DateValue>(today(getLocalTimeZone()))
	let time = $state(new Date().toTimeString().slice(0, 5))

	$effect(() => {
		$form.timestamp = new Date(
			value.year,
			value.month - 1,
			value.day,
			Number(time.slice(0, 2)),
			Number(time.slice(3, 5)),
		).getTime()
	})

	$inspect(time)

	let datePickerOpen = $state(false)
</script>

<Popover.Root bind:open={datePickerOpen}>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				variant="outline"
				class={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground')}
				{...props}
			>
				<CalendarIcon class="mr-2 size-4" />
				{value ? df.format(value.toDate(getLocalTimeZone())) : 'Select a date'}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
		<div class="p-3">
			<Label for="time">Time</Label>
			<Input type="time" id="time" bind:value={time} />
		</div>
		<Calendar
			bind:value
			type="single"
			initialFocus
			onValueChange={(value) => (value ? (datePickerOpen = false) : null)}
			preventDeselect={true}
		/>
	</Popover.Content>
</Popover.Root>
