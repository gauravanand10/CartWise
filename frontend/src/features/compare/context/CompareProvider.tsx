import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { CompareContext } from "./compareContext";
import type { CompareSelection } from "./compareContext";
import { MAX_COMPARE } from "../constants";
import type { AddResult } from "../types/compare";

/** Stable identity for "signed out", so the memo below does not churn. */
const EMPTY: string[] = [];
import { useAuth } from "../../auth";
import {
    addToComparison,
    ApiRequestError,
    clearComparison,
    fetchComparison,
    removeFromComparison,
} from "../../../services/api";

/**
 * Provides the comparison selection to the whole app.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 23.5: localStorage → the real API.
 *
 * Backed by `createPersistedList(COMPARE_STORAGE_KEY)` until now, with the
 * four-item cap applied on read and on write because a hand-edited value could
 * otherwise render a fifth column. It now reads and writes
 * `GET/POST/DELETE /api/users/:userId/comparison`, the endpoints Chapter 23
 * built and never called.
 *
 * The contract in `compareContext` is unchanged apart from the mutators
 * returning Promises: `add` still resolves to `"added"`, `"duplicate"` or
 * `"full"`, and `ComparePage` still branches on exactly those three values.
 *
 * WHERE THE CAP LIVES NOW. In three places, and that is deliberate rather than
 * duplicated: `MAX_COMPARE` here drives the disabled fifth toggle,
 * `ComparisonService.MAX_COMPARISON_PRODUCTS` refuses the request, and
 * `ck_comparison_position_range` makes a fifth row unrepresentable. This one is
 * now the *affordance* only — it is no longer the thing that enforces anything,
 * which is the change Chapter 23 made server-side and this file finally relies
 * on. The `"full"` result below is produced locally when the client already
 * knows, and recovered from the server's 409 when it does not.
 *
 * INDEPENDENCE FROM THE WISHLIST is unchanged and remains structural: different
 * endpoints, different table, no shared state. Removing a product from one
 * still cannot reach the other.
 * ---------------------------------------------------------------------------
 */
