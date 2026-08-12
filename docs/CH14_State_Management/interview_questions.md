# 🎯 CH14 — Interview Questions

> **Project:** CartWise  
> **Chapter:** State Management
>
> This chapter covers the state audit, real vs. apparent duplication, the shared persistence primitive, cross-tab synchronization, schema versioning and migration, and an honest comparison between React Context and external state libraries.

---

# 📚 Beginner Level

## Q1. What state management library does CartWise use?

### Answer

None. `package.json` was checked directly — no Redux, Zustand, Jotai, or Recoil is installed. CartWise uses plain React Context and `useState`, in exactly two providers: `WishlistProvider` and `CompareProvider`.

---

## Q2. Why does Chapter 14 exist if no new library was added?

### Answer

Because "state management" doesn't only mean "adopt a store." By Chapter 13, two independent features (Wishlist, Compare) each had their own Context provider with hand-written `localStorage` persistence. Chapter 14 audits what actually exists, fixes real duplication, and closes two named gaps — no cross-tab sync, no schema version — without changing the architecture's shape.

---

## Q3. What is a state audit, and why did it happen before any code was written?

### Answer

A state audit is grepping the entire codebase for every `useState`, `useContext`, and storage call to build a complete inventory of what state exists and where. It happened first so that any changes made afterward were based on evidence rather than assumption — writing code before auditing risks solving a problem the codebase doesn't actually have.

---

## Q4. How many Context providers does CartWise have, and what are they?

### Answer

Exactly two: `WishlistProvider` (Chapter 13) and `CompareProvider` (Chapter 12). Both wrap the router in `App.tsx`.

---

## Q5. What third piece of duplicated persistence code was found that wasn't part of the original two-feature comparison?

### Answer

`useRecentSearches`. It had its own copy of the same guarded `read()`/`write()` pattern as `WishlistProvider` and `CompareProvider` — found only because the audit grepped the whole codebase rather than checking just the two features named in the original brief.

---

## Q6. What does `createPersistedList` do?

### Answer

It's a factory function in `src/lib/persistedList.ts` that, given a storage key, returns `{ read, write, subscribe }` — a guarded, validated, versioned, cross-tab-aware persistence primitive that both `WishlistProvider` and `CompareProvider` now use.

---

## Q7. Where does `persistedList.ts` live, and why there?

### Answer

`src/lib/persistedList.ts`, alongside the existing `src/lib/currency.ts` — a neutral, feature-agnostic location. It does not live inside `features/wishlist/` or `features/compare/`, because it belongs to neither feature specifically.

---

## Q8. What is cross-tab synchronization?

### Answer

Keeping multiple open browser tabs on the same origin in agreement about shared state. Before this chapter, saving a product in one tab left another open tab's badge and page stale until a manual reload.

---

## Q9. What browser feature makes cross-tab sync possible?

### Answer

The `storage` event, which fires automatically in other open tabs on the same origin whenever a `localStorage` key changes.

---

## Q10. What does a schema version look like in CartWise's stored data?

### Answer

```json
{ "v": 1, "items": ["iphone-16-pro", "galaxy-s25-ultra"] }
```

Replacing the previous bare array:

```json
["iphone-16-pro", "galaxy-s25-ultra"]
```

---

# 📚 Intermediate Level

## Q11. Why was extraction justified for the persistence guards but not for the memoized context values or `useCallback` identities?

### Answer

The persistence guards (`read`/`write`) were byte-for-byte identical across three files — the same try/catch, JSON.parse, `Array.isArray` check, and de-duplication filter, with nothing feature-specific in them. The memoized context values and callbacks, by contrast, are only *structurally* similar: each closes over feature-specific types and rules (`AddResult` vs `WishlistToggleResult`, Compare's cap vs Wishlist's none). Extracting those would mean building a shared "selection" abstraction — effectively merging Wishlist and Compare into one system, which Chapter 13 already rejected as the wrong move.

---

## Q12. Explain the distinction the chapter draws between "duplication" and "structural similarity." Why does it matter?

### Answer

