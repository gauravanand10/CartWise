import { useEffect, useState } from "react";

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

    useEffect(() => {
        setCurrentPage(1);
    }, [query, sort, filter]);

    const totalPages = Math.ceil(
        results.length / PRODUCTS_PER_PAGE
    );

    const paginatedProducts = results.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    return (
        <main className="min-h-screen bg-slate-50 pb-24">

            <SearchHeader
                totalResults={results.length}
            />

            <section className="mx-auto mt-10 max-w-7xl px-6">

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

        </main>
    );
}
