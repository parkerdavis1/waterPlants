<script>
	const { fillPercentage } = $props()
	const y = $derived(100 - fillPercentage)
	// y = 0 is full
	// y = 100 is empty
	const customId = 'circleClip' + Math.floor(Math.random() * 100000000).toString()
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
	<!-- Define the circular clipping path -->
	<defs>
		<clipPath id={customId}>
			<circle cx="50" cy="50" r="40" />
		</clipPath>
	</defs>

	<!-- White circle background -->
	<circle
		cx="50"
		cy="50"
		r="40"
		fill="white"
		stroke={fillPercentage > 0 ? 'var(--dry-fill)' : 'rgb(253 186 116)'}
		stroke-width="8"
		paint-order="stroke"
	/>

	<!-- Blue rectangle that's clipped to the circle -->
	<rect x="0" {y} width="100" height="100" fill="#0066cc" clip-path={`url(#${customId})`} />
</svg>

<style>
	svg {
		display: block;
		margin: auto;
		--fill: #0284c5;
		--size: 5rem;
		--dry-fill: #e0e0e0;
		width: var(--size);
		height: var(--size);
	}
</style>