Duplication is code that is *implemented identically* — the same sequence of operations, regardless of what problem it solves. Structural similarity is when two features *solve a similar kind of problem* (both toggle membership in a list) without their implementations actually matching. Only true duplication justifies extraction; merging code on the basis of "these look similar" risks tangling two features' business rules into one utility that now has to know about both.

---

## Q13. Why does Compare's four-item cap live inside `CompareProvider`'s own `read()` function instead of inside `createPersistedList`?

### Answer

```tsx
function read(): string[] {
    return store.read().slice(0, MAX_COMPARE);
}
```

`createPersistedList` is meant to be genuinely generic — usable by any future feature that needs a persisted list, with no concept of a size limit. If the cap were built into the shared store, either every caller would need to remember to pass a limit parameter, or it would silently apply somewhere it shouldn't. Applying it in Compare's own `read()`, on top of the generic store's output, means the cap protects against a hand-edited or older-build value producing a fifth column — without leaking Compare's business rule into a utility other features will also use.

---

## Q14. Walk through exactly why the cross-tab sync handler cannot cause an infinite update loop between two tabs.

### Answer

The mechanism relies on one guarantee of the browser's `storage` event: it fires only in tabs *other than* the one that made the write, never in the writing tab itself.

```text
Tab A writes to localStorage
        ↓
storage event fires in Tab B only (never Tab A)
        ↓
Tab B's handler calls setSlugs(incoming)
        ↓
Tab B's handler does NOT call write()
        ↓
No storage event is produced by Tab B
        ↓
Tab A never receives anything back
```

The handler is read-only by design — it only ever calls the React state setter, never the store's `write`. If it ever called `write()` in response to receiving an update, that write would produce a new `storage` event in *other* tabs (including, transitively, back toward A through further tabs), and the loop could begin.

---

## Q15. What does `isSameList` protect against, and why is it necessary even though the cross-tab handler is already read-only?

### Answer

```tsx
setSlugs((current) =>
    isSameList(current, incoming) ? current : incoming,
);
```

Even without a write-loop risk, a `storage` event can fire for reasons that don't represent a meaningful change — an identical value being re-written, or noise from browser/extension behavior. Without the comparison, every such event would produce a *new* array reference via `setSlugs`, which would cause a re-render and a new memoized context value even though nothing the user cares about actually changed. Returning the existing reference when content is identical keeps context consumers from re-rendering for no reason — the same discipline already applied to `add`/`remove`/`toggle` in Chapter 13.

---

## Q16. Why does the cross-tab handler need to explicitly account for `event.key === null`?

### Answer

`event.key === null` is how the browser reports that `localStorage.clear()` was called — the entire storage was wiped, not just one key. Without handling this case, a full clear from one tab would leave other tabs either crashing (if the handler assumed `event.key` always names a real key) or silently ignoring the clear (if it only matched specific key strings). CartWise's handler treats `key === null` as "storage was cleared, reset to an empty list."

---

## Q17. Why must `read()` remain a pure function with no side effects, even when it performs schema migration?

### Answer

`read()` is passed directly as a `useState` lazy initializer:

```tsx
const [slugs, setSlugs] = useState<string[]>(read);
```

React calls a lazy initializer exactly once, on mount, and treats it as safe to call without side effects — this is part of the contract for correct behavior under things like React's Strict Mode double-invocation in development. A `read()` that silently called `localStorage.setItem()` to persist a migration as a side effect of being read would violate that expectation. Instead, migration happens entirely in memory: `read()` returns the migrated shape, but storage itself is only updated the next time a real `write()` happens — the next genuine add, remove, toggle, or clear.

---

## Q18. Why did the team decide to add a schema version now rather than deferring it until the data shape actually needs to change?

### Answer

The direct reasoning: "a version marker only helps if it's already in storage before the shape changes." If versioning were added at the same moment the shape changes, all *existing* stored data would still be unversioned — the code would still need to sniff whether a stored value is old-shape or new-shape by structural inspection, exactly the problem versioning was meant to solve. Adding the version field now, while the shape is still simple, means any future shape change has something concrete to check against instead of guessing.

---

## Q19. What exactly would have broken if CartWise's storage guards had NOT been made robust to a shape change, and a future feature added a `savedAt` timestamp to each wishlist entry?

### Answer

