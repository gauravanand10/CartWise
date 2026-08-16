import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { WishlistContext } from "./wishlistContext";
import type { WishlistSelection } from "./wishlistContext";
import type { WishlistToggleResult } from "../types/wishlist";

/** Stable identity for "signed out", so the memo below does not churn. */
const EMPTY: string[] = [];
import { useAuth } from "../../auth";
import {
    addToWishlist,
    ApiRequestError,
    fetchWishlist,
    removeFromWishlist,
} from "../../../services/api";

/**
 * Provides the wishlist selection to the whole app.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 23.5: localStorage → the real API.
 *
 * This provider used to be backed by `createPersistedList(WISHLIST_STORAGE_KEY)`
 * — a de-duplicated string list in localStorage, written synchronously on every
 * change, synced across tabs by the `storage` event. It now reads and writes
 * `GET/POST/DELETE /api/users/:userId/wishlist`.
 *
 * WHAT DID NOT CHANGE: the contract in `wishlistContext`. Consumers still get
 * `slugs`, `count`, `isWishlisted` and the same four mutators returning the same
 * values — `toggle` still answers `"added"` or `"removed"`. The one difference
 * is that the mutators now return a Promise of that value instead of the value,
 * which is unavoidable: the answer genuinely is not known until the server has
 * been asked. Every consumer that reads a result was updated; the ones that
 * fire and forget were left alone, because they still work.
 *
 * WHY SLUGS AND NOT THE SERVER'S PRODUCTS. The API returns each saved product in
 * full, and this provider throws all of that away to keep exposing a list of
 * slugs. That is deliberate: `slugs` is the contract, `useWishlist` already
 * resolves them into card models, and widening the context here would push a
 * second product shape into every consumer for no gain. The cost is honest — the
 * wishlist page fetches product data the wishlist response already contained —
 * and it is recorded in the final report rather than hidden.
 *
 * WHAT CROSS-TAB SYNC COST. The `storage` subscription is gone with the store
 * that provided it. Two open tabs now diverge until one refetches, where before
 * they converged within a frame. The server is the shared truth rather than the
 * storage key, and there is no push channel to replace the event — polling or a
 * websocket would be a real feature, not a port of this one.
 * ---------------------------------------------------------------------------
 */
