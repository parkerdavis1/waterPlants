# Flexoki Color Scheme Migration

Source palette: https://github.com/kepano/flexoki

Goals:
1. Replace the app's shadcn-style CSS variable tokens (light + dark) with Flexoki colors.
2. Tokenize the handful of components that use hardcoded hex colors instead of the CSS variables.
3. Update the PWA manifest theme colors.
4. Wire up dark mode (currently defined in CSS but never activated) using the already-installed `mode-watcher` package.

Decisions already made:
- Accent color: neutral Flexoki base tone (not a colored tint).
- Watering progress indicators: `--primary` (blue) = watered/fill, `--muted` = dry/empty track.
- Dark mode: fully wire up with a toggle, not just leave the CSS dormant.

---

## Step 1: Replace color tokens in `src/app.css`

Replace the entire `@layer base { :root { ... } .dark { ... } }` block (lines 5-73) with the Flexoki-based values below. This removes the dead duplicate `--primary` declaration and stray commented-out values from the original file.

```css
@layer base {
	:root {
		/* Flexoki light mode: paper background, base-scale neutrals, 600-weight accents */
		--background: 48 100% 97.1%; /* paper #FFFCF0 */
		--foreground: 0 3.2% 6.1%; /* black #100F0F */

		--muted: 50.8 20.6% 87.6%; /* base-100 #E6E4D9 */
		--muted-foreground: 50 2.8% 42.4%; /* base-600 #6F6E69 */

		--popover: 48 100% 97.1%; /* paper #FFFCF0 */
		--popover-foreground: 0 3.2% 6.1%; /* black #100F0F */

		--card: 48 100% 97.1%; /* paper #FFFCF0 */
		--card-foreground: 0 3.2% 6.1%; /* black #100F0F */

		--border: 54.5 10.1% 78.6%; /* base-200 #CECDC3 */
		--input: 54.5 10.1% 78.6%; /* base-200 #CECDC3 */

		--primary: 212.2 67.7% 38.8%; /* blue-600 #205EA6 */
		--primary-foreground: 48 100% 97.1%; /* paper #FFFCF0 */

		--secondary: 73.3 84.2% 27.3%; /* green-600 #66800B */
		--secondary-foreground: 48 100% 97.1%; /* paper #FFFCF0 */

		--accent: 50.8 33.3% 92.4%; /* base-50 #F2F0E5 */
		--accent-foreground: 0 3.2% 6.1%; /* black #100F0F */

		--destructive: 3.1 62% 42.4%; /* red-600 #AF3029 */
		--destructive-foreground: 48 100% 97.1%; /* paper #FFFCF0 */

		--ring: 0 3.2% 6.1%; /* black #100F0F */

		--radius: 0.5rem;
	}

	.dark {
		/* Flexoki dark mode: black background, base-scale neutrals, 400-weight accents */
		--background: 0 3.2% 6.1%; /* black #100F0F */
		--foreground: 50.8 33.3% 92.4%; /* base-50 #F2F0E5 */

		--muted: 30 2.6% 15.3%; /* base-900 #282726 */
		--muted-foreground: 46.7 4.5% 60.6%; /* base-400 #9F9D96 */

		--popover: 30 3.7% 10.6%; /* base-950 #1C1B1A */
		--popover-foreground: 50.8 33.3% 92.4%; /* base-50 #F2F0E5 */

		--card: 30 3.7% 10.6%; /* base-950 #1C1B1A */
		--card-foreground: 50.8 33.3% 92.4%; /* base-50 #F2F0E5 */

		--border: 30 3.2% 24.3%; /* base-800 #403E3C */
		--input: 30 3.2% 24.3%; /* base-800 #403E3C */

		--primary: 207.8 48.6% 50.4%; /* blue-400 #4385BE */
		--primary-foreground: 0 3.2% 6.1%; /* black #100F0F */

		--secondary: 71.8 46% 41.4%; /* green-400 #879A39 */
		--secondary-foreground: 0 3.2% 6.1%; /* black #100F0F */

		--accent: 40 3% 19.8%; /* base-850 #343331 */
		--accent-foreground: 50.8 33.3% 92.4%; /* base-50 #F2F0E5 */

		--destructive: 5 61% 53.7%; /* red-400 #D14D41 */
		--destructive-foreground: 0 3.2% 6.1%; /* black #100F0F */

		--ring: 50.8 33.3% 92.4%; /* base-50 #F2F0E5 */
	}
}
```

