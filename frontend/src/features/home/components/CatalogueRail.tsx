import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import ProductCard from "../../../components/ui/ProductCard";
import Skeleton from "../../../components/ui/Skeleton";
import { toCardModel } from "../../discovery/utils/toCardModel";
import { fetchProducts, type ProductQueryParams } from "../../../services/api";
import type { ProductCardModel } from "../../../types/product";

interface CatalogueRailProps {
    title: string;
    /** One line under the title saying what the section actually selects on. */
    description: string;
    /** Passed straight to `GET /api/products`. This is the section's definition. */
    query: ProductQueryParams;
    /** Where "See all" goes — the same selection, expressed as a /browse URL. */
    seeAllHref: string;
    count?: number;
}

/**
 * A row of real products, selected by a real query.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 26.5 — WHAT THIS REPLACED, AND WHY IT IS ONE COMPONENT
 *
 * The homepage used to carry seven product sections: Trending, Flash deals,
 * Price drops, AI picks, Brand collections, Recently viewed and Recommended.
 * Every one of them read `features/home/data/products.ts`, a hand-written mock
 * array, and between them they made claims this application cannot support:
 *
 *   "AI score 96"                      no model computed it
 *   "Lowest at Amazon"                 no live pricing feed exists
 *   "Lowest price of the last 90 days" no price history is stored
 *   "refreshed hourly across every
 *    store we track"                   nothing is refreshed, ever
 *   a countdown timer on a "deal"      counting down to nothing
 *
 * They are gone. This component is the honest shape of what remains: a titled
 * row whose membership is decided by a query the API genuinely supports, with a
 * description saying what that query is, and a "See all" link to the same
 * selection on /browse so the reader can check it.
 *
 * THE SECTION IS ITS QUERY. That is the design rule. `query` goes straight to
 * `GET /api/products`, and `seeAllHref` is the same selection expressed as a
 * URL — so a section cannot claim a membership rule the catalogue would not
 * reproduce. "Top rated" is `sort=rating-desc` and nothing else.
 *
 * WHAT COULD NOT BE BUILT, STATED PLAINLY: a "Recently added" rail. It is the
 * obvious third section and the API has no `created-desc` sort — the orderings
 * are price-asc, price-desc, rating-desc and name-asc. Adding one is backend
 * work this chapter was not scoped for, so the section does not exist rather
 * than being faked from a proxy that would order products by something other
 * than what its title claims.
 *
 * FAILURE IS SILENT, DELIBERATELY. A rail that cannot load renders nothing at
 * all — no error card, no empty frame. It is a supplementary row on a homepage
 * whose hero, category grid and navigation are all still working; a red box
 * would make a partial outage look like a broken site.
 * ---------------------------------------------------------------------------
 */
export default function CatalogueRail({
    title,
    description,
    query,
    seeAllHref,
    count = 4,
}: CatalogueRailProps) {
    const [products, setProducts] = useState<ProductCardModel[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetchProducts({ ...query, size: count })
            .then((page) => {
                if (!cancelled) setProducts(page.content.map(toCardModel));
            })
            .catch(() => {
                if (!cancelled) setFailed(true);
            });

        return () => {
            cancelled = true;
        };
        // `query` is an object literal at every call site, so depending on it
        // directly would re-run this effect on every render. Its fields are
        // constants declared beside the call, and `count` is the only other
        // input, so this list is complete in practice.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count]);

    if (failed) return null;

    return (
        <section className="section !py-0">

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                        {title}
                    </h2>

                    <p className="mt-2 text-[15px] text-slate-500">
                        {description}
                    </p>
                </div>

                {/*
                    The only link out of the section, and it is quiet on purpose.
                    The accent on this page belongs to the hero's single primary
                    call to action; a row of accent "See all" links would be the
                    overuse this design pass exists to remove.
                */}
                <Link
                    to={seeAllHref}
                    className="
                        inline-flex
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-line-strong
                        px-4
                        py-2
                        text-sm
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
                    See all
                    <ArrowRight size={15} aria-hidden="true" />
                </Link>
            </div>

            {/*
                CHAPTER 29 — the skeleton-to-content reveal.

                `aria-busy` on the container is what actually tells assistive
                technology this region is loading; the skeletons themselves are
                aria-hidden, because announcing four empty boxes is noise.

                Each card carries `cw-reveal` with a staggered delay, so the row
                settles left to right over ~160ms instead of four cards
                appearing simultaneously. The stagger caps at three steps: past
                that the last item is late enough to read as broken rather than
                as considered.
            */}
            <div
                className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6"
                aria-busy={products === null}
            >
                {products === null
                    ? Array.from({ length: count }, (_, index) => (
                        <Skeleton
                            key={index}
                            className="h-[360px] rounded-2xl"
                        />
                    ))
                    : products.map((product, index) => (
                        <div
                            key={product.slug}
                            className={`cw-reveal ${index > 0 ? `cw-reveal-${Math.min(index, 3)}` : ""}`}
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
            </div>

        </section>
    );
}
