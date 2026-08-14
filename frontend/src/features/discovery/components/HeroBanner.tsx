import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * A horizontally scrollable rail of promo cards.
 *
 * **It does not auto-advance, and that is a decision rather than an omission.**
 * An auto-rotating carousel fails WCAG 2.2.2 unless it offers a pause control,
 * and it fails users more directly than the criterion suggests: it moves content
 * out from under a pointer mid-reach, it restarts the reading of anyone slower
 * than the interval, and when a card contains a link it can pull focus somewhere
 * the user did not go. The previous `BannerCarousel` auto-advanced on a timer;
 * this replaces it.
 *
 * What replaces the movement is scroll affordance: CSS scroll-snap, real
 * overflow, dot controls, and arrow keys. The user advances it, which means the
 * rail is never doing something they did not ask for.
 *
 * Snap points come from CSS (`snap-x`/`snap-start`) rather than from JavaScript
 * measuring positions, so the native gesture — trackpad, touch, shift-wheel —
 * keeps working and stays in step with the dots.
 *
 * **`snap-start`, not `snap-center`, and the difference is load-bearing.** With
 * `snap-mandatory`, the browser will only rest at a valid snap position. Centring
 * a card requires scrolling to `card.centre − rail.centre`, and on a rail showing
 * three cards at once those offsets are −419, −26, 367 and 760 against a maximum
 * scrollable distance of 340 — so not one card could be centred at a reachable
 * offset, and mandatory snapping pinned the rail at 0. Every scroll, drag, dot
 * click and arrow key silently did nothing on desktop. Aligning to the leading
 * edge makes each snap position exactly `card.offsetLeft`, which is reachable by
 * construction.
 */

/**
 * Original CartWise promos. Every string, colour and shape here is written for
 * this project; nothing is adapted from another product's marketing.
 *
 * The gradients are built from `@theme` tile tokens via `bg-gradient-to-br` plus
 * `from-`/`to-` utilities, so a card cannot introduce a colour the token set
 * does not have.
 */
const SLIDES = [
    {
        id: "compare",
        eyebrow: "Why CartWise",
        heading: "Compare specs side by side",
        body: "Put up to four products in one table and see exactly where they differ.",
        cta: "Open compare",
        to: "/compare",
        gradient: "from-tile-lilac to-tile-sky",
    },
    {
        id: "price",
        eyebrow: "Save more",
        heading: "Track price drops",
        body: "Save what you are watching and check back when the number moves.",
        cta: "View wishlist",
        to: "/wishlist",
        gradient: "from-tile-mint to-tile-butter",
    },
    {
        id: "browse",
        eyebrow: "Everything in one place",
        heading: "Filter the whole catalogue",
        body: "Category, brand, price and availability — narrowed in a couple of clicks.",
        cta: "Browse all",
        to: "/browse",
        gradient: "from-tile-blush to-tile-peach",
    },
    {
        id: "stock",
        eyebrow: "No dead ends",
        heading: "See what is actually in stock",
        body: "Hide anything unavailable before you spend time reading about it.",
        cta: "Show in stock",
        to: "/browse?inStock=true",
        gradient: "from-tile-peach to-tile-lilac",
    },
] as const;

