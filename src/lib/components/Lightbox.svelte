<script lang="ts">
	import { format } from 'date-fns'
	import { untrack } from 'svelte'
	import { X } from '@lucide/svelte'
	import CfImage from './CfImage.svelte'
	import * as Carousel from './ui/carousel/index.js'
	import type { CarouselAPI } from './ui/carousel/context.js'
	import type { PlantPhoto } from '#src/lib/utils/getPlantPhotos.js'

	type GallerySlide = {
		id: number | string
		url: string
		timestamp: number | null
		notes: string | null
	}

	let {
		url,
		photos = [],
		initialIndex = 0,
		className = '',
	}: {
		url: string
		photos?: PlantPhoto[]
		initialIndex?: number
		className?: string
	} = $props()

	let dialog: HTMLDialogElement
	let isOpen = $state(false)
	let carouselApi = $state<CarouselAPI>()
	let currentIndex = $state(0)
	let expanded = $state(false)
	let canExpand = $state(false)
	let notesEl: HTMLElement | undefined = $state()

	const clampedInitialIndex = $derived(
		photos.length ? Math.min(Math.max(initialIndex, 0), photos.length - 1) : 0,
	)

	const slides: GallerySlide[] = $derived(
		photos.length
			? photos
			: [{ id: 'fallback', url, timestamp: null, notes: null } satisfies GallerySlide],
	)

	const currentSlide = $derived(slides[currentIndex] ?? slides[0])
	const initialPhoto = $derived(photos[clampedInitialIndex])

	const triggerLabel = $derived(
		initialPhoto
			? `View photo from ${format(new Date(initialPhoto.timestamp), 'PP')}`
			: 'View photo',
	)

	function slideAlt(slide: GallerySlide) {
		if (!slide.timestamp) return 'Plant photo'
		const date = format(new Date(slide.timestamp), 'PP')
		return slide.notes ? `Plant photo from ${date}: ${slide.notes}` : `Plant photo from ${date}`
	}

	function openGallery() {
		currentIndex = clampedInitialIndex
		expanded = false
		canExpand = false
		isOpen = true
		dialog.showModal()
	}

	function closeGallery() {
		dialog.close()
	}

	function handleClose() {
		isOpen = false
	}

	function handleDialogClick(event: MouseEvent) {
		if (event.target === dialog) dialog.close()
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.defaultPrevented) return
		if (event.key === 'ArrowLeft') {
			event.preventDefault()
			carouselApi?.scrollPrev()
		} else if (event.key === 'ArrowRight') {
			event.preventDefault()
			carouselApi?.scrollNext()
		}
	}

	function setupApi(api: CarouselAPI | undefined) {
		carouselApi = api
	}

	$effect(() => {
		const api = carouselApi
		if (!api) return

		const onSelect = () => {
			const nextIndex = api.selectedScrollSnap()
			untrack(() => {
				if (nextIndex !== currentIndex) {
					currentIndex = nextIndex
					expanded = false
					canExpand = false
				}
			})
		}

		onSelect()
		api.on('select', onSelect)
		api.on('reInit', onSelect)

		return () => {
			api.off('select', onSelect)
			api.off('reInit', onSelect)
		}
	})

	$effect(() => {
		// Re-measure whenever the slide changes or the notes element mounts.
		void currentIndex
		const el = notesEl
		if (!el || expanded) return
		canExpand = el.scrollHeight > el.clientHeight + 1
	})
</script>

<button
	type="button"
	class="block w-full cursor-pointer border-0 bg-transparent p-0"
	onclick={openGallery}
	aria-label={triggerLabel}
>
	<CfImage src={url} height={320} width={320} alt="" class={`event-thumb ${className}`} />
</button>

<dialog
	bind:this={dialog}
	onclose={handleClose}
	onclick={handleDialogClick}
	onkeydown={handleKeydown}
	aria-label="Plant photos"
	class="photo-gallery"
>
	{#if isOpen}
		<div
			class="relative h-[100svh] w-full overflow-hidden bg-neutral-950 text-neutral-50 sm:h-[90vh] sm:max-h-[900px] sm:w-[92vw] sm:max-w-[1000px] sm:rounded-2xl"
			data-testid="photo-gallery"
		>
			<!-- Top bar -->
			<div
				class="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-b from-black/60 to-transparent px-4 pb-8 pt-3 text-sm text-white/80"
			>
				<span class="tabular-nums">
					{#if slides.length > 1}
						<span data-testid="photo-gallery-counter">{currentIndex + 1} of {slides.length}</span>
					{/if}
				</span>
				<button
					type="button"
					onclick={closeGallery}
					aria-label="Close gallery"
					class="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/50"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<!-- Photos -->
			<div class="h-full w-full">
				<Carousel.Root
					opts={{ startIndex: clampedInitialIndex, loop: false, align: 'start' }}
					setApi={setupApi}
					class="h-full"
				>
					<div class="h-full [&>div]:h-full">
						<Carousel.Content class="-ml-0 h-full">
							{#each slides as photo, index (photo.id)}
								<Carousel.Item class="h-full pl-0">
									<div class="flex h-full w-full items-center justify-center">
										<CfImage
											src={photo.url}
											width={1600}
											height={1600}
											objectFit="contain"
											alt={slideAlt(photo)}
											loading={index === clampedInitialIndex ? 'eager' : 'lazy'}
											draggable={false}
											class="h-full w-full select-none object-contain"
										/>
									</div>
								</Carousel.Item>
							{/each}
						</Carousel.Content>
					</div>

					{#if slides.length > 1}
						<Carousel.Previous
							aria-label="Newer photo"
							variant="ghost"
							class="left-3 z-20 h-11 w-11 rounded-full border border-white/20 bg-black/40 text-white hover:bg-black/60 hover:text-white disabled:opacity-30"
						/>
						<Carousel.Next
							aria-label="Older photo"
							variant="ghost"
							class="right-3 z-20 h-11 w-11 rounded-full border border-white/20 bg-black/40 text-white hover:bg-black/60 hover:text-white disabled:opacity-30"
						/>
					{/if}
				</Carousel.Root>
			</div>

			<!-- Caption -->
			{#if currentSlide.timestamp}
				<div
					class="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/60 to-transparent px-5 pb-5 pt-16"
				>
					<div class="pointer-events-auto mx-auto w-full max-w-3xl">
						<time
							class="text-xs font-medium uppercase tracking-wide text-white/70"
							datetime={new Date(currentSlide.timestamp).toISOString()}
						>
							{format(new Date(currentSlide.timestamp), 'PP')}
						</time>
						{#if currentSlide.notes}
							<p
								bind:this={notesEl}
								class={`mt-1 whitespace-pre-wrap text-sm leading-relaxed text-white/90 ${
									expanded ? 'max-h-[40svh] overflow-y-auto' : 'line-clamp-3'
								}`}
							>
								{currentSlide.notes}
							</p>
							{#if canExpand || expanded}
								<button
									type="button"
									onclick={() => (expanded = !expanded)}
									onpointerdown={(event) => event.stopPropagation()}
									class="mt-2 text-xs font-medium text-white/90 underline underline-offset-4 hover:text-white"
								>
									{expanded ? 'Show less' : 'Show more'}
								</button>
							{/if}
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</dialog>

<style>
	dialog.photo-gallery {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: transparent;
		overflow: hidden;
	}

	dialog.photo-gallery[open] {
		display: grid;
		place-items: center;
	}

	dialog.photo-gallery::backdrop {
		background: rgb(0 0 0 / 0.75);
		backdrop-filter: blur(2px);
	}
</style>