The existing guards were `Array.isArray(parsed)` plus `typeof value === "string"` on each entry. If entries changed from strings to objects (`{ slug, savedAt }`), every entry would fail the `typeof === "string"` check and be filtered out — silently reducing a real user's wishlist to empty on their next visit, with no error and no way to recover the original list. The versioned envelope introduced in this chapter is the mechanism that would let a future change like this be detected and migrated instead of silently discarded.

---

## Q20. `CompareProvider`'s `write` function was left importing directly from the shared store (`const { write } = store;`) while its `read` was rewritten locally. Why the asymmetry?

### Answer

`write` needs no feature-specific behavior — persisting the current in-memory list is entirely mechanical work the shared store already does correctly. `read`, on the other hand, needs to apply Compare's cap on the way *out* of storage, to protect against any stored value (hand-edited, from an older build, or synced from another tab) exceeding the four-item limit before it ever reaches Compare's state. Since only reading needs feature-specific behavior, only `read` was wrapped; `write` was left as a direct pass-through.

---

# ⚛️ React-Specific Questions

## Q21. Why is the cross-tab subscription set up inside a `useEffect` with an empty dependency array?

### Answer

```tsx
useEffect(
    () => store.subscribe((incoming) => { ... }),
    [],
);
```

The subscription should be established exactly once, when the provider mounts, and torn down exactly once, when it unmounts — it does not depend on any value that changes between renders. `useEffect`'s return value (the function passed to `store.subscribe`, which itself returns an unsubscribe function) is called automatically on unmount, which is what prevents the listener from leaking if the provider is ever removed from the tree.

---

## Q22. What would go wrong if the dependency array for the cross-tab `useEffect` included `slugs`?

### Answer

The effect would re-run every time `slugs` changed — which includes every time the *subscription itself* updates state via `setSlugs`. That would tear down and re-create the `storage` event listener on every single state change, which is wasteful, and in a subtler case could create a window where an event is missed between unsubscribing the old listener and subscribing the new one. An empty dependency array is correct because the subscription's behavior (call `setSlugs` with whatever comes in) does not need to be re-created when the state it manages changes.

---

## Q23. The chapter states the public contract of `useWishlistSelection()` was "completely unchanged" by this refactor. What does that claim actually guarantee, and how would you verify it?

### Answer

It guarantees that every component using `useWishlistSelection()` — product cards, the navbar badge, the Wishlist page — required zero code changes, because the hook still returns the exact same shape: `{ slugs, count, add, remove, toggle, clear, isWishlisted }`. All of the changes (the shared store, schema versioning, cross-tab sync) happened entirely inside `WishlistProvider`, below the hook's return statement. To verify it: `git diff` should show no changes to `wishlistContext.ts` or any consuming component — which the chapter's report confirms was the case (only `WishlistProvider.tsx`, `CompareProvider.tsx`, and the new `persistedList.ts` were touched).

---

# 🏗️ Architecture Questions

## Q24. Draw the full dependency chain from a component using the wishlist down to `localStorage`, after this chapter's changes.

### Answer

```text
Component
    ↓
useWishlistSelection()
    ↓
WishlistProvider          (feature rules: prepend-for-recency)
    ↓
createPersistedList(KEY)  (mechanics: guard, validate, version, sync)
    ↓
{ read, write, subscribe }
    ↓
localStorage + storage event
```

Each layer knows progressively less about *why* and more about *what to expose* as you move down the chain — `persistedList.ts` has no concept of what a wishlist is; `WishlistProvider` has no concept of how `localStorage` failures are caught.

---

## Q25. If CartWise later adds a shopping cart that needs to be read from five different places (navbar, product page, checkout, wishlist "already in cart" badges, compare page), does that justify introducing a state library? Why or why not, according to this chapter's reasoning?

### Answer

According to the chapter's own criteria, this is exactly the scenario that *would* start to justify it — not because five read-sites is an arbitrary threshold, but because at that point you'd likely be composing four or five independent Context providers (`<A><B><C><D><E>{children}</E></D></C></B></A>`), and cross-feature reads (a cart badge needing to know both cart contents and wishlist contents) start to benefit from centralized selectors rather than each component individually consuming multiple contexts. The chapter is explicit that CartWise is not at that point today — two providers with no cross-slice reads is not a wrapper problem — but names this as the concrete shape of scenario where the calculus would change.

