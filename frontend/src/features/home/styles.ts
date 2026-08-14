/**
 * Shared Tailwind class recipes for the homepage.
 *
 * These exist so the card radius, border, shadow and hover elevation stay
 * identical across every section. Prefer extending a recipe here over
 * re-typing the same shell classes in each component.
 */

/** The standard card shell: 28px radius, hairline border, soft shadow, hover lift. */
export const surfaceCard =
    "rounded-[28px] border border-ink-muted/15 bg-card shadow-[0_1px_2px_rgba(31,26,46,0.04),0_12px_32px_-12px_rgba(31,26,46,0.12)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:border-ink-muted/30 hover:shadow-[0_1px_2px_rgba(31,26,46,0.04),0_28px_56px_-16px_rgba(31,26,46,0.22)] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

/** Same shell without the hover lift — for cards that aren't themselves clickable. */
export const surfaceCardStatic =
    "rounded-[28px] border border-ink-muted/15 bg-card shadow-[0_1px_2px_rgba(31,26,46,0.04),0_12px_32px_-12px_rgba(31,26,46,0.12)]";

/**
 * Horizontal snap-scrolling rail. Pair with `railItem` on each child.
 *
 * The negative inline margin plus matching padding lets the row bleed to the
 * screen edge on phones, so the partially visible next card reads as
 * "scrollable" instead of looking clipped by the container.
 */
export const railScroller =
    "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth scrollbar-hide px-4 pb-2 sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:gap-6 lg:px-0";

/**
 * A single rail item: never shrinks, snaps to the left edge.
 *
 * Card width is deliberately narrower than the phone viewport so a sliver of
 * the next card always shows — the affordance that tells a touch user the row
 * scrolls, since the arrow controls are desktop-only.
 */
export const railItem =
    "snap-start shrink-0 w-[240px] min-[400px]:w-[250px] sm:w-[260px] lg:w-[280px]";

/** Small uppercase label used above section titles and inside banners. */
export const eyebrow =
    "text-xs font-semibold uppercase tracking-[0.14em]";
