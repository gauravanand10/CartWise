import ProductCard from "../../components/ui/ProductCard";
import FilterBar from "./components/FilterBar";
import { useCatalogue } from "./hooks/useCatalogue";
import { useCatalogueParams } from "./hooks/useCatalogueParams";
import { toCardModel } from "./utils/toCardModel";

/**
 * `/browse` — the catalogue, filtered by whatever the URL says.
 *
 * This is the screen that makes Chapter 20's backend work visible: every filter,
 * sort and page here is a query parameter the server interprets, not a list
 * narrowed in the browser. Loading the whole catalogue and filtering client-side
 * would look identical at eight products and be the wrong architecture at eight
 * thousand — and the URL contract would be a lie, since the parameters would
 * mean nothing to the server.
 *
 * It is a DISCOVERY-zone screen: pastel chips, colour-blocked tiles above it on
 * the home page. But the results grid itself stays calm, because a wall of
 * product cards is a reading task and colour behind them competes with the
 * information on them.
 */
export default function CataloguePage() {
    const params = useCatalogueParams();
    const { status, page, error } = useCatalogue(params.query);

    const products = page?.content ?? [];
    const total = page?.totalElements ?? 0;
    const totalPages = page?.totalPages ?? 0;

    return (
        <div className="section flex flex-col gap-6 sm:gap-8">

            <header>
                <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                    Browse the catalogue
                </h1>

                <p className="mt-2 text-ink-muted">
                    {/*
                        The count is the server's `totalElements`, not
                        `products.length` — the latter is only ever the size of
                        the current page and would claim "12 products" for a
                        catalogue of 400.
                    */}
                    {status === "ready"
                        ? `${total} ${total === 1 ? "product" : "products"}`
                        : "Loading…"}
                </p>
            </header>

            <FilterBar params={params} />

            {status === "error" && (
                <p
                    role="status"
                    className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
                >
                    {error}
                </p>
            )}

            {status === "ready" && products.length === 0 && (
                // An empty result is not an error and must not read like one.
                // The filters matched nothing; the catalogue is fine.
                <div className="rounded-3xl bg-tile-butter p-8 text-center">
                    <p className="text-lg font-bold text-ink">Nothing matches those filters</p>

                    <p className="mt-1 text-sm text-ink-muted">
                        Try widening the price range or clearing a filter.
                    </p>

                    {params.activeFilterCount > 0 && (
                        <button
                            type="button"
                            onClick={params.clear}
                            className="
                                mt-4
                                rounded-full
                                bg-ink
                                px-5
                                py-2.5
                                text-sm
                                font-bold
                                text-white
                                transition
                                hover:bg-accent-primary
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-ink
                                focus-visible:ring-offset-2
                            "
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}

            {products.length > 0 && (
                <ul
                    // Dimmed while a new page loads instead of being replaced by
                    // a skeleton. The grid keeps its height, so the page does
                    // not jump, and the dimming says "this is stale" without
                    // pretending there is nothing there.
                    className={`
                        grid
                        grid-cols-2
                        gap-3
                        transition-opacity
                        duration-200
                        sm:grid-cols-3
                        sm:gap-4
                        lg:grid-cols-4
                        ${status === "loading" ? "opacity-60" : "opacity-100"}
                    `}
                    aria-busy={status === "loading"}
                >
                    {products.map((product) => (
                        <li key={product.slug} className="flex">
                            <ProductCard product={toCardModel(product)} />
                        </li>
                    ))}
                </ul>
            )}

            {totalPages > 1 && (
                <nav
                    aria-label="Catalogue pages"
                    className="flex items-center justify-center gap-2 pt-2"
                >
                    <button
                        type="button"
                        onClick={() => params.update({ page: params.page - 1 })}
                        disabled={params.page === 0}
                        className="
                            rounded-full
                            bg-card
                            px-4
                            py-2
                            text-sm
                            font-bold
                            text-ink
                            transition
                            hover:bg-tile-lilac
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                            disabled:hover:bg-card
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-ink
                            focus-visible:ring-offset-2
                        "
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => params.update({ page: index })}
                            aria-current={index === params.page ? "page" : undefined}
                            aria-label={`Page ${index + 1}`}
                            className={`
                                h-9
                                w-9
                                rounded-full
                                text-sm
                                font-bold
                                transition
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-ink
                                focus-visible:ring-offset-2
                                ${index === params.page
                                    ? "bg-ink text-white"
                                    : "bg-card text-ink-muted hover:text-ink"}
                            `}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => params.update({ page: params.page + 1 })}
                        disabled={params.page >= totalPages - 1}
                        className="
                            rounded-full
                            bg-card
                            px-4
                            py-2
                            text-sm
                            font-bold
                            text-ink
                            transition
                            hover:bg-tile-lilac
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                            disabled:hover:bg-card
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-ink
                            focus-visible:ring-offset-2
                        "
                    >
                        Next
                    </button>
                </nav>
            )}
        </div>
    );
}
