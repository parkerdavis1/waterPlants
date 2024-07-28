<script lang="ts">
	export let data
	import NewPlantForm from 'src/lib/components/NewPlantForm.svelte'
	import Button from 'src/lib/components/ui/button/button.svelte'
</script>

<NewPlantForm {data} />
<Button type="submit" form="new-plant">Submit</Button>
