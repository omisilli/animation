# animation

Play a keyframe when an element becomes visible — straight from markup. One
script, one stylesheet, no dependencies, framework-agnostic.

```html
<section data-pg-animation="fadeUp">…</section>
```

```sh
npm install github:omisilli/animation#v1.0.0
```

```ts
import { initAnimation } from "@plusguard/animation";
import "@plusguard/animation/index.css";

initAnimation();
```

Or from CSS, which lets you pick the cascade layer:

```css
@import "@plusguard/animation/index.css" layer(components);
```

### Without a build step

Load both halves straight from jsDelivr — no install, and the page works
when opened by double-clicking:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/omisilli/animation@v1.0.0/index.css" />

<script type="module">
    import { initAnimation } from "https://cdn.jsdelivr.net/gh/omisilli/animation@v1.0.0/dist/index.js";

    initAnimation();
</script>
```

Pin the version (`@v1.0.0`) on a live site. A pinned URL never changes;
`@1` follows the newest 1.x release.

## Files

| File              | For                                                              |
| ----------------- | ---------------------------------------------------------------- |
| `index.ts`        | TypeScript source — import it directly in a TS / bundler project |
| `index.css`       | The CSS half: hiding, playing, and the built-in keyframes        |
| `dist/index.js`   | Compiled ES module — plain HTML, no build step                   |
| `dist/index.d.ts` | Types for `dist/index.js`                                        |

Importing `dist/index.js` from your own files? Serve the page over HTTP —
browsers block module imports on `file://`.

`dist/` is committed. After editing `index.ts`, rebuild it:

```sh
npx -p typescript tsc index.ts --outDir dist --declaration --target es2020 --module es2020 --lib dom,es2020 --strict
```

## Attributes

| Attribute                    | Meaning                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| `data-pg-animation`          | Keyframe to play, without its `pg-` prefix: `fadeUp`                 |
| `data-pg-animation-duration` | Duration in ms. Default `700`                                        |
| `data-pg-animation-delay`    | Delay in ms. Default `0` — stagger a list with growing values        |
| `data-pg-animation-repeat`   | Play every time it becomes visible, not just the first time          |
| `data-pg-animation-played`   | `"true"` while it plays and after — written by animation, not by you |

## Keyframes

Named by the direction of travel.

| Value       | Movement                      |
| ----------- | ----------------------------- |
| `fadeUp`    | Rises 150px from below        |
| `fadeDown`  | Drops 45px from above         |
| `fadeLeft`  | Slides in from the right edge |
| `fadeRight` | Slides in from the left edge  |
| `fade`      | Fades in where it stands      |

Add your own with the `pg-` prefix, then name it without:

```css
@keyframes pg-slideIn {
    from {
        opacity: 0;
        transform: translate3d(24px, 0, 0);
    }
}
```

```html
<a data-pg-animation="slideIn">…</a>
```

Keyframes set only `from`, so the element ends in its own state — its own
`transform`, for example, is not overwritten.

## Styling

Change the defaults with variables, not by repeating rules:

```css
:root {
    --pg-animation-duration: 900ms;
    --pg-animation-easing: cubic-bezier(0.16, 1, 0.3, 1);
}
```

| Variable                  | Default                        |
| ------------------------- | ------------------------------ |
| `--pg-animation-duration` | `700ms`                        |
| `--pg-animation-delay`    | `0ms`                          |
| `--pg-animation-easing`   | `cubic-bezier(0.4, 0, 0.2, 1)` |

## Replaying in menus and panels

`data-pg-animation-repeat` resets the element when it leaves the viewport.
Menu items in a drawer that slides off-screen leave with it, so they replay
on every opening — whatever opens the drawer:

```html
<aside class="drawer">
    <a data-pg-animation="slideIn" data-pg-animation-repeat data-pg-animation-delay="150">Home</a>
    <a data-pg-animation="slideIn" data-pg-animation-repeat data-pg-animation-delay="220">About</a>
</aside>
```

It works when the panel is hidden by moving it out of view or by
`display: none`. A panel that only fades in place (`opacity: 0`) never
leaves the viewport, so the browser keeps calling it visible. For that case,
take the animation away while your panel is closed — the browser replays it
from the start when the rule stops matching:

```css
.panel:not(.is-open) [data-pg-animation] {
    animation-name: none;
}
```

## Behaviour

- **Visibility, not scroll events.** An `IntersectionObserver` reports when
  an element crosses the viewport. Nothing runs while you scroll, and smooth
  scrolling libraries that move the real page (Lenis) work as they are.
- **Elements added later** — a route change, a loaded list — are picked up
  by a `MutationObserver`.
- **No JavaScript, no hiding.** Elements are hidden only under
  `@media (scripting: enabled)`, so a page without the script still shows
  everything.
- **Reduced motion.** With `prefers-reduced-motion: reduce` nothing is hidden
  and nothing moves.
- **Skipped elements.** A jump past an element (an anchor link to the
  bottom) never makes it visible, so it plays when you scroll back to it.
- Elements visible on load are hidden until the script runs, then play.

## React

Call `initAnimation` once, in an effect — it returns its own cleanup:

```tsx
useEffect(() => initAnimation(), []);
```

Do not render `data-pg-animation-played` yourself; animation owns it.

See [`examples/react/Example.tsx`](examples/react/Example.tsx). A plain HTML
version is in [`examples/static/index.html`](examples/static/index.html).
