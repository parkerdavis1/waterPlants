<script lang="ts">
	import Check from '@lucide/svelte/icons/check'
	import { Select as SelectPrimitive, type WithoutChild } from 'bits-ui'
	import { cn } from '#lib/utils.js'

	let {
		ref = $bindable(null),
		class: className,
		value,
		label,
		children: childrenProp,
		...restProps
	}: WithoutChild<SelectPrimitive.ItemProps> = $props()

	// bits-ui calls `.trim()` on the label, so it must always be a string even if a
	// caller passes a numeric value (and omits the label).
	const itemLabel = $derived(label == null ? String(value) : String(label))
</script>

<SelectPrimitive.Item
	bind:ref
	{value}
	label={itemLabel}
	class={cn(
		'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50',
		className,
	)}
	{...restProps}
>
	{#snippet children({ selected, highlighted })}
		<span class="absolute left-2 flex size-3.5 items-center justify-center">
			{#if selected}
				<Check class="size-4" />
			{/if}
		</span>
		{#if childrenProp}
			{@render childrenProp({ selected, highlighted })}
		{:else}
			{label || value}
		{/if}
	{/snippet}
</SelectPrimitive.Item>
