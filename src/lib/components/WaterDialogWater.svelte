<form
	enctype="multipart/form-data"
	action="?/water"
	method="POST"
	id={formId}
	class="flex flex-col gap-8"
	use:enhance
>
	<!-- <SuperDebug data={$form} /> -->
	<div class="self-start">
		<Label for="image">Image <span class="text-xs text-muted-foreground"> (optional)</span></Label>
		<ImageUploader {form} {constraints} />
		{#if $errors.image}<p class="text-red-500">{$errors.image}</p>{/if}
	</div>
	<div>
		<Label for="notes">Notes <span class="text-xs text-muted-foreground"> (optional)</span></Label>
		<Textarea
			placeholder="Type your message here."
			id="notes"
			name="notes"
			bind:value={$form.notes}
			{...$constraints.notes}
		/>
		{#if $errors.notes}<p class="text-red-500">{$errors.notes}</p>{/if}
	</div>
	<div class="flex items-center space-x-2">
		<Checkbox id="watered" bind:checked={$form.watered} />
		<Input type="hidden" name="watered" bind:value={$form.watered} {...$constraints.watered} />
		<Label
			for="watered"
			class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>Water</Label
		>
		{#if $errors.watered}<p class="text-red-500">{$errors.watered}</p>{/if}
	</div>
	<div class="flex items-center space-x-2">
		<Checkbox id="fertilized" bind:checked={$form.fertilized} />
		<Input
			type="hidden"
			name="fertilized"
			bind:value={$form.fertilized}
			{...$constraints.fertilized}
		/>
		<Label
			for="fertilized"
			class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>Fertilize</Label
		>
		{#if $errors.fertilized}<p class="text-red-500">{$errors.fertilized}</p>{/if}
	</div>
	<Input type="hidden" name="plant_id" value={data.plant.id} />
	<Input type="hidden" name="user_id" value={data.user.id} />
	<Button form={formId} type="submit" bind:disabled={isSubmitting}
		>Water
		{#if isSubmitting}
			<Spinner className="w-4 h-4 ml-4" />
		{/if}
	</Button>
</form>
