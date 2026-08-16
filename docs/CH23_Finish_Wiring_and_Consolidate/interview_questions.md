# 🎯 CH23 — Interview Questions

> **Project:** CartWise  
> **Chapter:** Finish Wiring & Consolidate
>
> This chapter covers the missing frontend auth layer, converting Wishlist/Compare from localStorage to real authenticated API calls, three real race conditions found during that conversion, unifying two divergent ProductCard components, and migrating the color system into Tailwind's token layer.

---

# 📚 Beginner Level

## Q1. What did the frontend actually have for authentication before this chapter?

### Answer

`services/api.ts` already had `login`, `signup`, `getSession`, `setSession` fully implemented — but zero callers. There was no login page, no signup page, no auth context, and the navbar's only "Login" control was a `<button>` with no `onClick` handler at all.

---

## Q2. Why couldn't Wishlist/Compare be wired to the real backend without building auth first?

### Answer

Both APIs are user-scoped and JWT-authenticated — every endpoint 401s without a valid token. With no frontend mechanism to log in, there was no token to send, so there was nothing to wire yet.

---

## Q3. Where does the session actually live after this chapter?

### Answer

```text
cartwise.auth.session   (localStorage, via api.ts)
   { userId, email, token }
```

`AuthProvider` reads this on mount; it does not maintain a second copy of its own.

---

## Q4. What does `AuthProvider` do if the stored session is invalid or expired?

### Answer

Nothing proactively — there is no session-validation endpoint on the backend. A restored token is trusted until an actual request fails with a 401, at which point `api.ts` clears the session.

---

## Q5. Why does `useAuth()` throw instead of returning a default/empty value when called outside `AuthProvider`?

### Answer

Matches the existing pattern from `useWishlistSelection` — a silent fallback would make every login-dependent control render as if it worked while doing nothing, which is much harder to notice than an immediate thrown error during development.

---

## Q6. What are `/wishlist` and `/compare` gated behind after this chapter?

### Answer

`ProtectedRoute`. Both routes require login — an unauthenticated visit redirects to `/login`. This matches the backend, which requires a valid token for both APIs regardless.

---

## Q7. What two ProductCard components existed before this chapter, and where did each live?

### Answer

```text
components/ui/ProductCard.tsx                      (shared/canonical)
features/home/components/product/ProductCard.tsx   (home-feature only)
```

---

## Q8. Why weren't the two ProductCard components simply near-duplicates you could pick one and delete the other?

### Answer

They expected different data shapes. The shared card took `ProductCardModel` with a numeric `price` (`99999`); the home-feature card took `HomeProduct` with a pre-formatted string price (`"₹99,999"`). Deleting one without reconciling the data model would have broken every caller of whichever one was removed.

---

## Q9. What is `toCardModel.ts` and why was it needed?

### Answer

An adapter function converting `HomeProduct` into `ProductCardModel`, so every home-feature caller could feed the single, merged `ProductCard` component without CartWise needing two separate card implementations.

---

## Q10. How many color values were migrated into Tailwind's token system, and were any values changed in the process?

### Answer

14 colors, and no — every value was verified byte-identical between the old `:root` variable and its new Tailwind token equivalent. This was a structural move, not a redesign.

---

## Q11. What happened when a new token's name collided with one already established in Chapter 20?

### Answer

Three collisions occurred (`success`, `danger`, `surface`). Rather than overwrite the live Chapter 20 token with a different value under the same name, the legacy values were kept under a `legacy-` prefix — preserving both instead of one silently replacing the other.

---

# 📚 Intermediate Level

## Q12. Walk through why the `Promise<WishlistToggleResult>` resolution satisfies both "add/remove/toggle become async" and "the public contract must not change" at once.

### Answer

The two requirements only look contradictory if "contract" is read as "exact return type." Read as "the meaning of what's returned," nothing changed: `"added"`, `"removed"`, `"full"`, `"duplicate"` are still the only possible values, and every consumer still branches on the exact same set. The only change is that reading the result now requires an `await` first. This is the narrowest possible interpretation of "must not change" that's still compatible with "becomes async" at all — the alternative reading (stay fully synchronous) would have made the async requirement impossible to satisfy.

---

## Q13. How were consumers of the synchronous `add`/`toggle` functions found and updated?

### Answer

A repo-wide `grep` for call sites, rather than assuming which files needed updates. It found exactly one site that read the return value without awaiting it (`ComparePage.tsx`); every fire-and-forget call site (`ProductCard`, `ProductActions`, clear handlers) needed no change, since they never inspected the return value in the first place.

---

