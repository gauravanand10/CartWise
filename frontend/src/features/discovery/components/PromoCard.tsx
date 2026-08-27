import { Link } from "react-router-dom";

/**
 * A single value-proposition card for the discovery zone.
 *
 * Copy is CartWise's own and describes things this application actually does —
 * comparing specs, watching prices, filtering the catalogue. Nothing here is
 * adapted from another product's marketing, and no card claims a capability the
 * app does not have: every CTA routes somewhere real, which is also what stops
 * this becoming decoration that quietly rots.
 *
 * The illustration is an authored CSS gradient plus geometry — no photography,
 * no logo, no hotlinked asset.
 */

export interface PromoCardProps {
    eyebrow: string;
    heading: string;
    body: string;
    cta: string;
    to: string;
    /**
     * Tailwind gradient classes built from `@theme` tile tokens, e.g.
     * `"from-tile-mint to-tile-sky"`. Passed as a complete literal string rather
     * than assembled from a token name, because Tailwind only generates classes
     * it can see written out in source.
     */
    gradient: string;
}

export default function PromoCard({
    eyebrow,
    heading,
    body,
    cta,
    to,
    gradient,
}: PromoCardProps) {
    return (
        <article
            className={`
                relative
                flex
                h-full
                flex-col
                justify-between
                gap-6
                overflow-hidden
                rounded-3xl
                bg-gradient-to-br
                ${gradient}
                p-6
                sm:p-7
            `}
        >
            {/*
                Decorative geometry. `aria-hidden` because it carries no
                information, and `pointer-events-none` so it cannot sit between
                the pointer and the link below it — an absolutely-positioned
                decoration swallowing clicks is a classic silent bug.
            */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-card/40"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-12 -right-4 h-24 w-24 rotate-12 rounded-3xl bg-card/30"
            />

            <div className="relative">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-muted">
                    {eyebrow}
                </p>

                <h3 className="mt-2 text-lg font-bold leading-tight text-ink sm:text-xl">
                    {heading}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
            </div>

            {/*
                Chapter 26.5. Matched to HeroBanner's demoted CTA for the same
                reason: PromoRow renders four of these at once, and four solid
                pills is four things shouting. Quiet pill, accent kept for focus.
            */}
            <Link
                to={to}
                className="
                    relative
                    inline-flex
                    w-fit
                    items-center
                    rounded-full
                    border
                    border-line-strong
                    bg-card
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-ink
                    transition
                    hover:border-ink
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-accent-primary
                    focus-visible:ring-offset-2
                "
            >
                {cta}
            </Link>
        </article>
    );
}
