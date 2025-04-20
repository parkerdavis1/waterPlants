<script lang="ts">
	const { fillPercentage } = $props()
	const radius = 40
	function calculateFillLineY(fillPercentage: number, diameter: number) {
		// Validate input
		if (fillPercentage < 0 || fillPercentage > 100) {
			throw new Error('Fill percentage must be between 0 and 100')
		}

		// If empty or full, return immediately
		if (fillPercentage === 0) return 0
		if (fillPercentage === 100) return diameter

		const radius = diameter / 2

		// Convert percentage to decimal between 0 and 1
		const fillRatio = fillPercentage / 100

		// The formula involves finding h (height from center) where:
		// fillRatio = (θ - sin(θ)) / (2π), where θ is in radians
		// and θ = 2 * arccos((radius - h) / radius)

		// First, solve for θ numerically using the fact that fillRatio = (θ - sin(θ)) / (2π)
		const theta = findTheta(fillRatio)

		// Then solve for h using: cos(θ/2) = (radius - h) / radius
		const h = radius * (1 - Math.cos(theta / 2))

		// Convert to y-coordinate from bottom of circle
		return h
	}

	/**
	 * Finds the angle θ that satisfies the equation: fillRatio = (θ - sin(θ)) / (2π)
	 * @param {number} fillRatio - Ratio of fill (0-1)
	 * @returns {number} θ in radians
	 */
	function findTheta(fillRatio: number) {
		// For a given fill ratio r, we need to solve: r = (θ - sin(θ)) / (2π)
		// This can be rewritten as: 2πr = θ - sin(θ)

		// We can use the inverse of the function y = x - sin(x)
		// For fillRatio = 0.5, θ = π
		// For other ratios, we can use the formula:
		return 2 * Math.PI - 2 * Math.acos(2 * fillRatio - 1)
	}

	// const y = $derived(90 - calculateFillLineY(fillPercentage, 80))
	// console.log('y', y)

	// linear
	const y = $derived(91 - fillPercentage)
	// exponential
	// const y = $derived(100 - (Math.log(fillPercentage + 1) / Math.log(101)) * 100)
	// y = 0 is full
	// y = 100 is empty
	const customId = 'circleClip' + Math.floor(Math.random() * 100000000).toString()
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
	<!-- Define the circular clipping path -->
	<defs>
		<clipPath id={customId}>
			<circle cx="50" cy="50" r={radius + 1} />
		</clipPath>
	</defs>

	<!-- White circle background -->
	<!-- fill="hsla(36.867, 95.402%, 82.941%)" -->
	<circle
		cx="50"
		cy="50"
		r={radius}
		fill="hsl(var(--background)"
		stroke={fillPercentage > 0 ? 'var(--circle)' : 'var(--dry-fill)'}
		stroke-width="8"
		paint-order="stroke"
	/>

	<!-- Blue rectangle that's clipped to the circle -->
	<rect x="0" {y} width="100" height="100" fill="var(--fill)" clip-path={`url(#${customId})`} />
</svg>

<style>
	svg {
		display: block;
		margin: auto;
		--fill: #0284c5;
		--size: 5rem;
		--circle: #0284c5;
		/* --dry-fill: #e0e0e0; */
		--dry-fill: rgb(190, 129, 64);
		--dry-fill: hsla(36 95.4% 65%);
		width: var(--size);
		height: var(--size);
	}
</style>
