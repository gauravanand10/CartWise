import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react";

interface CompareErrorProps {
    message: string;
    onRetry: () => void;
    onClear: () => void;
}

/**
 * The comparison failed to load.
 *
 * Offers "clear" alongside "retry" because a comparison can be broken by its own
 * saved selection — without a way to empty it, a user whose stored slugs keep
 * failing would be stuck on this screen every time they open the page.
 */
export default function CompareError({
    message,
    onRetry,
    onClear,
}: CompareErrorProps) {
    /*
        CHAPTER 29 — the whole panel was red.

        Red background, red border, red heading, red body copy, a red primary
        button AND a red secondary button. In this design system `danger` means
        out-of-stock or destructive, and a comparison that failed to load is
        neither — it is a request that did not arrive. Painting the entire
        screen in the alarm colour spends the one signal the system has, and it
        made a transient network fault look like data loss.

        The panel is neutral now and the red is spent where it is earned: on
        "Clear comparison", which is the destructive control and the only thing
        here that cannot be undone. That is the same reasoning that took red off
        the wishlist heart in Chapter 27 — the colour has to keep meaning one
        thing.

        `role="alert"` stays, so the failure is still announced.
    */
    return (
        <section
            role="alert"
            className="rounded-2xl border border-line bg-card px-6 py-16 text-center sm:rounded-[24px] sm:py-20 cw-reveal"
        >
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-sunken text-ink-subtle">
                <AlertTriangle size={28} strokeWidth={1.25} aria-hidden="true" />
            </span>

            <h1 className="mt-8 text-2xl text-ink sm:text-3xl">
                Comparison unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-muted">
                {message}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                    <RotateCcw size={15} aria-hidden="true" />
                    Try again
                </button>

                {/* The one destructive control on the screen, and the only
                    thing here wearing the danger colour. */}
                <button
                    type="button"
                    onClick={onClear}
                    className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-card px-5 py-2.5 text-sm font-semibold text-danger transition duration-200 hover:border-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2"
                >
                    <Trash2 size={15} aria-hidden="true" />
                    Clear comparison
                </button>
            </div>
        </section>
    );
}