export default function CompareProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { user } = useAuth();
    const userId = user?.id ?? null;

    const [slugs, setSlugs] = useState<string[]>([]);
    const [error, setError] = useState("");

    /*
     * Synchronous mirror of `slugs`. See the long note in `WishlistProvider` —
     * same reason, same failure it prevents: React does not run `setState`
     * updaters synchronously, so reading the current list inside one and acting
     * on the result immediately afterwards silently does nothing.
     */
    const slugsRef = useRef<string[]>([]);

    const commit = useCallback((next: string[]) => {
        slugsRef.current = next;
        setSlugs(next);
    }, []);

    /**
     * Counts local changes, so an in-flight load cannot undo one.
     *
     * Same race as the wishlist's: the mount GET resolves after the user has
     * already added a column, and overwrites it with the list as it was before.
     * A load applies its result only if this has not moved since it started.
     */
    const mutations = useRef(0);

    /** A commit made by the user rather than by a load. Bumps the guard above. */
    const commitLocal = useCallback(
        (next: string[]) => {
            mutations.current += 1;
            commit(next);
        },
        [commit],
    );

    /** Discards a response for a user who is no longer the current one. */
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
            const items = await fetchComparison(id);

            if (loadFor.current !== id) return;
            // A newer local change supersedes this answer.
            if (mutations.current !== startedAt) return;

            setError("");

            // The server returns columns ordered by its stored `position`, so
            // array order here is column order. The cap is not re-applied on
            // read the way the localStorage version had to: a fifth row cannot
            // exist to be trimmed.
            commit(items.map((item) => item.product.slug));
        } catch {
            if (loadFor.current !== id) return;

            setError("We couldn't load your comparison. Please try again.");
        }
    }, [commit]);

    useEffect(() => {
        // Signed out is an empty comparison — same reasoning as the wishlist.
        // This provider is mounted app-wide for the navbar badge, so it spends
        // most of its life without a session and must not fetch or throw.
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
         * setState inside `load` sits behind `await fetchComparison(...)`, so none
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

    const retry = useCallback(() => {
        // Not an effect, so no suppression is needed here — the rule that fires
        // on the mount effect above is specific to effect bodies.
        if (userId === null) return;
        void load(userId);
    }, [userId, load]);

    /**
     * Adds a product, reporting why if it could not be added.
     *
     * Optimistic: the column appears immediately and is withdrawn if the request
     * fails. The two rejections are decided before anything is sent — a
     * duplicate and a full comparison are both knowable from local state — which
     * is why neither costs a round-trip.
     *
     * The server can still answer `"full"` when this client thought there was
     * room, and that is not a redundant check failing twice. It is the case the
     * cap moved server-side for: a second tab, a stale view, or a request
     * replayed by hand. A 409 with code `COMPARISON_FULL` is translated back
     * into the same `"full"` result the local check produces, so `ComparePage`
     * handles both through one branch and never learns there were two paths.
     */
    const add = useCallback(
        async (slug: string): Promise<AddResult> => {
            if (userId === null) return "added";

            const previous = slugsRef.current;

            // Both rejections are knowable locally, so neither costs a request.
            // Duplicate is checked first, matching the server's own order — that
            // is what makes re-adding into a full comparison a no-op rather than
            // a refusal.
            if (previous.includes(slug)) return "duplicate";
            if (previous.length >= MAX_COMPARE) return "full";

            // Appended, not prepended: comparison columns read left to right in
            // the order they were chosen.
            commitLocal([...previous, slug]);

            try {
                await addToComparison(userId, slug);
                return "added";
            } catch (caught) {
                commitLocal(previous);

                if (
                    caught instanceof ApiRequestError &&
                    caught.code === "COMPARISON_FULL"
                ) {
                    // The server knew something this client did not. Reported as
                    // the ordinary "full" outcome rather than as an error,
                    // because from the user's side it is one.
                    return "full";
                }

                setError("We couldn't add that product. Please try again.");
                return "added";
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
                await removeFromComparison(userId, slug);
            } catch (caught) {
                // 404 means "not in the comparison", which is the state this
                // call wanted. Rolling back would restore a column the user just
                // removed. Same reasoning, and same rapid-toggle race, as the
                // wishlist's remove — see the note there.
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
     * Adds if absent, removes if present.
     *
     * Delegates rather than reimplementing both paths, so the optimistic
     * update, the rollback and the 409 translation exist once each. The
     * membership test reads through the state setter to keep this callback
     * referentially stable.
     */
    const toggle = useCallback(
        async (slug: string): Promise<AddResult | "removed"> => {
            if (userId === null) return "added";

            if (slugsRef.current.includes(slug)) {
                await remove(slug);
                return "removed";
            }

            return add(slug);
        },
        [userId, add, remove],
    );

    /**
     * Empties the comparison in one request.
     *
     * Unlike the wishlist's clear, which fans out into N deletes because the API
     * offers no bulk route, the comparison has `DELETE /comparison` precisely so
     * that "start over" cannot half-succeed.
     */
    const clear = useCallback(async (): Promise<void> => {
        if (userId === null) return;

        const previous = slugsRef.current;
        if (previous.length === 0) return;

        commitLocal([]);

        try {
            await clearComparison(userId);
        } catch {
            commitLocal(previous);
            setError("We couldn't clear your comparison. Please try again.");
        }
    }, [userId, commitLocal]);

    // Signed out is an empty comparison, derived rather than stored — same
    // reasoning as the wishlist's.
    const visibleSlugs = userId === null ? EMPTY : slugs;
    const visibleError = userId === null ? "" : error;

    const value = useMemo<CompareSelection>(
        () => ({
            slugs: visibleSlugs,
            count: visibleSlugs.length,
            isFull: visibleSlugs.length >= MAX_COMPARE,
            error: visibleError,
            retry,
            add,
            remove,
            toggle,
            clear,
            isComparing: (slug: string) => visibleSlugs.includes(slug),
        }),
        [visibleSlugs, visibleError, retry, add, remove, toggle, clear],
    );

    return (
        <CompareContext.Provider value={value}>
            {children}
        </CompareContext.Provider>
    );
}