Leave the second `@layer base { ... }` block (lines 75-113, the `* { @apply border-border }`, `body`, `.name-wrap`, `.click`, keyframes, etc.) unchanged.

**Verify:** run the dev server and confirm the page background/text render as warm off-white/near-black instead of the old cream/blue scheme.

---

## Step 2: Tokenize `WaterProgress.svelte`

File: `src/lib/components/WaterProgress.svelte`

Current hardcoded colors: `#EEEEEE`, `rgb(253 186 116)`, `#0284c5`, `#e0e0e0`, plus a stray literal text node `#0284c5` inside the `<rect>` (looks like a leftover debug artifact — remove it).

Changes:
- Line 17: `fill="#EEEEEE"` → `fill="hsl(var(--muted))"`
- Line 24 and line 38 (duplicated in the commented-out block): `stroke={progress > 0 ? 'var(--dry-fill)' : 'rgb(253 186 116)'}` → `stroke={progress > 0 ? 'var(--dry-fill)' : 'hsl(var(--muted))'}`
- Lines 42-46: remove the stray `#0284c5` text node that renders inside the `<rect>` element:
  ```svelte
  <rect x="0" y={waveHeight} width="100" height="100" fill="var(--fill)" id={clipId}
  	>#0284c5
  	<!-- fill="url(#wave-pattern)" -->
  	<!-- <animate attributeName="y" from="100" to="-20" dur="2s" repeatCount="indefinite" /> -->
  </rect>
  ```
  becomes:
  ```svelte
  <rect x="0" y={waveHeight} width="100" height="100" fill="var(--fill)" id={clipId}>
  	<!-- fill="url(#wave-pattern)" -->
  	<!-- <animate attributeName="y" from="100" to="-20" dur="2s" repeatCount="indefinite" /> -->
  </rect>
  ```
- Style block (lines 62-71): update CSS custom properties to reference tokens:
  ```css
  svg {
  	display: block;
  	margin: auto;
  	--fill: hsl(var(--primary));
  	--size: 4rem;
  	--dry-fill: hsl(var(--muted));
  	width: var(--size);
  	height: var(--size);
  }
  ```

**Verify:** the "watered" fill renders as Flexoki blue, the dry track/outline renders as the muted neutral, no stray "#0284c5" text appears on screen.

---

## Step 3: Tokenize `WaterProgress2.svelte`

File: `src/lib/components/WaterProgress2.svelte`

- Style block (lines 93-105): replace with tokenized values, drop the redundant/overridden `--dry-fill` declarations (currently declared three times):
  ```css
  svg {
  	display: block;
  	margin: auto;
  	--fill: hsl(var(--primary));
  	--size: 5rem;
  	--circle: hsl(var(--primary));
  	--dry-fill: hsl(var(--muted));
  	width: var(--size);
  	height: var(--size);
  }
  ```
- Line 74 has a pre-existing bug (missing closing paren): `fill="hsl(var(--background)"` → `fill="hsl(var(--background))"`.

**Verify:** same fill/dry-track colors as WaterProgress.svelte, and the background circle renders correctly now that the syntax error is fixed.

---

## Step 4: Tokenize `RadialProgress.svelte`

File: `src/lib/components/RadialProgress.svelte`

- Line 24: `stroke="#e0e0e0"` → `stroke="hsl(var(--muted))"`
- Line 33 already uses `stroke="hsl(var(--primary))"` — no change needed.

**Verify:** the background track of the radial progress ring uses the muted neutral instead of a hardcoded gray.

---

## Step 5: `Lightbox.svelte` — no change required

File: `src/lib/components/Lightbox.svelte`

The `dialog::backdrop { background: rgb(0 0 0 / 0.75); }` (line 46) is theme-agnostic (works fine over both light and dark content) — leave as-is per plan. `dialog` and `button` already use `var(--background)` / `hsl(var(--background))` tokens (lines 42, 51) — no change needed there either.

---

## Step 6: Tokenize `ImageUploader.svelte`

File: `src/lib/components/ImageUploader.svelte`

The `.select-image-button` class (lines 122-139) with hardcoded `#007bff`/`#0056b3` appears to be **unused dead CSS** — no element in the template has this class (the actual button is the shadcn `<Button variant="outline">` component). Options:

- **Recommended:** delete the unused `.select-image-button` rule block entirely (lines 122-139), since it's dead code.
- If you want to keep it for future use, tokenize instead:
  ```css
  .select-image-button {
  	background-color: hsl(var(--primary));
  	color: hsl(var(--primary-foreground));
  }
  .select-image-button:hover,
  .select-image-button:focus {
  	background-color: hsl(var(--primary) / 0.85);
  }
  ```

