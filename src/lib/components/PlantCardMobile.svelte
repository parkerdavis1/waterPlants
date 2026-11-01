<script lang="ts">
	import Button from './ui/button/button.svelte'
	import bluegrad from '#lib/assets/images/bluegrad.png'
	import CfImage from './CfImage.svelte'
	import { checkedObj } from '../stores/selectedPlants.svelte'
	import { Checkbox } from '#lib/components/ui/checkbox/index.js'
	import WaterProgress2 from './WaterProgress2.svelte'

	const {
		plantWater,
		daysSinceLastWatered,
		waterProgressPercent,
		imageUrl,
		context,
		showPlantCare,
		className,
	} = $props()
</script>

<div
	class={`click flex w-full justify-between gap-4 rounded-lg p-2 ${className} ${$checkedObj[plantWater.plant.id] ? 'bg-blue-100' : ''}`}
>
	<div class="flex justify-between gap-2">
		{#if context === 'list'}
			<Checkbox
				bind:checked={$checkedObj[plantWater.plant.id]}
				class="size-6 self-center rounded-full"
			/>
		{:else}
			<span></span>
		{/if}
		<div class="w-fullgrid relative place-content-center">
			<a href={`${plantWater.plant.id}`}>
				{#if imageUrl}
					<div
						class="grid h-full max-h-20 w-32 place-content-center rounded-lg bg-blue-100 text-black/60"
					>
						<CfImage
							src={imageUrl}
							alt="placeholder"
							width={128}
							height={80}
							class={`mx-auto aspect-square ${context === 'list' ? 'max-h-20' : ''} min-h-16 w-32 rounded-lg object-cover`}
						/>
						<p
							class="z-10 h-fit overflow-hidden text-ellipsis whitespace-nowrap bg-background/80 text-center"
						>
							{#if plantWater.plant.name}
								{plantWater.plant.name} - {plantWater.plant.species}
							{:else}
								{plantWater.plant.species}
							{/if}
						</p>
					</div>
				{:else}
					<p
						class="grid h-full max-h-20 w-32 place-content-center rounded-lg bg-accent text-foreground"
					>
						{#if plantWater.plant.name}
							{plantWater.plant.name} - {plantWater.plant.species}
						{:else}
							{plantWater.plant.species}
						{/if}
					</p>
				{/if}
			</a>
		</div>
	</div>

	<div class="flex justify-end gap-4">
		<div class="flex flex-col items-center justify-start">
			{#if plantWater.plant.alive}
				<a href={`${plantWater.plant.id}`}>
					<WaterProgress2
						fillPercentage={waterProgressPercent}
						customId={'mobile_clip_id_' + plantWater.plant.id}
					/>
				</a>
			{:else}
				<p class="text-sm opacity-60">Dead</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.plant-card {
		display: grid;
		width: 100%;
		grid-template-columns: auto 8rem minmax(0, 1fr);
		gap: 1rem;
		justify-content: center;
	}

	.progress-ring {
		--size: 2rem;
	}

	@media (max-width: 450px) {
		.plant-card {
			grid-template-columns: 1fr;
		}
	}

	p {
		color: hsl(var(--foreground));
	}
</style>
