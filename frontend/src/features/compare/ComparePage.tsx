import { useCallback, useState } from "react";

import CompareEmpty from "./components/CompareEmpty";
import CompareError from "./components/CompareError";
import CompareGrid from "./components/CompareGrid";
import CompareSkeleton from "./components/CompareSkeleton";
import CompareToolbar from "./components/CompareToolbar";
import CompareVerdictCard from "./components/CompareVerdictCard";
import ProductPicker from "./components/ProductPicker";

import { MIN_COMPARE } from "./constants";
import { useComparison } from "./hooks/useComparison";
import { useCompareSelection } from "./hooks/useCompareSelection";

/**
 * Product Comparison.
 *
 * MainLayout owns the `<main>` landmark and the width container, so this page
 * only adds its own vertical rhythm — the same contract Search and Product
 * Details follow.
 *
 * All comparison logic lives in `useComparison` and `utils/buildComparison`;
 * this component only chooses which state to render and holds the two pieces of
 * genuinely local UI state (the picker and the differences filter).
 */
export default function ComparePage() {
    const {
        slugs,
        add,
        remove,
        clear,
        isFull,
        error: selectionError,
        retry: retrySelection,
    } = useCompareSelection();
    const {
        products,
        sections,
        verdict,
        suggestions,
        status,
        error,
        retry,
        differenceCount,
    } = useComparison();

    const [pickerOpen, setPickerOpen] = useState(false);
    const [differencesOnly, setDifferencesOnly] = useState(false);

    const openPicker = useCallback(() => setPickerOpen(true), []);
    const closePicker = useCallback(() => setPickerOpen(false), []);

    const pick = useCallback(
        async (slug: string) => {
            // `add` became async in Chapter 23.5 — the comparison is a server
            // resource now, so whether the product was accepted is not knowable
            // until it answers. The three result values are unchanged, and this
            // still branches on exactly the same one.
            const result = await add(slug);
            // Keep the dialog open when the add was rejected, so the user can see
            // why and choose differently instead of the sheet just vanishing.
            if (result === "added") setPickerOpen(false);
        },
        [add],
    );

    if (status === "loading") {
        return <CompareSkeleton columns={slugs.length} />;
    }

    /*
     * The selection's own error, new in Chapter 23.5 — the comparison could not
     * be read from or written to the server. Checked before `status`, because a
     * selection that failed to load has no slugs and therefore reports
     * `status === "empty"`, which would show "nothing to compare" to a user
     * whose request had just failed. See the equivalent note in `WishlistPage`.
     */
    if (selectionError) {
        return (
            <CompareError
                message={selectionError}
                onRetry={retrySelection}
                onClear={clear}
            />
        );
    }

    if (status === "error") {
        return (
            <CompareError message={error} onRetry={retry} onClear={clear} />
        );
    }

    if (status === "empty") {
        return <CompareEmpty suggestions={suggestions} />;
    }

    return (
        <div className="space-y-6">

            <header>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Compare products
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                    Specifications, prices and store offers lined up side-by-side,
                    with the better value called out where the data supports it.
                </p>
            </header>

            <CompareToolbar
                count={products.length}
                differenceCount={differenceCount}
                differencesOnly={differencesOnly}
                onToggleDifferences={() =>
                    setDifferencesOnly((value) => !value)
                }
                onAdd={openPicker}
                onClear={clear}
                isFull={isFull}
            />

            {/* One product is a valid state to be in — it is what remains after
                removing the second — but there is nothing to compare, so the
                verdict is withheld rather than declaring a winner of one. */}
            {products.length < MIN_COMPARE ? (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                    Add at least one more product to see a comparison and a
                    verdict.
                </p>
            ) : (
                verdict && (
                    <CompareVerdictCard products={products} verdict={verdict} />
                )
            )}

            <CompareGrid
                products={products}
                sections={sections}
                verdict={products.length >= MIN_COMPARE ? verdict : null}
                differencesOnly={differencesOnly}
                onRemove={remove}
                onAdd={openPicker}
            />

            <ProductPicker
                open={pickerOpen}
                onClose={closePicker}
                suggestions={suggestions}
                onPick={pick}
                selected={slugs}
                isFull={isFull}
            />

        </div>
    );
}
