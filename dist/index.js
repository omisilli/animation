/*
 * animation — play a keyframe when an element becomes visible.
 *
 *   <div data-pg-animation="fadeUp">
 *   <div data-pg-animation="fadeLeft" data-pg-animation-duration="1200">
 *   <a   data-pg-animation="fadeUp" data-pg-animation-delay="80" data-pg-animation-repeat>
 *
 * The value names a keyframe without its "pg-" prefix: fadeUp plays
 * @keyframes pg-fadeUp. A theme adds its own the same way — define
 * @keyframes pg-swing, write data-pg-animation="swing".
 *
 * When the element becomes visible this file writes
 * data-pg-animation-played="true"; the CSS plays the keyframe from that
 * attribute. By default it plays once. With data-pg-animation-repeat the
 * attribute is removed again when the element leaves, so it plays every
 * time it comes back — a menu item replays on every opening, whatever
 * opens the menu.
 *
 * React: do not render data-pg-animation-played yourself — this file
 * owns it.
 */
const ATTR = "data-pg-animation";
const DURATION = "data-pg-animation-duration";
const DELAY = "data-pg-animation-delay";
const REPEAT = "data-pg-animation-repeat";
const PLAYED = "data-pg-animation-played";
/*
 * Start watching; returns the cleanup for a React effect.
 *
 * Each call owns its observers. They used to live at module level, and a
 * late cleanup from an earlier call (React remounting in development, a
 * route change) nulled the observer the newer call was using: elements
 * were still found but never watched, so they stayed hidden.
 */
export function initAnimation() {
    if (typeof document === "undefined")
        return () => { };
    /* The old code measured every element on every scroll event. The
       observer lets the browser say when one crosses the viewport instead
       — and it works the same under Lenis, which scrolls the real page. */
    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            const el = entry.target;
            const repeat = el.hasAttribute(REPEAT);
            if (entry.isIntersecting) {
                el.setAttribute(PLAYED, "true");
                if (!repeat)
                    io.unobserve(el);
            }
            else if (repeat) {
                el.removeAttribute(PLAYED);
            }
        }
    });
    const ms = (el, attr, prop) => {
        const value = el.getAttribute(attr);
        if (value)
            el.style.setProperty(prop, `${value}ms`);
    };
    const track = (el) => {
        if (!(el instanceof HTMLElement))
            return;
        if (el.hasAttribute(PLAYED) && !el.hasAttribute(REPEAT))
            return;
        el.style.setProperty("--pg-animation-name", `pg-${el.getAttribute(ATTR)}`);
        ms(el, DURATION, "--pg-animation-duration");
        ms(el, DELAY, "--pg-animation-delay");
        io.observe(el);
    };
    const trackWithin = (root) => {
        if (root instanceof Element && root.matches(`[${ATTR}]`))
            track(root);
        root.querySelectorAll(`[${ATTR}]`).forEach(track);
    };
    /* The old code looked for elements once, at page load, so anything
       rendered later — a React route change, a loaded list — never played. */
    const mo = new MutationObserver((records) => {
        for (const record of records) {
            record.addedNodes.forEach((node) => {
                if (node instanceof Element)
                    trackWithin(node);
            });
        }
    });
    trackWithin(document);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
        io.disconnect();
        mo.disconnect();
    };
}
