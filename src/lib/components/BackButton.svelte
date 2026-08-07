<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	let { fallback = '/' }: { fallback?: string } = $props()

	function goBack() {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			window.history.back()
		} else {
			goto(fallback)
		}
	}
</script>

{#if page.url.pathname !== '/'}
	<button
		type="button"
		onclick={goBack}
		aria-label="Back"
		class="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur hover:bg-white dark:bg-gray-700/90 dark:hover:bg-gray-700"
	>
		<ArrowLeft class="h-5 w-5" />
	</button>
{/if}
