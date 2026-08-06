/**
 * Shared Tailwind class recipes for the homepage.
 *
 * These exist so the card radius, border, shadow and hover elevation stay
 * identical across every section. Prefer extending a recipe here over
 * re-typing the same shell classes in each component.
 */

/** The standard card shell: 28px radius, hairline border, soft shadow, hover lift. */
export const surfaceCard =
    "rounded-[28px] border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:border-slate-300/70 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_28px_56px_-16px_rgba(15,23,42,0.22)]";

/** Same shell without the hover lift — for cards that aren't themselves clickable. */
export const surfaceCardStatic =
    "rounded-[28px] border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)]";

/** Horizontal snap-scrolling rail. Pair with `railItem` on each child. */
export const railScroller =
    "flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth scrollbar-hide pb-2";

/** A single rail item: never shrinks, snaps to the left edge. */
export const railItem = "snap-start shrink-0";

/** Small uppercase label used above section titles and inside banners. */
export const eyebrow =
    "text-xs font-semibold uppercase tracking-[0.14em]";
