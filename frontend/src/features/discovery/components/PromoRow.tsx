import PromoCard from "./PromoCard";

/**
 * The promo strip on the home page.
 *
 * Three cards, all original CartWise copy, each pointing at a route that exists.
 * Kept as data in one place so the set can be reordered or trimmed without
 * touching layout.
 */
const PROMOS = [
    {
        eyebrow: "Side by side",
        heading: "Compare specs, not marketing",
        body: "Four products, one table, every difference highlighted where it matters.",
        cta: "Start comparing",
        to: "/compare",
        gradient: "from-tile-sky to-tile-lilac",
    },
    {
        eyebrow: "Watch the number",
        heading: "Track price drops",
        body: "Save anything you are undecided about and come back when it moves.",
        cta: "Open wishlist",
        to: "/wishlist",
        gradient: "from-tile-mint to-tile-butter",
    },
    {
        eyebrow: "Narrow it down",
        heading: "Filters that stay in the link",
        body: "Every filtered view has its own URL, so you can share it or come back to it.",
        cta: "Browse catalogue",
        to: "/browse",
        gradient: "from-tile-peach to-tile-blush",
    },
] as const;

export default function PromoRow() {
    return (
        <section aria-labelledby="why-cartwise">
            <h2
                id="why-cartwise"
                className="mb-6 text-2xl font-bold tracking-tight text-ink sm:mb-8 sm:text-3xl"
            >
                What CartWise is for
            </h2>

            {/* One column on a phone, two on a tablet, three from lg. */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PROMOS.map((promo) => (
                    <PromoCard key={promo.heading} {...promo} />
                ))}
            </div>
        </section>
    );
}
