import { useEffect, useRef } from "react";
import { Check, Plus, X } from "lucide-react";

import SafeImage from "../../../components/ui/SafeImage";
import { formatPrice } from "../../../lib/currency";
import type { ProductCardModel } from "../../product/types/product";

interface ProductPickerProps {
    open: boolean;
    onClose: () => void;
    suggestions: ProductCardModel[];
    onPick: (slug: string) => void;
    /** Slugs already in the comparison — shown as picked, not offered again. */
    selected: string[];
    isFull: boolean;
}

const FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Chooses the next product to compare.
 *
 * A dialog rather than a route so the comparison behind it is not torn down and
 * rebuilt — picking a product should feel like adding a column, not like
 * navigating away and coming back.
 *
 * Already-selected products stay listed but disabled, which is how duplicates
 * are prevented at the point of choice rather than with an error afterwards.
 */
export default function ProductPicker({
    open,
    onClose,
    suggestions,
    onPick,
    selected,
    isFull,
}: ProductPickerProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Declaring `aria-modal` obliges the dialog to behave like one: focus moves
    // in, Tab cannot escape to the page behind, Escape closes, and the page
    // does not scroll underneath.
    useEffect(() => {
        if (!open) return;

        const opener = document.activeElement as HTMLElement | null;
        const dialog = dialogRef.current;
        dialog?.focus();

        const root = document.documentElement;
        const previousOverflowY = root.style.overflowY;
        const previousPaddingRight = root.style.paddingRight;

        // Reserve the space a classic scrollbar gives up, or the page behind
        // jumps sideways as the lock takes effect.
        const scrollbar = window.innerWidth - root.clientWidth;
        root.style.overflowY = "hidden";
        if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
                return;
            }

            if (event.key !== "Tab" || !dialog) return;

            const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || active === dialog)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            root.style.overflowY = previousOverflowY;
            root.style.paddingRight = previousPaddingRight;
            opener?.focus();
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">

            <div
                className="absolute inset-0 bg-slate-900/50"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="picker-heading"
                tabIndex={-1}
                className="
                    relative
                    flex
                    max-h-[85vh]
                    w-full
                    max-w-2xl
                    flex-col
                    rounded-t-2xl
                    bg-white
                    shadow-2xl
                    focus:outline-none
                    sm:rounded-2xl
                "
            >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
                    <div className="min-w-0">
                        <h2
                            id="picker-heading"
                            className="text-base font-semibold text-slate-900 sm:text-lg"
                        >
                            Add a product to compare
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {isFull
                                ? "Remove a product first — you can compare four at a time."
                                : "Products from the same category are listed first."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close product picker"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>

                <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto p-2">
                    {suggestions.map((product) => {
                        const already = selected.includes(product.slug);
                        const disabled = already || isFull;

                        return (
                            <li key={product.slug}>
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => onPick(product.slug)}
                                    className="
                                        flex
                                        w-full
                                        items-center
                                        gap-3
                                        rounded-xl
                                        px-3
                                        py-2.5
                                        text-left
                                        transition
                                        hover:bg-slate-50
                                        focus-visible:outline-none
                                        focus-visible:ring-2
                                        focus-visible:ring-blue-500
                                        disabled:cursor-not-allowed
                                        disabled:opacity-55
                                        disabled:hover:bg-transparent
                                    "
                                >
                                    <SafeImage
                                        src={product.image}
                                        alt=""
                                        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50"
                                        imgClassName="h-full w-full object-contain p-1"
                                        iconClassName="h-5 w-5 text-slate-300"
                                    />

                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-semibold text-slate-900">
                                            {product.name}
                                        </span>
                                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                                            {product.brand} · {product.category} ·{" "}
                                            {formatPrice(product.price)}
                                        </span>
                                    </span>

                                    <span
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${already
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-slate-100 text-slate-500"
                                            }`}
                                    >
                                        {already ? (
                                            <Check size={15} aria-label="Already comparing" />
                                        ) : (
                                            <Plus size={15} aria-hidden="true" />
                                        )}
                                    </span>
                                </button>
                            </li>
                        );
                    })}

                    {suggestions.length === 0 && (
                        <li className="px-3 py-10 text-center text-sm text-slate-500">
                            Every product in the catalogue is already in this
                            comparison.
                        </li>
                    )}
                </ul>

            </div>
        </div>
    );
}
