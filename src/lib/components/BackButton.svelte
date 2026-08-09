<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left'
	import RefreshCw from '@lucide/svelte/icons/refresh-cw'
	import { goto } from '$app/navigation'

	let { fallback = '/' }: { fallback?: string } = $props()

	let displayButtons = false
	if (typeof window !== 'undefined') {
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches
		displayButtons = isStandalone ? true : false
	}

	function goBack() {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			window.history.back()
		} else {
			goto(fallback)
		}
	}

	function refresh() {
		window.location.reload()
	}
</script>

{#if displayButtons}
	<div class="fixed bottom-4 left-4 z-40 flex gap-2">
		<button
			type="button"
			onclick={goBack}
			aria-label="Back"
			class="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur hover:bg-white dark:bg-gray-700/90 dark:hover:bg-gray-700"
		>
			<ArrowLeft class="h-5 w-5" />
		</button>
		<button
			type="button"
			onclick={refresh}
			aria-label="Refresh"
			class="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur hover:bg-white dark:bg-gray-700/90 dark:hover:bg-gray-700"
		>
			<RefreshCw class="h-5 w-5" />
		</button>
	</div>
{/if}
