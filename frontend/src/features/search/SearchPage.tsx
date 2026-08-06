import { useState } from "react";

import SearchHeader from "./components/SearchHeader";
import SearchInput from "./components/SearchInput";
import SearchStats from "./components/SearchStats";
import FilterSidebar from "./components/FilterSidebar";
import SortDropdown from "./components/SortDropdown";
import SearchResults from "./components/SearchResults";
import SearchSkeleton from "./components/SearchSkeleton";
import EmptyState from "./components/EmptyState";
import ErrorState from "./components/ErrorState";
import Pagination from "./components/Pagination";

import { useSearch } from "./hooks/useSearch";

const PRODUCTS_PER_PAGE = 6;

export default function SearchPage() {
    const {
        query,
        setQuery,

        sort,
        setSort,

        filter,
        setFilter,

        results,

        categories,

        loading,

        error,
    } = useSearch();

    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 whenever the result set changes. Adjusting state during
    // render (React's documented pattern) rather than in an effect avoids the
    // extra commit — and the flash of an out-of-range page — that a
    // setState-inside-useEffect would cause.
    const resultsKey = `${query}|${sort}|${filter.category ?? ""}`;
    const [lastResultsKey, setLastResultsKey] = useState(resultsKey);

    if (resultsKey !== lastResultsKey) {
        setLastResultsKey(resultsKey);
        setCurrentPage(1);
    }

    const totalPages = Math.ceil(
        results.length / PRODUCTS_PER_PAGE
    );

    const paginatedProducts = results.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    return (
        // No <main> or width wrapper here: MainLayout already provides both.
        // Repeating them nested a second <main> landmark inside the first and
        // added a second layer of horizontal padding, which pushed this page's
        // content out of alignment with the navbar above it.
        <div>

            <SearchHeader
                totalResults={results.length}
            />

            <section className="mt-10">

                <SearchInput
                    query={query}
                    onQueryChange={setQuery}
                />

                <SearchStats
                    total={results.length}
                />

                <div className="mt-12 grid gap-10 lg:grid-cols-12">

                    <aside className="lg:col-span-3">

                        <FilterSidebar
                            categories={categories}
                            selectedCategory={
                                filter.category || "All"
                            }
                            onCategoryChange={(category) =>
                                setFilter({
                                    category,
                                })
                            }
                        />

                    </aside>

                    <section className="space-y-8 lg:col-span-9">

                        <div className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-lg">

                            <div>

                                <h2 className="text-2xl font-black text-slate-900">
                                    Search Results
                                </h2>

                                <p className="mt-2 text-slate-500">
                                    {results.length} Products Found
                                </p>

                            </div>

                            <SortDropdown
                                value={sort}
                                onChange={setSort}
                            />

                        </div>

                        {loading ? (
                            <SearchSkeleton />
                        ) : error ? (
                            <ErrorState
                                message={error}
                            />
                        ) : results.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <>
                                <SearchResults
                                    products={paginatedProducts}
                                />

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </>
                        )}

                    </section>

                </div>

            </section>

        </div>
    );
}