**Verify:** confirm removing it doesn't change any rendered UI (search the file/template first to double check the class truly isn't referenced elsewhere).

---

## Step 7: Fix `+layout.svelte`

File: `src/routes/+layout.svelte`

- Line 51: remove the one-off, non-tokenized dark mode classes:
  ```svelte
  <div class="container flex h-screen max-w-6xl flex-col pt-8 dark:bg-gray-800 dark:text-white">
  ```
  becomes:
  ```svelte
  <div class="container flex h-screen max-w-6xl flex-col pt-8">
  ```
  (The `bg-background text-foreground` are already applied globally to `body` via `app.css` line 81 (`@apply bg-background text-foreground`), so this container doesn't need its own background/text classes — the old `dark:bg-gray-800` was redundant/inconsistent with the token system and actively fought against it.)

- Line 100 (style block): `background-color: #0284c5;` → `background-color: hsl(var(--primary));` for the `.navigation-loader` bar.

**Verify:** page navigation loading bar still shows the blue accent color in both light and dark mode; container no longer has a hardcoded gray-800 background fighting the theme.

---

## Step 8: Update `static/manifest.webmanifest`

File: `static/manifest.webmanifest`

Change:
```json
"theme_color": "#FFDDAA",
"background_color": "#FFDDAA",
```
to:
```json
"theme_color": "#FFFCF0",
"background_color": "#FFFCF0",
```
(Flexoki `paper`, matching the new light-mode `--background`.)

**Verify:** reinstall/reload the PWA (or check browser dev tools Application tab) to confirm the manifest reflects the new color; this mainly affects mobile browser chrome/splash screen, low risk.

---

## Step 9: Wire up dark mode toggle

Package `mode-watcher` (`^0.5.1`) is already a dependency but unused.

1. In `src/routes/+layout.svelte`:
   - Add import: `import { ModeWatcher, toggleMode } from 'mode-watcher'`
   - Render `<ModeWatcher />` once near the top of the markup (e.g. right after `<Toaster richColors />` on line 49), so it manages the `dark` class on `<html>` and persists the preference.
2. Add a toggle button in the header (near the existing `DropdownMenu` for settings/logout, around lines 52-82). Simplest option: add a button with a sun/moon icon (lucide-svelte already installed, e.g. `Sun`, `Moon` icons) that calls `toggleMode()` on click. Example:
   ```svelte
   import { Sun, Moon } from 'lucide-svelte'
   ...
   <Button variant="ghost" size="icon" onclick={toggleMode}>
   	<Sun class="h-5 w-5 dark:hidden" />
   	<Moon class="hidden h-5 w-5 dark:block" />
   </Button>
   ```
   Place this button next to the existing header controls (inside the `<header class="flex justify-between">` div, before or after the `DropdownMenu.Root`).
3. Confirm `tailwind.config.ts`'s `darkMode: ['class']` and `safelist: ['dark']` (already present, lines 6 & 8) are compatible with `mode-watcher`'s class-based approach — no changes needed there.

**Verify:**
- Toggle switches the whole app between light/dark Flexoki palettes.
- Preference persists across page reloads (mode-watcher uses localStorage by default).
- No flash-of-wrong-theme on initial load (mode-watcher handles this by injecting a blocking script — confirm this behavior works in the SvelteKit setup, may require adding `import { ModeWatcher } from 'mode-watcher'` at the root layout level only, not per-page).

---

## Step 10: Final visual QA pass

After all edits, run the dev server (`npm run dev` or equivalent) and manually check, in both light and dark mode:
- Home / plant list page — card backgrounds, borders, muted text legibility.
- Plant detail page — `WaterProgress`/`WaterProgress2`/`RadialProgress` components render with correct blue fill / neutral dry-track.
- Any dialogs/sheets/dropdowns (uses `popover`/`card` tokens) — check contrast against new dark `base-950` popover background.
- Destructive actions/buttons (delete confirmations) — check red-600/red-400 render correctly and remain accessible (sufficient contrast).
- Toggle button itself is visible/clickable in header in both modes.
- `+layout.svelte` navigation loading bar color.

If any contrast issues are found (e.g. `muted-foreground` too light on `background` in dark mode), consider bumping to an adjacent Flexoki base step (e.g. base-300/base-500 instead of base-400) rather than deviating from the palette.