export default function WishlistProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { user } = useAuth();
    const userId = user?.id ?? null;

    const [slugs, setSlugs] = useState<string[]>([]);

    /*
     * A synchronous mirror of `slugs`, and not an optimisation.
     *
     * The mutators below need three things at the instant they are called: the
     * current list, the list to roll back to, and whether the work is a no-op.
     * The obvious way to get them is to read inside a `setSlugs(current => …)`
     * updater — which is what the first version of this file did, and it was
     * wrong. React does not invoke updaters synchronously; it defers them to the
     * render phase. So the code after the call read a variable the updater had
     * not assigned yet, concluded "no change", and returned without ever issuing
     * the request. Two tests caught it as a toggle that would not untoggle.
     *
     * Closing over `slugs` instead would fix the timing and break something
     * else: the callbacks would change identity on every selection change, and
     * every consumer of this context would re-render on each one — the exact
     * thing the localStorage version used the updater form to avoid.
     *
     * A ref gives both. It is current at call time, and it is stable, so the
     * callbacks below have empty dependency lists on the selection itself.
     * `commit` is the only writer, so the ref and the state cannot drift.
     */
    const slugsRef = useRef<string[]>([]);

    /**
     * Counts local changes, so an in-flight load cannot undo one.
     *
     * The race this closes: mounting starts a GET, the user clicks a heart
     * before it lands, the optimistic add shows immediately — and then the GET
     * resolves with the list as it was *before* the click and overwrites it. The
     * heart empties on its own a moment after being filled, and nothing looks
     * like it failed because nothing did.
     *
     * A load records this counter when it starts and applies its result only if
     * the count has not moved. A user's intent expressed since the request went
     * out is newer than the answer coming back, and the write that intent
     * triggered will reconcile the server anyway.
     */
    const mutations = useRef(0);

    /** Sets state and its mirror together. The single place either is written. */
    const commit = useCallback((next: string[]) => {
        slugsRef.current = next;
        setSlugs(next);
    }, []);

    /** A commit made by the user rather than by a load. Bumps the guard above. */
    const commitLocal = useCallback(
        (next: string[]) => {
            mutations.current += 1;
            commit(next);
        },
        [commit],
    );

    /**
     * Why the load failed, or "" when it did not.
     *
     * Exposed through the context so `WishlistPage` can render the existing
     * `WishlistError` with it. Kept as a message rather than an error object
     * because that component takes a string, and because the distinction between
     * failure kinds is made here, where the status code is still in scope.
     */
    const [error, setError] = useState("");

    /*
     * Guards against a stale response overwriting a newer one.
     *
     * Two loads can be in flight after a fast sign-out/sign-in, and the first
     * one landing second would repopulate the previous user's wishlist. The ref
     * records which user the current load belongs to; a response for anyone else
     * is discarded rather than applied.
     */
    const loadFor = useRef<number | null>(null);

    const load = useCallback(async (id: number) => {
        loadFor.current = id;
        const startedAt = mutations.current;

        /*
         * The error is cleared on success rather than here, and that is a lint
         * constraint turned into a better behaviour.
         *
         * `setError("")` at the top of this function runs synchronously when the
         * mount effect calls it, which `react-hooks/set-state-in-effect`
         * correctly refuses — it is a cascading render for a value nothing has
         * read yet. Clearing on success instead means a failed load's message
         * stays on screen until a retry actually works, rather than blanking the
         * moment the retry is issued and leaving the user looking at nothing
         * while it fails again.
         */
        try {
            const items = await fetchWishlist(id);

            if (loadFor.current !== id) return;
            // The user changed something while this was in flight. Their change
            // is newer than this answer; discard the answer.
            if (mutations.current !== startedAt) return;

            setError("");

            commit(items.map((item) => item.product.slug));
        } catch {
            if (loadFor.current !== id) return;

            setError("We couldn't load your wishlist. Please try again.");
        }
    }, [commit]);

    useEffect(() => {
        /*
         * Signed out is an empty wishlist, not an error and not a crash.
         *
         * This provider is mounted app-wide — the navbar badge renders on every
         * route, including the public ones — so it is mounted far more often
         * than it is signed in. Fetching without a session would send a
         * guaranteed 401 on every page load of a logged-out visit, and `api.ts`
         * treats a 401 as "discard the stored session", so it would also be
         * self-inflicted noise. Zero is the honest answer to "how many products
         * has nobody saved".
         */
        if (userId === null) {
            /*
             * Ref only — deliberately no setState here.
             *
             * `react-hooks/set-state-in-effect` refuses a synchronous setState
             * in an effect body, and it is right to: this would be a cascading
             * render for a value that is simply derived. The signed-out
             * selection is computed below instead, so signing out needs no state
             * write at all. The ref is still cleared because the mutators read
             * it directly and must not see the previous user's list.
             */
            loadFor.current = null;
            slugsRef.current = [];
            return;
        }

        /*
         * Safe to call here, and it took a lint failure to make it so. Every
         * setState inside `load` sits behind `await fetchWishlist(...)`, so none
         * runs synchronously and none can cascade a render during this effect.
         * The one that did — a `setError("")` at the top of `load` — was moved
         * out rather than silenced.
         *
         * The rule still reports it, because it flags any setState *reachable*
         * from a function called in an effect without tracing whether an await
         * stands in the way. That is the false positive suppressed below, and
         * the suppression is deliberately one line rather than a file-level
         * exclusion: a genuinely synchronous setState added to this effect later
         * should still fail.
         */
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load(userId);
    }, [userId, load]);

    /**
     * Re-runs the load. Wired to `WishlistError`'s "Try again".
     *
     * A no-op when signed out, which is reachable: a session can expire while
     * the error screen is on display, and the retry button should not then throw.
     */
    const retry = useCallback(() => {
        // Not an effect, so no suppression is needed here — the rule that fires
        // on the mount effect above is specific to effect bodies.
        if (userId === null) return;
        void load(userId);
    }, [userId, load]);

    /*
     * ---------------------------------------------------------------------
     * THE MUTATORS: optimistic, with rollback.
     *
     * Each one moves local state first, issues the request second, and restores
     * the previous state if the request fails. That ordering is the entire point
     * of the exercise — a heart that waits for a round-trip before filling reads
     * as a broken button on any connection worse than a laptop on wifi.
     *
     * Rollback captures the list *inside* the state setter rather than closing
     * over `slugs`, for the same reason the localStorage version decided
     * outcomes there: it keeps these callbacks referentially stable, so every
     * consumer of this context does not re-render on each selection change. The
     * captured value is the list as it actually was at the moment of the change,
     * which is what a rollback needs.
     * ---------------------------------------------------------------------
     */

    const add = useCallback(
        async (slug: string): Promise<void> => {
            if (userId === null) return;

            const previous = slugsRef.current;

            // Already saved: nothing to change, nothing to send.
            if (previous.includes(slug)) return;

            // Prepended, so array order is recency — the same rule the
            // localStorage version used, and what gives "Recently added" its
            // ordering without a per-entry timestamp.
            commitLocal([slug, ...previous]);

            try {
                await addToWishlist(userId, slug);
            } catch {
                commitLocal(previous);
                setError("We couldn't save that product. Please try again.");
            }
        },
        [userId, commitLocal],
    );

    const remove = useCallback(
        async (slug: string): Promise<void> => {
            if (userId === null) return;

            const previous = slugsRef.current;

            if (!previous.includes(slug)) return;

            commitLocal(previous.filter((item) => item !== slug));

            try {
                await removeFromWishlist(userId, slug);
            } catch (caught) {
                /*
                 * A 404 here is not a failure, and treating it as one was a real
                 * bug rather than a missing edge case.
                 *
                 * The endpoint answers 404 for "this user has not saved that
                 * product" — deliberately, so a client working from a stale list
                 * is told rather than given a misleading success. But the state
                 * this call wanted is *absent*, and 404 means absent. Rolling
                 * back would put the product back on screen after the user
                 * removed it, and leave the UI disagreeing with the server in
                 * the one direction the server is right about.
                 *
                 * It is reachable without any staleness at all: toggling twice
                 * quickly issues POST then DELETE, and if the DELETE overtakes
                 * the POST the server has nothing to delete yet. Two of this
                 * suite's tests do exactly that, which is how this was found.
                 */
                if (caught instanceof ApiRequestError && caught.status === 404) {
                    return;
                }

                commitLocal(previous);
                setError("We couldn't remove that product. Please try again.");
            }
        },
        [userId, commitLocal],
    );

    /**
     * Adds if absent, removes if present. Still reports which it was.
     *
     * The result is decided from the state setter, before the request, which is
     * what lets it stay accurate: it describes the change the user made, not
     * whether the server has finished recording it. A rejected request rolls the
     * list back and surfaces an error, and the returned value has by then
     * already been read by whatever announced the change.
     */
    const toggle = useCallback(
        async (slug: string): Promise<WishlistToggleResult> => {
            if (userId === null) return "added";

            // Read from the ref, so the decision reflects the list as it stands
            // at this instant — including a change made by a click a moment ago
            // whose request has not landed yet.
            if (slugsRef.current.includes(slug)) {
                await remove(slug);
                return "removed";
            }

            await add(slug);
            return "added";
        },
        [userId, add, remove],
    );

    /**
     * Empties the wishlist. Wired to the page's "Clear" and to `WishlistError`.
     *
     * The API has no bulk-delete for wishlists — unlike the comparison, which
     * does — so this is N requests. They are issued together rather than in
     * sequence, and a single failure rolls the whole list back: a partially
     * cleared wishlist is a state the user did not ask for and could not have
     * predicted.
     */
    const clear = useCallback(async (): Promise<void> => {
        if (userId === null) return;

        const previous = slugsRef.current;
        if (previous.length === 0) return;

        commitLocal([]);

        try {
            await Promise.all(
                previous.map((slug) => removeFromWishlist(userId, slug)),
            );
        } catch {
            commitLocal(previous);
            setError("We couldn't clear your wishlist. Please try again.");
        }
    }, [userId, commitLocal]);

    /*
     * Signed out is an empty wishlist, derived rather than stored.
     *
     * Computing it here instead of writing `[]` into state on sign-out keeps the
     * effect above free of setState, and makes the rule unconditional: there is
     * no ordering in which a signed-out render can show the previous user's
     * saved products, because the state is never consulted without a session.
     */
    const visibleSlugs = userId === null ? EMPTY : slugs;
    const visibleError = userId === null ? "" : error;

    const value = useMemo<WishlistSelection>(
        () => ({
            slugs: visibleSlugs,
            count: visibleSlugs.length,
            error: visibleError,
            retry,
            add,
            remove,
            toggle,
            clear,
            isWishlisted: (slug: string) => visibleSlugs.includes(slug),
        }),
        [visibleSlugs, visibleError, retry, add, remove, toggle, clear],
    );

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}
