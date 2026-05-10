<script lang="ts">
	import { Image } from '@unpic/svelte'
	import type { ImageProps } from '@unpic/svelte'

	// All standard Image props, but src is required
	type Props = ImageProps & {
		src: string
	}

	let { src, alt = '', ...rest }: Props = $props()
</script>

<!--
  Uses Cloudflare Image Transformations as a fallback provider.
  For R2-hosted images (not auto-detected by unpic), this generates
  /cdn-cgi/image/width=X,format=auto/... URLs served from your CF zone.
  Requires "Image Transformations" to be enabled in the Cloudflare dashboard.
-->
<Image {src} {alt} fallback="cloudflare" {...rest} />
