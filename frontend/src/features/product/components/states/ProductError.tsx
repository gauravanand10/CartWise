import { AlertTriangle, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductErrorProps {
    message: string;
    onRetry: () => void;
}

/**
 * The load failed for a reason that might not repeat.
 *
 * Distinct from "not found": here a retry can genuinely succeed, so it is the
 * primary action. Matches the Search feature's error state so the two read as
 * the same application.
 */
export default function ProductError({ message, onRetry }: ProductErrorProps) {
    return (
        <section
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center sm:py-20"
        >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-600">
                <AlertTriangle size={26} strokeWidth={1.5} aria-hidden="true" />
            </span>

            <h1 className="mt-6 text-lg font-semibold text-red-900 sm:text-xl">
                Something went wrong
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

                <Link
                    to="/search"
                    className="rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                    Back to search
                </Link>
            </div>
        </section>
    );
}
