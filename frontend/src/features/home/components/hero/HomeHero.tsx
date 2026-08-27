import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";

import SafeImage from "../../../../components/ui/SafeImage";
import { fetchProducts, type ApiProduct } from "../../../../services/api";
import { formatPrice } from "../../../../lib/currency";

/**
 * The homepage hero.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 26.5
 *
 * Replaces `HeroSearch`, which was a centred headline over a search field, and
 * which claimed the site returns "an AI score on every result". It does not,
 * and as of this chapter it does not compute an AI score anywhere at all — the
 * fabricated scores were removed from the product page, the comparison table
 * and the homepage rails, so the line had to go with them.
 *
 * WHAT THE HERO IS NOW
 *
 * Two columns. Copy and one primary action on the left; a real product on the
 * right. Everything in it is either a route that exists or a value from the
 * API — there is no decorative product mock and no invented statistic.
 *
 * THE IMAGE IS A REAL CATALOGUE PRODUCT
 *
 * Fetched with the same query as the "Top rated" rail (`sort=rating-desc`,
 * `size=1`), so the hero shows the catalogue's best-rated product rather than a
 * hardcoded favourite that would drift as the catalogue changes. It renders
 * the photograph the Chapter 24 Openverse integration stored, and it renders
 * that photograph's attribution beside it — the CC licences these images carry
 * require the credit as a condition of use, so a component that shows the
 * picture and not the credit is not a styling shortcut, it is an unlicensed
 * copy. That rule is why `SafeImage` and the caption below are one block.
 *
 * The caption also says what the picture is: an illustrative photograph of the
 * category, not a manufacturer's shot of that exact model. The backfill
 * searches Openverse by category — see ProductImageService — and pretending
 * otherwise would misrepresent the product.
 *
 * ONE ACCENT, ONE ACTION
 *
 * "Browse the catalogue" is the single filled accent control on this page, and
 * the design system's rule is that it stays that way: the search field's focus
 * ring and the compare toggle on a card are the only other accents the reader
 * meets. The secondary action beside it is a hairline pill.
 *
 * If the fetch fails the right column simply does not render and the hero
 * becomes a single column. A homepage that cannot reach the API still has
 * working search, navigation and copy; an error card in the hero would make it
 * look otherwise.
 * ---------------------------------------------------------------------------
 */
export default function HomeHero() {
    const [featured, setFeatured] = useState<ApiProduct | null>(null);
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;

        fetchProducts({ sort: "rating-desc", size: 1 })
            .then((page) => {
                if (!cancelled) setFeatured(page.content[0] ?? null);
            })
            .catch(() => {
                // Deliberately silent. See the note above.
            });

        return () => {
            cancelled = true;
        };
    }, []);

    function onSubmit(event: React.FormEvent) {
        event.preventDefault();

        const trimmed = query.trim();
        if (!trimmed) return;

        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }

    return (
        <section className="section !py-0">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">

                {/* ---------------------------------------------- copy + action */}

                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Price comparison, without the noise
                    </p>

                    {/*
                        One size step per breakpoint rather than a smooth ramp.
                        The design system's type scale is deliberately coarse —
                        a small number of confident sizes with real distance
                        between them is what makes a page read as calm.
                    */}
                    <h1 className="mt-5 text-[34px] font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[56px]">
                        Find it. Compare it.
                        <br />
                        Pay less for it.
                    </h1>

                    {/*
                        Chapter 27: this said "nine retailers". CartWise
                        compares five — Amazon, Flipkart, Croma, Reliance
                        Digital and Vijay Sales, the whole of `STORES` in
                        features/product/constants.ts. Nine was not a rounding
                        or an aspiration, it was a number with nothing behind
                        it, in the first paragraph of the site. The footer
                        claimed seven at the same time; see the note there.
                    */}
                    <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-500">
                        One catalogue, five retailers, and a straight answer on
                        which one is cheapest. Prices shown are reference
                        values, not live quotes.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center gap-3">
                        {/*
                            The page's one filled accent control.
                        */}
                        <Link
                            to="/browse"
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                bg-blue-600
                                px-6
                                py-3
                                text-[15px]
                                font-semibold
                                text-white
                                transition
                                hover:bg-blue-700
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-blue-500
                                focus-visible:ring-offset-2
                            "
                        >
                            Browse the catalogue
                            <ArrowRight size={17} aria-hidden="true" />
                        </Link>

                        <Link
                            to="/compare"
                            className="
                                inline-flex
                                items-center
                                rounded-full
                                border
                                border-line-strong
                                px-6
                                py-3
                                text-[15px]
                                font-semibold
                                text-slate-900
                                transition
                                hover:border-slate-900
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-blue-500
                                focus-visible:ring-offset-2
                            "
                        >
                            Compare products
                        </Link>
                    </div>

                    <form
                        onSubmit={onSubmit}
                        role="search"
                        className="
                            group
                            mt-9
                            flex
                            max-w-lg
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-slate-200
                            bg-white
                            py-2
                            pl-5
                            pr-2
                            transition-colors
                            focus-within:border-blue-500
                        "
                    >
                        <Search
                            size={19}
                            className="shrink-0 text-slate-400 transition-colors group-focus-within:text-blue-600"
                            aria-hidden="true"
                        />

                        <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search phones, laptops…"
                            aria-label="Search products"
                            className="h-11 w-full min-w-0 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                        />

                        <button
                            type="submit"
                            className="
                                h-11
                                shrink-0
                                rounded-full
                                px-5
                                text-sm
                                font-semibold
                                text-slate-900
                                transition
                                hover:bg-slate-100
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-blue-500
                            "
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* ------------------------------------------- real product */}

                {featured && (
                    <Link
                        to={`/product/${featured.slug}`}
                        className="
                            group
                            block
                            rounded-3xl
                            bg-slate-50
                            p-8
                            transition
                            hover:bg-slate-100
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                            focus-visible:ring-offset-2
                        "
                    >
                        <SafeImage
                            src={featured.imageUrl ?? ""}
                            alt={`Photograph illustrating ${featured.name}`}
                            className="flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl bg-white sm:h-72"
                            imgClassName="h-full w-full object-cover"
                            iconClassName="h-10 w-10 text-slate-300"
                        />

                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Best rated in the catalogue
                        </p>

                        <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
                            {featured.name}
                        </p>

                        <p className="mt-1 text-[15px] text-slate-500">
                            {formatPrice(featured.price)} reference price ·
                            rated {featured.rating} of 5
                        </p>

                        {/*
                            Attribution, not decoration. See the header: the CC
                            licence these photographs carry grants use ON
                            CONDITION of credit, so this line is part of the
                            image rather than a caption that could be dropped
                            for a tidier card.
                        */}
                        {featured.imageAttribution && (
                            <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
                                Illustrative {featured.category.toLowerCase()}{" "}
                                photograph. {featured.imageAttribution}
                            </p>
                        )}
                    </Link>
                )}

            </div>
        </section>
    );
}