---

## Q26. Why is Search's unsynced filter state described as "a routing problem before it is a state management problem"?

### Answer

The gap is that a shared or bookmarked search link loses its filters, and the browser back button doesn't restore a previous search state. The fix for that is putting `query`, `sort`, and `filter` into the URL's query parameters via `useSearchParams` from React Router — which requires no new dependency and no new Context provider. It's a routing concern (what belongs in the URL) rather than a state-sharing concern (what needs a store), and conflating the two would have pulled an unrelated fix into a chapter scoped to Wishlist/Compare persistence hardening.

---

## Q27. The chapter names `useTheme.ts` containing a duplicate, unused `useDebounce` as a finding, but explicitly leaves it unfixed. What principle governs that decision?

### Answer

Scope discipline. The audit is allowed — even expected — to surface issues outside its stated boundary (Wishlist/Compare persistence), but fixing every issue found during an audit turns a focused hardening pass into an unbounded cleanup task. The right response to an out-of-scope finding is to report it clearly as a known limitation for a future, separate task — not to silently fix it and expand the diff, and not to silently ignore it and lose the finding.

---

# 🧩 Scenario-Based Questions

## Q28. A teammate proposes merging `WishlistProvider` and `CompareProvider` into a single `SelectionProvider` that manages both lists, since "they're basically doing the same thing." What's your response, using this chapter's reasoning?

### Answer

They're structurally similar (both toggle membership in a list, both persist to `localStorage`) but not duplicated at the level that matters — Wishlist has no cap and orders by recency; Compare caps at four and has no ordering concept. Chapter 13 already established they must remain independent so that clearing one can never affect the other. This chapter's extraction proves the useful version of the teammate's instinct: extract what's *actually* identical (the persistence mechanics, now in `persistedList.ts`) while keeping what's feature-specific (the rules, the caps, the ordering) in each provider. A `SelectionProvider` merging both would reintroduce exactly the coupling Chapter 13 avoided.

---

## Q29. You're reviewing a PR that adds cross-tab sync to a new feature by writing `store.subscribe((incoming) => { setState(incoming); persistToServer(incoming); })`. What's the concern?

### Answer

`persistToServer` is a write-like side effect happening inside a cross-tab handler that was designed to be strictly read-only. Even though it's not writing to `localStorage` directly, if that server call ever triggers something that writes back to `localStorage` (e.g., a response handler that updates local cache), it could re-introduce a feedback path — a tab receiving a cross-tab update triggers a write, which could produce another `storage` event. The safe pattern established in this chapter is: the cross-tab handler updates in-memory React state only; any additional side effects belong in the normal `add`/`remove`/`toggle` flow, triggered by explicit user action, not by receiving another tab's update.

---

## Q30. A future migration needs to convert every stored slug from lowercase-hyphenated (`iphone-16-pro`) to a numeric product ID. Using this chapter's schema-versioning pattern, sketch how that migration would be structured.

### Answer

```text
Storage holds:  { "v": 1, "items": ["iphone-16-pro", ...] }
                          (slugs)

New shape:      { "v": 2, "items": [10234, ...] }
                          (numeric IDs)
```

`read()` would check the `v` field: if `v === 1`, look up each slug's numeric ID (via the same product-resolution service the feature already uses) and return the data in the `v: 2` shape to the caller, without rewriting storage. The migration stays in-memory and pure, exactly as the legacy-bare-array-to-`v:1` migration does today — storage is only updated to `v: 2` on the next real write. `v` existing already (from this chapter's work) is precisely what makes this migration detectable at all; without it, the code would have no way to tell a list of slugs from a list of already-migrated numeric IDs without guessing.

---

# 📌 Summary

These questions cover:

- Why an audit precedes any code change, and what it found
- The distinction between real duplication and structural similarity
- What a persistence primitive should and should not know
- The exact mechanism that keeps cross-tab sync loop-free
- Why schema versioning must be proactive, not retroactive
- Migration as a pure, read-time operation
- An evidence-based comparison between Context and external state libraries
- Where CartWise's architecture would genuinely need to change next
