import { Heart, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import ProductCard from "../../../components/ui/ProductCard";
import type { ProductCardModel } from "../../product/types/product";

interface WishlistEmptyProps {
    suggestions: ProductCardModel[];
}

/**
 * Nothing saved — or everything removed.
 *
 * Offers products rather than only explaining the feature: the fastest way out
 * of an empty wishlist is a list the user can save from without leaving the
 * page. The tiles are the shared `ProductCard`, so their hearts are the same
 * control as everywhere else and saving one moves this page straight into its
 * populated state.
 */
export default function WishlistEmpty({ suggestions }: WishlistEmptyProps) {
    return (
        <div className="space-y-8">

            {/*
                =================================================================
                CHAPTER 29 — THE EMPTY STATE, REDESIGNED RATHER THAN DECORATED.

                It was a centred card with a rose-tinted heart in a rounded
                square, a 18px heading and a sentence. Generic: the same block
                every product ships, distinguishable from a competitor's only by
                the words in it.

                Three deliberate changes, all typographic or structural rather
                than colour:

                1. The heading is now the largest type on the page and set at
                   display weight. An empty state is a whole screen; giving it a
                   card-sized heading made it look like a dismissed notification
                   rather than a place the reader had arrived at.

                2. The heart is outlined in the neutral scale, not filled in
                   rose. The filled rose heart was the same glyph and colour as
                   the SAVED state on a product card — the empty screen was
                   showing the reader the exact symbol that means "you have
                   saved this", which is the opposite of what it says.

                3. The instruction names the control and shows it. "Tap the
                   heart" is only useful if the reader knows which heart; the
                   glyph is inlined into the sentence so the two are the same
                   object.
                =================================================================
            */}
            <section className="rounded-2xl border border-line bg-card px-6 py-16 text-center sm:rounded-[24px] sm:py-24">

                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-sunken text-ink-subtle">
                    <Heart size={28} strokeWidth={1.25} aria-hidden="true" />
                </span>

                <h1 className="mt-8 text-2xl text-ink sm:text-3xl">
                    Nothing saved yet
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-muted">
                    Press the{" "}
                    <Heart
                        size={13}
                        className="inline align-[-1px] text-ink"
                        aria-hidden="true"
                    />{" "}
                    on any product and it lands here — ready to revisit, compare
                    or check again later.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                    <Link
                        to="/browse"
                        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                        <Search size={15} aria-hidden="true" />
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
                    aria-labelledby="wishlist-suggestions"
                    className="rounded-2xl border border-slate-200 bg-white p-5 sm:rounded-[24px] sm:p-6 lg:p-8"
                >
                    <h2
                        id="wishlist-suggestions"
                        className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
                    >
                        <Sparkles size={17} className="text-violet-600" aria-hidden="true" />
                        {/* Chapter 26.5: was "Popular right now", ordered by
                            `sort=rating-desc`. Highest rated is not most
                            popular, and CartWise counts no views. */}
                        Highest rated
                    </h2>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Save one with the heart to start your wishlist.
                    </p>

                    <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {suggestions.map((product) => (
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