export default function HeroBanner() {
    const railRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const reduceMotion = useReducedMotion();

    /** Scrolls a card into view and lets the scroll handler update the dots. */
    const goTo = useCallback(
        (index: number) => {
            const rail = railRef.current;
            if (!rail) return;

            const clamped = Math.max(0, Math.min(index, SLIDES.length - 1));
            const card = rail.children[clamped] as HTMLElement | undefined;
            if (!card) return;

            rail.scrollTo({
                left: card.offsetLeft - rail.offsetLeft,
                // Honouring reduced motion on a *programmatic* scroll too. The
                // CSS `scroll-behavior: smooth` in index.css is already disabled
                // under the media query, but scrollTo's own behaviour is not.
                behavior: reduceMotion ? "auto" : "smooth",
            });
        },
        [reduceMotion],
    );

    /**
     * Derives the active dot from the actual scroll position.
     *
     * Reading the DOM rather than tracking an index in state is what keeps the
     * dots correct when the rail is scrolled by gesture instead of by the
     * controls — the two would otherwise disagree the moment anyone swiped.
     *
     * Measured against each card's **leading edge**, matching `snap-start`. An
     * earlier version compared card centres against the rail's centre, which
     * reported "2 of 4" while the rail sat untouched at scroll position 0 —
     * with three cards visible, the middle one is nearest the centre at rest,
     * so the control claimed a card was current that the user had never
     * scrolled to.
     */
    useEffect(() => {
        const rail = railRef.current;
        if (!rail) return;

        const onScroll = () => {
            let nearest = 0;
            let nearestDistance = Infinity;

            Array.from(rail.children).forEach((child, index) => {
                const card = child as HTMLElement;
                const cardStart = card.offsetLeft - rail.offsetLeft;
                const distance = Math.abs(cardStart - rail.scrollLeft);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearest = index;
                }
            });

            setActive(nearest);
        };

        onScroll();
        rail.addEventListener("scroll", onScroll, { passive: true });
        return () => rail.removeEventListener("scroll", onScroll);
    }, []);

    /**
     * Arrow keys move the rail when it — or anything inside it — has focus.
     *
     * `onKeyDown` on the container rather than a window listener, so arrow keys
     * elsewhere on the page are untouched. `preventDefault` stops the browser
     * also scrolling the page by a line on the same press.
     */
    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowRight") {
            event.preventDefault();
            goTo(active + 1);
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(active - 1);
        }
    };

    return (
        <section
            aria-roledescription="carousel"
            aria-label="CartWise highlights"
            onKeyDown={onKeyDown}
        >
            <div
                ref={railRef}
                // tabIndex 0 so the rail itself is reachable by keyboard and the
                // arrow keys have somewhere to land. A scrollable region that
                // cannot be focused is unreachable for a keyboard user even
                // though its contents are — one of the quieter a11y failures.
                tabIndex={0}
                role="group"
                aria-label={`Highlight ${active + 1} of ${SLIDES.length}`}
                className="
                    scrollbar-hide
                    flex
                    snap-x
                    snap-mandatory
                    gap-4
                    overflow-x-auto
                    scroll-smooth
                    rounded-3xl
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-accent-primary
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-surface
                "
            >
                {SLIDES.map((slide, index) => (
                    <motion.article
                        key={slide.id}
                        // 1 card at 360px, 2 from sm, 3 from lg — the widths the
                        // brief asks for, expressed as basis so the flex row does
                        // the arithmetic rather than a media query per breakpoint.
                        className={`
                            flex
                            min-w-0
                            shrink-0
                            grow-0
                            basis-[86%]
                            snap-start
                            flex-col
                            justify-between
                            gap-6
                            rounded-3xl
                            bg-gradient-to-br
                            ${slide.gradient}
                            p-6
                            sm:basis-[46%]
                            sm:p-7
                            lg:basis-[31%]
                        `}
                        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: reduceMotion ? 0 : 0.32,
                            delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.2),
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-ink-muted">
                                {slide.eyebrow}
                            </p>

                            <h3 className="mt-2 text-xl font-bold leading-tight text-ink sm:text-2xl">
                                {slide.heading}
                            </h3>

                            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                                {slide.body}
                            </p>
                        </div>

                        <Link
                            to={slide.to}
                            className="
                                inline-flex
                                w-fit
                                items-center
                                rounded-full
                                bg-accent-primary
                                px-5
                                py-2.5
                                text-sm
                                font-bold
                                text-white
                                transition
                                hover:bg-ink
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-ink
                                focus-visible:ring-offset-2
                            "
                        >
                            {slide.cta}
                        </Link>
                    </motion.article>
                ))}
            </div>

            {/*
                Real buttons, not dots-as-divs: each moves the rail and each is a
                focus stop, so the rail is operable without the arrow keys too.
            */}
            <div className="mt-4 flex justify-center gap-2">
                {SLIDES.map((slide, index) => (
                    <button
                        key={slide.id}
                        type="button"
                        onClick={() => goTo(index)}
                        aria-label={`Show ${slide.heading}`}
                        aria-current={index === active}
                        className={`
                            h-2.5
                            rounded-full
                            transition-all
                            duration-200
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-accent-primary
                            focus-visible:ring-offset-2
                            ${index === active
                                ? "w-7 bg-accent-primary"
                                : "w-2.5 bg-ink-muted/35 hover:bg-ink-muted/60"}
                        `}
                    />
                ))}
            </div>
        </section>
    );
}
