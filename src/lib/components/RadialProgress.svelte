<script lang="ts">
	export let progress: number = 0;

	// Ensure progress is between 0 and 100
	$: clampedProgress = Math.round(Math.min(Math.max(progress, 0), 100));

	// Calculate the stroke-dasharray and stroke-dashoffset
	const radius = 45;
	const circumference = 2 * Math.PI * radius;
	$: dashOffset = circumference - (clampedProgress / 100) * circumference;
</script>

<div class="radial-progress">
	<svg viewBox="0 0 120 120">
		<circle
			class="progress-background"
			cx="60"
			cy="60"
			r={radius}
			fill="none"
			stroke="#e0e0e0"
			stroke-width="10"
		/>
		<circle
			class="progress-bar"
			cx="60"
			cy="60"
			r={radius}
			fill="none"
			stroke="hsl(var(--primary))"
			stroke-width="10"
			stroke-linecap="round"
			stroke-dasharray={circumference}
			stroke-dashoffset={dashOffset}
			transform="rotate(-90 60 60)"
		/>
		<!-- <text x="60" y="60" text-anchor="middle" dominant-baseline="central" font-size="24">
			{clampedProgress}%
		</text> -->
	</svg>
</div>

<style>
	.radial-progress {
		display: inline-block;
	}

	.progress-bar {
		transition: stroke-dashoffset 0.3s ease;
	}
	svg {
		height: 4rem;
		width: 4rem;
	}
</style>
