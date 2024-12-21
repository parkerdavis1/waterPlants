<script lang="ts">
	import NewPlantForm from 'src/lib/components/NewPlantForm.svelte'
	import Button from 'src/lib/components/ui/button/button.svelte'

	const { data } = $props()

	let isSubmitting = $state(false)
</script>

<NewPlantForm {data} />
