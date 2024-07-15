<script>
	export let progress = 0; // 0 to 100

	$: waveHeight = 100 - progress;

	const radius = 45;
	const circumference = 2 * Math.PI * radius;
</script>

<svg viewBox="0 0 100 100">
	<defs>
		<clipPath id="circle-clip">
			<circle cx="50" cy="50" r={radius} />
		</clipPath>

		<pattern id="wave-pattern" x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
			<path d="M0 5 Q 5 0, 10 5 T 20 5" fill="none" stroke="var(--fill)" stroke-width="2" />
		</pattern>
	</defs>

	<rect
		x="0"
		y={waveHeight}
		width="100"
		height="100"
		clip-path="url(#circle-clip)"
		fill="var(--fill)"
		>#0284c5
		<!-- fill="url(#wave-pattern)" -->
		<!-- <animate attributeName="y" from="100" to="-20" dur="2s" repeatCount="indefinite" /> -->
	</rect>
	<circle
		cx="50"
		cy="50"
		r={radius}
		fill="none"
		stroke={progress <= 0 ? 'var(--dry-fill)' : '#e0e0e0'}
		stroke-width="6"
	/>

	<!-- <circle
		cx="60"
		cy="60"
		r={radius}
		fill="none"
		stroke="#3498db"
		stroke-width="4"
		stroke-dasharray={circumference}
		stroke-dashoffset={circumference * (1 - progress / 100)}
		transform="rotate(-90 60 60)"
	/> -->
</svg>

<style>
	svg {
		display: block;
		margin: auto;
		--fill: #0284c5;
		--size: 4rem;
		--dry-fill: #e0e0e0;
		width: var(--size);
		height: var(--size);
	}
</style>
