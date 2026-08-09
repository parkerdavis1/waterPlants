<script lang="ts">
	import NewPlantForm from 'src/lib/components/NewPlantForm.svelte'

	const { data } = $props()
</script>

<NewPlantForm {data} />