## Q14. Explain the first race condition found: what went wrong with reading `previous` inside a `setSlugs` updater?

### Answer

```tsx
setSlugs(current => {
    previous = current;
    return next;
});
sendRequest(previous);  // reads previous immediately after the call above
```

React defers the updater function to its render phase — it does not run synchronously at the call site. Code immediately after `setSlugs(...)` that reads a variable the updater was supposed to assign is reading a value that hasn't actually been set yet. The fix was a `slugsRef` mirror kept in sync alongside state, so the network call always reads a value that's genuinely current rather than a variable assignment that hasn't happened yet.

---

## Q15. Explain the second race condition: how did a stale network response overwrite a fresher optimistic update?

### Answer

```text
t=0    Mount fires GET /wishlist (5 items)
t=50   User clicks a heart → optimistic add → 6 items shown
t=300  The t=0 GET resolves → returns the OLD 5-item list
       → overwrites the optimistic 6th item
       → the heart empties on its own
```

The mount's background load and the user's local optimistic change were racing each other, and the slower background load won by finishing later, clobbering a change that happened after it started. Fixed with a mutation-epoch counter: a load only applies its result if no local mutation happened while it was in flight.

---

## Q16. How is the mutation-epoch fix different from Chapter 13's `cancelled` flag pattern?

### Answer

Chapter 13's `cancelled` flag protects against a *newer request* superseding an *older* one — two network calls racing each other. The Chapter 23 bug was a background load racing a *local, optimistic* state change that never went through the same request queue. The two guards protect against different orderings and are not interchangeable; the mutation epoch specifically compares "has anything changed locally since this load started," not "has a newer load started since."

---

## Q17. Explain the third race condition involving a 404 on DELETE.

### Answer

```text
Click 1 → POST /wishlist/slug   (add)
Click 2 → DELETE /wishlist/slug (remove)

If DELETE reaches the server before POST completes:
  DELETE runs first → 404 (nothing exists yet to delete)
  POST runs second  → 201 (item now exists)
```

Naive handling would treat the 404 as a failed request and roll back the optimistic removal — silently restoring an item the user had just, correctly, removed. The fix treats a 404 on DELETE as success: the desired end state ("item not in wishlist") was already true, just reached via unexpected ordering rather than the DELETE itself.

---

## Q18. What principle unifies all three race-condition fixes in this chapter?

### Answer

Judge outcomes by whether the *desired end state* was reached, not by the literal sequence of operations or raw status codes. A `404` on DELETE reaching the desired state is a success. A stale GET response, even though it "succeeded" as a request, does not reflect the desired current state and must be discarded. A `setState` updater's timing must be respected rather than assumed, or the code ends up acting on state that isn't actually current yet.

---

## Q19. Why was Chapter 13's self-healing behavior for missing wishlist products narrowed rather than ported as-is?

### Answer

The frontend's mock product catalogue that self-healing checked against didn't resolve all 50 of V3's real seeded products — only a subset. Porting the old "can't resolve this slug → prune it" logic unmodified would mean opening the wishlist page could issue a real `DELETE` against a database row that genuinely exists, purely because this particular frontend build couldn't map it to a card yet. The fix: stop treating "this build can't render it" as equivalent to "the server doesn't have it." The accepted cost is a wishlist badge count that can exceed the visible grid — a cosmetic gap, chosen over silent, irreversible data loss.

---

## Q20. What is the actual difference between `WishlistProvider`/`CompareProvider`'s data source before and after this chapter?

### Answer

```text
Before   createPersistedList(KEY)         → localStorage, synchronous
After    GET/POST/DELETE against the API  → real backend, asynchronous
```

The public hook surface (`useWishlistSelection`, the compare equivalent) is unchanged for every consumer — only the internal backing mechanism moved.

---

## Q21. Why does `AuthProvider` wrap `WishlistProvider` and `CompareProvider` in `App.tsx`, rather than the other way around?

### Answer

Both providers now need to know the current auth state to make authenticated requests. A provider can only read context from an ancestor, so `AuthProvider` must sit above both in the tree. Nesting them the other way would leave `WishlistProvider`/`CompareProvider` unable to call `useAuth()` at all.

---

## Q22. Did WishlistProvider/CompareProvider need to manually attach the auth token to their requests?

### Answer

No. `services/api.ts`'s `request()` function already reads its module-level session and attaches `Authorization: Bearer <token>` to every outgoing call automatically. The providers call the existing service helpers and never handle a token directly — matching how the codebase already threaded this exact concern before this chapter even started.

---

## Q23. What was missing from `api.ts` that blocked wiring Compare specifically, separate from the auth blocker?

### Answer

