import { Scale } from "lucide-react";
import { Link } from "react-router-dom";

import ProductCard from "../../../components/ui/ProductCard";
import { MAX_COMPARE, MIN_COMPARE } from "../constants";
import type { ProductCardModel } from "../../product/types/product";

interface CompareEmptyProps {
    suggestions: ProductCardModel[];
}

/**
 * Nothing selected — or everything removed.
 *
 * Offers products to compare rather than just explaining the feature: the user
 * arrived wanting to compare something, so the fastest route out of this state
 * is a list they can add from. The cards are the shared `ProductCard`, so they
 * carry the same compare button as everywhere else in the app.
 */
export default function CompareEmpty({ suggestions }: CompareEmptyProps) {
    return (
        <div className="space-y-8">

            {/*
                CHAPTER 29 — matched to the wishlist empty state, deliberately.

                The two are the same moment on two features ("you have selected
                nothing yet") and were drawn differently: this one had a blue
                icon tile, that one rose, and both used a card-sized heading for
                a whole-screen state. They now share one treatment — outlined
                neutral glyph, display-weight heading as the largest type on the
                page, and the control named in the sentence.

                The glyph is the same scales icon the compare toggle uses on a
                product card, for the same reason the wishlist state shows a
                heart: the reader is being told which control to press, so it
                should be the control they will actually see.
            */}
            <section className="rounded-2xl border border-line bg-card px-6 py-16 text-center sm:rounded-[24px] sm:py-24">

                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-sunken text-ink-subtle">
                    <Scale size={28} strokeWidth={1.25} aria-hidden="true" />
                </span>

                <h1 className="mt-8 text-2xl text-ink sm:text-3xl">
                    Nothing to compare yet
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-muted">
                    Press the{" "}
                    <Scale
                        size={13}
                        className="inline align-[-1px] text-ink"
                        aria-hidden="true"
                    />{" "}
                    on {MIN_COMPARE} to {MAX_COMPARE} products and their
                    specifications, prices and store offers line up side by side.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                    <Link
                        to="/browse"
                        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                        Browse the catalogue
                    </Link>

                    <Link
                        to="/"
                        className="rounded-full border border-line-strong bg-card px-5 py-2.5 text-sm font-semibold text-ink transition duration-200 hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                        Go to homepage
                    </Link>
                </div>

            </section>

            {suggestions.length > 0 && (
                <section
                    aria-labelledby="compare-suggestions"
                    className="rounded-2xl border border-slate-200 bg-white p-5 sm:rounded-[24px] sm:p-6 lg:p-8"
                >
                    <h2
                        id="compare-suggestions"
                        className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
                    >
                        Popular products to compare
                    </h2>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Use the scales icon on any card to add it to the
                        comparison.
                    </p>

                    <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {suggestions.slice(0, 4).map((product) => (
                            <li key={product.slug} className="h-full">
                                <ProductCard product={product} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

        </div>
    );
}
