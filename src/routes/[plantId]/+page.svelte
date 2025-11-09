<script lang="ts">
	import Separator from 'src/lib/components/ui/separator/separator.svelte'
	import WaterButtonDialog from 'src/lib/components/WaterButtonDialog.svelte'
	import EditButtonDialog from 'src/lib/components/EditButtonDialog.svelte'
	import PastWatering from 'src/lib/components/PastWatering.svelte'
	import bluegrad from '$lib/assets/images/bluegrad.png'
	import WaterProgress2 from 'src/lib/components/WaterProgress2.svelte'
	import Lightbox from 'src/lib/components/Lightbox.svelte'

	const { data } = $props()

	const room_name = data.rooms.find((room) => room.id === data.plant.room_id).name

	const title = data.plant.name
		? `${data.plant.name} (${data.plant.species}) - Happy Plants`
		: `${data.plant.species} - Happy Plants`
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="mt-8 flex flex-col gap-4">
	<div class="sm:grid sm:grid-cols-2 sm:justify-items-center sm:gap-4">
		<!-- Image -->
		<div class="relative">
			<Lightbox
				url={data.plant.image_url ? data.plant.image_url : bluegrad}
				className="mx-auto aspect-square min-h-16 w-full max-w-80 rounded-lg object-cover"
			/>
		</div>
		<div class="mx-auto flex w-full items-center justify-evenly gap-4 sm:flex-col">
			<div class="sm:order-2">
				<!-- Species -->
				<h1 class="name-wrap text-xl font-bold">{data.plant.species}</h1>

				<!-- Name -->
				{#if data.plant.name}
					<p><span class="opacity-60">Name:</span> {data.plant.name}</p>
				{/if}

				<!-- Room -->
				<p><span class="opacity-60">Location:</span> {room_name}</p>

				<!-- Watering Schedule -->
				<p>
					<span class="opacity-60">Watering Schedule: </span> Every {data.plant.water_schedule} days
				</p>
				{#if isNaN(data.plant?.daysSinceLastWatered)}
					<p><span class="opacity-60">No watering events recorded</span></p>
				{:else}
					<p>
						<span class="opacity-60">Days since last watered:</span>
						{data.plant?.daysSinceLastWatered}
						{data.plant?.daysSinceLastWatered === 1 ? 'day' : 'days'}
					</p>
				{/if}
			</div>

			<!-- Watering Progress -->
			<div class="sm:order-1">
				{#if data.plant.alive}
					<WaterProgress2 fillPercentage={data.plant?.waterProgressPercent} />
				{:else}
					<p class="text-sm opacity-60">Dead</p>
				{/if}
			</div>
		</div>
	</div>
	<div class="flex w-full gap-4">
		<WaterButtonDialog {data} />
		<EditButtonDialog {data} />
	</div>
	<Separator />
	<div>
		<h2 class="text-xl font-bold">Care Notes</h2>
		<div class="whitespace-pre-wrap">
			{data.plant.notes}
		</div>
	</div>
	<Separator />
	<h2 class="text-xl font-bold">Past Watering Events</h2>
	<PastWatering {data} />
	<div class="grid gap-4 sm:grid-cols-3"></div>
</div>
