import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
    children: ReactNode;
    /**
     * Changes to this value reset the boundary.
     *
     * The route path is passed in at the app level: without it, one component
     * throwing would leave the whole application showing this screen until a
     * full page reload, because a boundary that has caught stays caught. With
     * it, navigating anywhere clears the error — which is what a user pressing
     * "Home" reasonably expects to happen.
     */
    resetKey?: string;
    /** Rendered instead of the default screen. Used by the tests. */
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    error: Error | null;
}

/**
 * The last line of defence against a white screen.
 *
 * ===========================================================================
 * CHAPTER 29 — THIS DID NOT EXIST, AND THAT WAS A REAL BUG
 *
 * CartWise had no error boundary anywhere. A grep for `componentDidCatch`,
 * `getDerivedStateFromError` and `ErrorBoundary` across the whole of `src`
 * returned nothing, and `main.tsx` mounted `<App />` directly under
 * `<BrowserRouter>`.
 *
 * REAL-WORLD IMPACT. React's documented behaviour when a render throws and no
 * boundary catches it is to unmount the entire tree. Not the failing component
 * — the entire application, down to a blank `<div id="root">`. The user is
 * left on a white page with no navigation, no footer, no message and no way
 * back except typing a new URL. Every route was one thrown TypeError away from
 * that, and the codebase has plenty of places one could come from: an API
 * response missing a field the mapper dereferences, a `product.stores` array
 * that arrives empty and gets `.reduce()`d without an initial value (see
 * PricingCard), a spec lookup returning undefined.
 *
 * That last one is not hypothetical — `PricingCard` calls
 * `product.stores.reduce((best, s) => ...)` with no seed, which throws
 * "Reduce of empty array with no initial value" the moment a product resolves
 * with zero store offers. That is reachable today: `buildStoreOffers` maps the
 * retailer list, and `GET /api/affiliate/retailers` returning `[]` — which it
 * does if every retailer is unconfigured — produces exactly that.
 *
 * WHAT THIS RENDERS. Not a stack trace. The reader is a shopper, and the only
 * two useful things are "this screen is broken, not your device" and a way out.
 * The error text is logged to the console for whoever is debugging and is
 * deliberately not put on screen: it is frequently a minified variable name,
 * and showing it makes the page look broken twice.
 * ===========================================================================
 */
export default class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // The one place the detail survives. There is no error-reporting
        // service wired into this project, and adding one is a chapter of its
        // own — so this is the console, honestly, rather than a TODO implying
        // the report goes somewhere.
        console.error("Unhandled render error:", error, info.componentStack);
    }

    componentDidUpdate(previous: ErrorBoundaryProps) {
        if (this.state.error && previous.resetKey !== this.props.resetKey) {
            this.setState({ error: null });
        }
    }

    private reset = () => this.setState({ error: null });

    render() {
        if (!this.state.error) return this.props.children;
        if (this.props.fallback) return this.props.fallback;

        return (
            <div
                role="alert"
                className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-6 text-center"
            >
                <span
                    aria-hidden="true"
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sunken text-ink-subtle"
                >
                    <RotateCcw size={24} strokeWidth={1.5} />
                </span>

                <h1 className="mt-6 text-xl font-semibold tracking-tight text-ink">
                    This page didn't load
                </h1>

                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    Something broke on our side, not yours. Nothing you saved has
                    been lost — reloading usually clears it.
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
                    <button
                        type="button"
                        onClick={this.reset}
                        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                        Try again
                    </button>

                    {/*
                        A plain <a>, not a react-router <Link>. This boundary
                        sits above the router in main.tsx so that a throw inside
                        the router itself is still caught — which means there may
                        be no router context here to navigate with. A full page
                        load is also the more reliable recovery from a broken
                        render tree.

                        CHAPTER 30.1 — `href={import.meta.env.BASE_URL}`, not a
                        hardcoded "/". This app is not always served from a
                        domain's root: a GitHub Pages project site lives at
                        `https://<user>.github.io/<repo>/`, and `BASE_URL` is
                        Vite's own build-time constant for exactly that prefix —
                        it reads `vite.config.ts`'s `base` and is `"/"` when
                        unset, so this is a no-op everywhere this app was
                        deployed before. A literal "/" here would have sent a
                        recovering user to the GitHub Pages ACCOUNT root instead
                        of back into the app — the one link on this screen whose
                        entire job is getting them somewhere that works.
                    */}
                    <a
                        href={import.meta.env.BASE_URL}
                        className="rounded-full border border-line-strong bg-card px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                        Go to homepage
                    </a>
                </div>
            </div>
        );
    }
}
