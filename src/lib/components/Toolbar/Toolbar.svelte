<script>
	import Button from '../ui/button/button.svelte'
	import * as Select from '../ui/select'
	import AddNewPlant from './AddNewPlant.svelte'

	export let data
</script>

<div class="my-4 flex gap-2">
	<!-- <Select.Root portal={null}>
		<Select.Trigger class="w-[180px]">
			<Select.Value placeholder="Inside / Outside" />
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				<Select.Item value="inside" label="Inside">Inside</Select.Item>
				<Select.Item value="outside" label="Outside">Outside</Select.Item>
			</Select.Group>
		</Select.Content>
		<Select.Input name="insideOutside" />
	</Select.Root> -->
	<!-- <AddNewPlant {data} /> -->
	<a href="/new/plant"><Button>Add New Plant</Button></a>
</div>
