<script lang="ts">
	import { Switch } from '$lib/components/ui/switch'
	import { Label } from '$lib/components/ui/label'
	import { Button } from '$lib/components/ui/button'
	import { toast } from 'svelte-sonner'
	import { onMount } from 'svelte'
	import {
		getExistingSubscription,
		pushSupported,
		subscribeToPush,
		unsubscribeFromPush,
	} from '$lib/pushClient'

	const { data } = $props()

	let supported = $state(true)
	let enabled = $state(false)
	let loading = $state(true)
	let isStandalone = $state(true)
	let testSending = $state(false)
	let checkRunning = $state(false)

	onMount(async () => {
		supported = pushSupported()
		isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			(navigator as unknown as { standalone?: boolean }).standalone === true

		if (supported) {
			const subscription = await getExistingSubscription()
			enabled = !!subscription
		}
		loading = false
	})

	async function onToggle(next: boolean) {
		loading = true
		try {
			if (next) {
				await subscribeToPush()
				enabled = true
				toast.success('Notifications enabled')
			} else {
				await unsubscribeFromPush()
				enabled = false
				toast.success('Notifications disabled')
			}
		} catch (error) {
			console.error(error)
			toast.error(error instanceof Error ? error.message : 'Something went wrong')
			enabled = !next
		} finally {
			loading = false
		}
	}

	async function sendTestNotification() {
		testSending = true
		try {
			const res = await fetch('/api/push/test', { method: 'POST' })
			if (!res.ok) throw new Error('Request failed')
			toast.success('Test notification sent — check your device')
		} catch (error) {
			console.error(error)
			toast.error('Failed to send test notification')
		} finally {
			testSending = false
		}
	}

	async function runCheckNow() {
		checkRunning = true
		try {
			const res = await fetch('/api/push/check-now', { method: 'POST' })
			if (!res.ok) throw new Error('Request failed')
			const { sentCount } = await res.json()
			if (sentCount > 0) {
				toast.success(`Sent a reminder for ${sentCount} overdue plant(s)`)
			} else {
				toast.info('No plants are currently overdue')
			}
		} catch (error) {
			console.error(error)
			toast.error('Failed to run watering check')
		} finally {
			checkRunning = false
		}
	}
</script>

<svelte:head>
	<title>Settings - Happy Plants</title>
</svelte:head>

<div class="mx-auto max-w-md space-y-6 py-8">
	<h1 class="text-xl font-bold">Settings</h1>

	<div class="space-y-2 rounded-lg border p-4">
		<div class="flex items-center justify-between">
			<Label for="push-toggle">Watering reminders</Label>
			<Switch
				id="push-toggle"
				checked={enabled}
				disabled={loading || !supported}
				onCheckedChange={onToggle}
			/>
		</div>
		<p class="text-sm opacity-70">
			Get a push notification when your plants are due for watering.
		</p>

		{#if !supported}
			<p class="text-sm text-red-500">
				Push notifications aren't supported in this browser.
			</p>
		{:else if !isStandalone}
			<p class="text-sm text-amber-500">
				On iPhone/iPad, add Happy Plants to your Home Screen first (Share &rarr; Add to Home
				Screen), then open it from there to enable notifications.
			</p>
		{/if}
	</div>

	{#if enabled}
		<div class="space-y-3 rounded-lg border p-4">
			<h2 class="font-semibold">Testing tools</h2>
			<div class="flex items-center justify-between gap-2">
				<p class="text-sm opacity-70">Send a test push to just this device.</p>
				<Button size="sm" variant="outline" disabled={testSending} onclick={sendTestNotification}>
					{testSending ? 'Sending…' : 'Send test'}
				</Button>
			</div>

			{#if data.isDev}
				<div class="flex items-center justify-between gap-2">
					<p class="text-sm opacity-70">
						Run the real watering check now (sends to everyone, if plants are overdue).
					</p>
					<Button size="sm" variant="outline" disabled={checkRunning} onclick={runCheckNow}>
						{checkRunning ? 'Running…' : 'Run check now'}
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</div>