Client-side comparison helper functions. CH23's backend work had built `ComparisonController` with real endpoints, but nothing in `api.ts` actually called them — `fetchComparison`, `addToComparison`, `removeFromComparison`, and `clearComparison` all had to be written before `CompareProvider` could be rewired at all.

---

# 📚 Advanced Level

## Q24. A teammate proposes keeping `add`/`toggle` fully synchronous by firing the network request "in the background" without returning a Promise at all. What breaks?

### Answer

Any consumer that currently branches on the result (`ComparePage.tsx`, using `add`'s "full"/"duplicate" outcomes to decide what to show the user) would lose the ability to know the actual outcome of their own call — a synchronous function can't report an asynchronous result. The UI could still update optimistically, but the caller would have no reliable way to react to what the server actually decided (e.g., rejecting an add because the compare list is already full). This is precisely why the brief's "must not change" was interpreted as "value types unchanged," not "stays synchronous" — the second reading is incompatible with any caller that needs the real outcome.

---

## Q25. Trace exactly what happens end-to-end when a logged-in user double-clicks a wishlist heart quickly.

### Answer

```text
Click 1 (add)
  optimistic: heart fills, local state updates, mutation epoch increments
  POST /wishlist/slug sent

Click 2 (remove), fired before POST resolves
  optimistic: heart empties, local state updates, mutation epoch increments again
  DELETE /wishlist/slug sent

If DELETE resolves first (server hasn't processed POST yet):
  Server has nothing to delete → 404
  → treated as success (desired end state already true) → no rollback

POST resolves after:
  Server creates the item → 201
  → but local state has already moved on (epoch is ahead)
  → if the provider correctly checks the epoch, this stale success
    should NOT silently re-add an item the user removed after clicking
```

This scenario is the reason both the mutation-epoch guard and the 404-as-success handling exist together — either one alone leaves a gap the other closes.

---

## Q26. Why is a lazy `useState` initializer specifically important for `AuthProvider`, given that it wraps the entire router?

### Answer

`AuthProvider` sits at the top of the component tree, above every route. If `getSession()` were called directly as the initial value (`useState(getSession())`) rather than passed as a function reference (`useState(() => getSession())`), it would be invoked on every single render of `AuthProvider` — which is every render of the entire application, since nothing renders without passing through it. React's lazy initializer contract guarantees the function only runs once, on mount, avoiding a `localStorage` read on every keystroke or state change anywhere in the app.

---

## Q27. Why does `AuthProvider` deliberately avoid storing its own copy of the JWT?

### Answer

`api.ts` is the actual source of truth for the session and clears it automatically on a 401 from any non-auth endpoint. If `AuthProvider` cached its own token in React state, that cache would not be notified when `api.ts` clears the real session — the navbar could keep confidently rendering a "logged in" state for a session the backend has already invalidated. Reading directly from `api.ts` on every check, rather than duplicating the value, is what keeps the two from disagreeing.

---

## Q28. Design the check you'd add to prove the mutation-epoch fix actually works, without relying on real network timing.

### Answer

Using a fake/stubbed backend (matching the pattern the chapter's own test infrastructure — `test/fakeBackend.ts` — already established): fire a GET that resolves only after a manually-controlled delay; before it resolves, trigger a local optimistic mutation; then let the GET resolve. Assert that the final rendered state reflects the optimistic mutation, not the GET's (now-stale) payload. This directly reproduces the t=0/t=50/t=300 sequence from the bug without depending on real, flaky network timing.

---

## Q29. A new engineer wants to add a `"queued"` state to `AddResult` (`"added" | "duplicate" | "full" | "queued"`) for a future offline-support feature. Does this violate the "contract must not change" rule established in this chapter?

### Answer

This is worth thinking through carefully rather than reflexively saying yes or no. The chapter's actual precedent was about the *wrapper* changing (sync → async) while the *value type* stayed fixed. Adding a new member to the value union is a different kind of change — it's an extension of the contract's vocabulary, not a preservation of an existing one. Every consumer with an exhaustive switch/if-chain over `AddResult` would need updating to handle the new case, or TypeScript's exhaustiveness checking (if configured) should catch the gap at compile time. This chapter's precedent doesn't forbid it, but it does mean it should be treated with the same discipline — grep every consumer, confirm each one is updated, don't assume "an extra case won't matter."

---

## Q30. Why was a real `psql` row-existence check specified as part of verification, rather than trusting "reload the page and it still shows saved"?

### Answer

Because "reload and it's still there" is also exactly what the old `localStorage`-backed implementation would show — that check alone cannot distinguish real backend persistence from a browser cache that simply survived the reload. Directly querying the `wishlists`/`comparisons` tables via `psql` after a UI action is the only check that actually proves the data reached the database, rather than proving the UI merely looks consistent with itself.

---

## Q31. Why did the ProductCard merge add optional props (`badge`, `store`, `fallbackIcon`) instead of just dropping whatever the home-feature card did that the shared card didn't?

### Answer

Silently dropping behavior during a merge is how features regress without anyone noticing until a user reports it. The correct approach when unifying two components is to diff them fully first, then decide deliberately what happens to every difference — keep it as an optional prop, drop it with a documented reason, or reconcile it into shared default behavior. Making the extra behavior optional preserved every caller's existing appearance while still converging on one implementation, rather than trading correctness for a smaller diff.

---

## Q32. If Compare later gets its own bulk-clear endpoint parity issue in reverse — say Wishlist gets bulk-delete but Compare doesn't — what's the actual architectural risk of leaving that asymmetry unaddressed?

### Answer

The immediate risk is just N requests instead of one on whichever side lacks it — a performance/UX cost, not a correctness one, since each individual DELETE still lands correctly. The subtler risk is if a future engineer assumes the two APIs are symmetric (a reasonable assumption, since the two features are close siblings throughout this codebase) and writes a "clear all" helper that silently only bulk-deletes when it's available, degrading unpredictably. The safer long-term fix is either giving both endpoints the same capability, or making the asymmetry explicit and loud in the code (e.g., the wishlist clear function's own implementation makes the N-requests behavior obvious to the next reader, not hidden behind a generic-looking function name).

---

## Q33. Why is "no session-validation endpoint exists" treated as an accepted limitation rather than something this chapter should have fixed by building one?

### Answer

Building a `/me` or session-validation endpoint would be adding new backend surface area to solve a problem the frontend doesn't strictly need solved yet — a token that's actually invalid will simply 401 on the next real request, and `api.ts` already clears the session when that happens. The cost of *not* having a dedicated validation endpoint is a brief window where a dead session looks alive until the user's next action proves otherwise — acceptable, and cheaper than adding an endpoint whose only job would be to answer a question the app already answers, just slightly later, for free.

---

# 🧩 Scenario-Based Questions

## Q34. A user reports their wishlist "randomly loses an item" right after they add it. What would you check first, based on this chapter?

### Answer

The mutation-epoch guard first — this is almost exactly the second race condition documented in this chapter (a stale background load overwriting a fresh optimistic add). Check whether the epoch is actually being incremented on every local mutation, and whether the load's result-application path is actually checking it before committing `setProducts(...)`.

---

## Q35. A teammate "simplifies" the DELETE handling by treating every non-2xx response as a failure requiring rollback, removing the special-case for 404. What regresses?

### Answer

Fast double-toggles (add then quickly remove) would start incorrectly restoring items the user just removed, whenever the DELETE happens to reach the server before the POST does. This is Bug 3 from this chapter reintroduced verbatim — the fix wasn't a general convenience, it was a specific, necessary exception to "non-2xx = failure," grounded in what a 404-on-DELETE actually means semantically in this context.

---

## Q36. Two browser tabs are open with the same account logged in. A wishlist item is added in Tab A. Is Tab B expected to update automatically after this chapter?

### Answer

No — and this is a documented regression, not an oversight. The old `localStorage`-backed providers picked up the browser's native `storage` event, which fires in other tabs automatically. The real API has no equivalent push channel; two tabs can now genuinely disagree until one of them performs a fresh fetch (e.g., a reload or a subsequent action that re-triggers a GET).

---

## Q37. A product exists in the database (seeded by V3) but a user's wishlist badge shows a count that doesn't match the number of cards actually rendered on `/wishlist`. Is this necessarily a bug?

### Answer

Not necessarily — check whether the count exceeds the rendered grid by exactly the number of products this particular frontend build can't resolve to a card. This is the accepted, documented cost of narrowing self-healing in this chapter: a cosmetic mismatch was chosen deliberately over the alternative, which was silently deleting real database rows whenever the frontend's mapping was incomplete.

---

## Q38. A new backend engineer asks why the comparison API got a bulk-delete endpoint but the wishlist API didn't, assuming it must have been an oversight. How would you respond?

### Answer

It's worth confirming with whoever built the comparison API whether it was deliberate or incidental, but from this chapter's documentation, it's called out explicitly as a known asymmetry rather than something hidden — "wishlist clear is now N requests, not one" is stated plainly in the chapter's own "what's now worse" accounting. Whether to add parity is a real product/backend decision, not an assumed bug to silently patch.
