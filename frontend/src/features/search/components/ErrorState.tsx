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
            className="rounded-2xl border border-line bg-card px-6 py-14 text-center sm:py-20"
        >
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-sunken text-ink-subtle">
                <AlertTriangle size={26} strokeWidth={1.5} aria-hidden="true" />
            </span>

            <h2 className="mt-8 text-2xl text-ink sm:text-3xl">
                Something went wrong
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-muted">
                {message}
            </p>

            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                    <RotateCcw size={15} aria-hidden="true" />
                    Try again
                </button>
            )}
        </section>
    );
}
