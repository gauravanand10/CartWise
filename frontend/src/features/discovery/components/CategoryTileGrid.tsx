import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

import { useCategories } from "../hooks/useCatalogue";
import { tileGlyph, tileSurface } from "../tiles";

/**
 * The colour-blocked category grid — the centre of the discovery zone.
 *
 * Every tile comes from `GET /api/categories`, so the grid reflects what the
 * catalogue actually contains rather than a hardcoded list that drifts from it.
 * That is the substantive change from the mock-data version this replaces: a
 * category with no products cannot appear, and a new one appears without a
 * frontend deploy.
 *
 * Each tile links to `/browse?category=<slug>` — a real, shareable URL rather
 * than a click handler that sets state, which is what makes the filtered view
 * reloadable. See `useCatalogueParams`.
 */
export default function CategoryTileGrid() {
    const { status, categories, error } = useCategories();
    const reduceMotion = useReducedMotion();

    return (
        <section aria-labelledby="browse-categories">
            <div className="mb-6 sm:mb-8">
                <h2
                    id="browse-categories"
                    className="text-2xl font-bold tracking-tight text-ink sm:text-3xl"
                >
                    Browse categories
                </h2>

                <p className="mt-2 text-ink-muted">
                    Pick a category to filter the whole catalogue.
                </p>
            </div>

            {status === "loading" && (
                <div
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3 min-[400px]:gap-4 lg:grid-cols-5 xl:grid-cols-6"
                    aria-hidden="true"
                >
                    {/* Placeholder count is arbitrary — the real number is not
                        known until the request returns, and guessing high would
                        make the grid collapse when fewer arrive. */}
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-[132px] animate-pulse rounded-3xl bg-ink-muted/10 sm:h-[150px]"
                        />
                    ))}
                </div>
            )}

            {status === "error" && (
                <p
                    role="status"
                    className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
                >
                    {error}
                </p>
            )}

            {status === "ready" && categories.length === 0 && (
                <p role="status" className="text-ink-muted">
                    No categories yet — the catalogue is empty.
                </p>
            )}

            {status === "ready" && categories.length > 0 && (
                // 2 → 3 → 5 → 6 columns, matching the widths the chapter
                // verifies at: 360px, 768px and 1280px.
                <ul className="grid grid-cols-2 gap-3 min-[400px]:gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                    {categories.map((category, index) => (
                        <motion.li
                            key={category.slug}
                            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: reduceMotion ? 0 : 0.28,
                                // Capped so the whole stagger finishes inside
                                // ~300ms no matter how many categories exist —
                                // an uncapped `index * delay` turns a long grid
                                // into a slow wipe.
                                delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.21),
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <Link
                                to={`/browse?category=${encodeURIComponent(category.slug)}`}
                                className={`
                                    group
                                    flex
                                    h-full
                                    flex-col
                                    items-start
                                    gap-3
                                    rounded-3xl
                                    ${tileSurface(category.slug)}
                                    p-4
                                    transition-transform
                                    duration-200
                                    ease-out
                                    hover:-translate-y-1
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-ink
                                    focus-visible:ring-offset-2
                                    focus-visible:ring-offset-surface
                                    motion-reduce:transition-none
                                    motion-reduce:hover:translate-y-0
                                    sm:p-5
                                `}
                            >
                                {/*
                                    Authored geometric glyph, not a product
                                    photograph or a borrowed icon set. Drawn in
                                    `currentColor` so it inherits ink and cannot
                                    introduce a colour of its own.
                                */}
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    className="
                                        h-8
                                        w-8
                                        text-ink
                                        opacity-70
                                        transition-transform
                                        duration-200
                                        group-hover:scale-110
                                        motion-reduce:transition-none
                                        motion-reduce:group-hover:scale-100
                                        sm:h-9
                                        sm:w-9
                                    "
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    {tileGlyph(category.slug)}
                                </svg>

                                <span className="mt-auto block w-full">
                                    <span className="block text-sm font-bold leading-snug text-ink sm:text-base">
                                        {category.name}
                                    </span>

                                    {/*
                                        ink-muted on every tile measures 5.30:1
                                        or better — see the @theme block. This is
                                        the pairing that would have failed with a
                                        lighter muted tone, which is why the
                                        ratios were measured before the values
                                        were chosen rather than after.
                                    */}
                                    <span className="mt-0.5 block text-xs font-medium text-ink-muted">
                                        {category.productCount}
                                        {category.productCount === 1 ? " product" : " products"}
                                    </span>
                                </span>
                            </Link>
                        </motion.li>
                    ))}
                </ul>
            )}
        </section>
    );
}
