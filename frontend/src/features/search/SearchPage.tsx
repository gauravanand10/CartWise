import { useCallback, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import ActiveFilters from "./components/ActiveFilters";
import EmptyState from "./components/EmptyState";
import ErrorState from "./components/ErrorState";
import FilterSidebar from "./components/FilterSidebar";
import NoResults from "./components/NoResults";
import Pagination from "./components/Pagination";
import SearchBar from "./components/SearchBar";
import SearchHeader from "./components/SearchHeader";
import SearchResults from "./components/SearchResults";
import SearchSkeleton from "./components/SearchSkeleton";
import SearchStats from "./components/SearchStats";
import SortDropdown from "./components/SortDropdown";

import { PRODUCTS_PER_PAGE } from "./constants";
import { useRecentSearches } from "./hooks/useRecentSearches";
import { useSearch } from "./hooks/useSearch";

export default function SearchPage() {
    const {
        query,
        setQuery,
        activeQuery,
        sort,
        setSort,
        filter,
        setFilter,
        resetFilters,
        activeFilterCount,
        resetSearch,
        results,
        status,
        error,
        categories,
        brands,
        priceBounds,
    } = useSearch();

    const { recent, add, remove, clear } = useRecentSearches();

    const [currentPage, setCurrentPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Stable identity: the sheet's focus-trap effect keys off this, and an
    // inline arrow would re-run it — stealing focus back — on every keystroke.
    const closeFilters = useCallback(() => setFiltersOpen(false), []);

    // Reset to page 1 whenever the result set changes. Adjusting state during
    // render is React's documented pattern for this and avoids the extra
    // commit — and the flash of an out-of-range page — that a setState inside
    // useEffect would produce.
    const resultsKey = `${activeQuery}|${sort}|${JSON.stringify(filter)}`;
    const [lastResultsKey, setLastResultsKey] = useState(resultsKey);

    if (resultsKey !== lastResultsKey) {
        setLastResultsKey(resultsKey);
        setCurrentPage(1);
    }

    const totalPages = Math.ceil(results.length / PRODUCTS_PER_PAGE);

    const paginated = results.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE,
    );

    const runSearch = (value: string) => {
        setQuery(value);
        add(value);
    };

    return (
        <div className="space-y-8">

            <SearchHeader>
                <SearchBar
                    query={query}
                    onQueryChange={setQuery}
                    onSubmit={runSearch}
                    recent={recent}
                    onRemoveRecent={remove}
                    onClearRecent={clear}
                    loading={status === "loading"}
                />
            </SearchHeader>

            {status === "results" && (
                <SearchStats results={results} query={activeQuery} />
            )}

            <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">

                <div className="lg:col-span-3">
                    <FilterSidebar
                        filter={filter}
                        onChange={setFilter}
                        onReset={resetFilters}
                        activeFilterCount={activeFilterCount}
                        categories={categories}
                        brands={brands}
                        priceBounds={priceBounds}
                        open={filtersOpen}
                        onClose={closeFilters}
                    />
                </div>

                <section className="min-w-0 space-y-5 lg:col-span-9">

                    {/* Toolbar */}

                    <div className="flex flex-wrap items-center justify-between gap-3">

                        <p
                            className="text-sm text-slate-600"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {status === "loading" ? (
                                "Searching…"
                            ) : (
                                <>
                                    <span className="font-semibold text-slate-900">
                                        {results.length}
                                    </span>{" "}
                                    {results.length === 1 ? "product" : "products"}
                                    {activeQuery.trim() && (
                                        <> for “{activeQuery.trim()}”</>
                                    )}
                                </>
                            )}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setFiltersOpen(true)}
                                className="
                                    inline-flex
                                    h-10
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-3.5
                                    text-sm
                                    font-medium
                                    text-slate-700
                                    transition
                                    hover:border-slate-300
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-blue-500
                                    lg:hidden
                                "
                            >
                                <SlidersHorizontal size={15} aria-hidden="true" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>

                            <SortDropdown value={sort} onChange={setSort} />
                        </div>

                    </div>

                    <ActiveFilters
                        filter={filter}
                        onChange={setFilter}
                        onReset={resetFilters}
                        priceBounds={priceBounds}
                    />

                    {/* Results / states */}

                    {status === "loading" && <SearchSkeleton />}

                    {status === "error" && (
                        <ErrorState message={error} onRetry={resetSearch} />
                    )}

                    {status === "idle" && (
                        <EmptyState onPickSuggestion={runSearch} />
                    )}

                    {status === "empty" && (
                        <NoResults
                            query={activeQuery}
                            activeFilterCount={activeFilterCount}
                            onClearFilters={resetFilters}
                            onResetSearch={resetSearch}
                            onPickSuggestion={runSearch}
                        />
                    )}

                    {status === "results" && (
                        <>
                            <SearchResults products={paginated} />

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    )}

                </section>

            </div>

        </div>
    );
}
