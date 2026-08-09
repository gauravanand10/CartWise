import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react";

interface WishlistErrorProps {
    message: string;
    onRetry: () => void;
    onClear: () => void;
}

/**
 * The wishlist failed to load.
 *
 * Offers "clear" alongside "retry" because the failure can be caused by the
 * saved list itself — without a way to empty it, a user whose stored slugs keep
 * failing would meet this screen every time they open the page.
 */
export default function WishlistError({
    message,
    onRetry,
    onClear,
}: WishlistErrorProps) {
    return (
        <section
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center sm:rounded-[24px] sm:py-20"
        >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-600">
                <AlertTriangle size={26} strokeWidth={1.5} aria-hidden="true" />
            </span>

            <h1 className="mt-6 text-lg font-semibold text-red-900 sm:text-xl">
                Wishlist unavailable
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-red-700">
                {message}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                    <RotateCcw size={15} aria-hidden="true" />
                    Try again
                </button>

                <button
                    type="button"
                    onClick={onClear}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                    <Trash2 size={15} aria-hidden="true" />
                    Clear wishlist
                </button>
            </div>
        </section>
    );
}
