import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
    message: string;
    onRetry?: () => void;
}

/** Search failed. Offers the one recovery action that can actually help. */
export default function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <section
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center sm:py-20"
        >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-600">
                <AlertTriangle size={26} strokeWidth={1.5} aria-hidden="true" />
            </span>

            <h2 className="mt-6 text-lg font-semibold text-red-900 sm:text-xl">
                Something went wrong
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-red-700">
                {message}
            </p>

            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                    <RotateCcw size={15} aria-hidden="true" />
                    Try again
                </button>
            )}
        </section>
    );
}
