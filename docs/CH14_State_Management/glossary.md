# 📖 CH14 — Glossary

> **Project:** CartWise  
> **Chapter:** State Management

This glossary explains the important terms and concepts introduced while auditing and hardening CartWise's state management.

---

# 🧠 State

State is data that changes over time and that a component or feature needs to remember between renders.

CartWise's state falls into three shapes: shared/persisted (Wishlist, Compare, recent searches), page-scoped loaders (search results, product data), and component-local UI state (toggles, scroll position).

---

# 🔍 State Audit

A State Audit is a systematic pass over the codebase — grepping every `useState`, `useContext` and storage call — to find out what state actually exists before deciding whether anything needs to change.

> "State management chapter" does not mean "add a library." It means "find out what's actually there first."

---

# 🧬 Duplication

Duplication is code that is structurally identical, not merely similar, across two or more places.

CartWise's audit found three near-identical `read()`/`write()` pairs (`WishlistProvider`, `CompareProvider`, `useRecentSearches`) — the same guard, parse, validate, de-duplicate sequence, copied three times.

---

# 🪞 Structural Similarity

Structural Similarity is when two features solve a similar *problem* — both toggle membership in a list — without their implementations being duplicated.

Wishlist's `toggle()` and Compare's `toggle()` are structurally similar but not duplicated: each closes over feature-specific rules (`AddResult` vs `WishlistToggleResult`, a four-item cap vs none). Similarity alone does not justify extraction.

---

# ✂️ Extraction

Extraction is moving genuinely duplicated logic into one shared location, leaving each original caller with only what is unique to it.

`src/lib/persistedList.ts` was extracted from three copies of the same persistence guard. What was *not* extracted — the memoized context values and callback identities — stayed in place because it wasn't actually duplicated, only similar.

---

# 🧰 Persistence Primitive

A Persistence Primitive is a small, feature-agnostic utility that handles the mechanics of storing and retrieving data, with no knowledge of what that data means.

```ts
createPersistedList(key) → { read, write, subscribe }
```

It knows how to guard, parse, validate, de-duplicate and version. It does not know what a wishlist or a comparison is.

---

# 🚧 Mechanics vs. Meaning

The line drawn between what belongs in a shared store and what stays in a feature's own provider.

```text
Mechanics (shared)          Meaning (feature-owned)

Guarded read/write          Prepend-for-recency (Wishlist)
JSON validation              Four-item cap (Compare)
De-duplication               AddResult / ToggleResult types
Schema versioning
Cross-tab notification
```

---

# 🔢 Schema Version

A Schema Version is a marker stored alongside data that records which shape the data is in, so old and new formats can both be read safely.

```json
{ "v": 1, "items": [...] }
```

CartWise's rule: a version is only useful if it exists *before* the shape changes — adding one retroactively still leaves old data needing structural sniffing.

---

# 🧭 Envelope

An Envelope is the outer wrapper around stored data that carries its schema version, distinct from the data itself.

```json
{ "v": 1, "items": ["a", "b"] }
     ↑         ↑
 envelope    payload
```

---

# 🔁 Migration

Migration is converting data from an old stored shape into the current expected shape.

CartWise migrates a legacy bare array into the versioned envelope **in memory, at read time** — the stored value itself isn't rewritten until the next real write.

---

# 🧼 Pure Function

A function that returns the same output for the same input and causes no side effects.

`read()` must stay pure because it is passed as a `useState` lazy initializer — React calls it once, expects no side effects, and a `read()` that silently rewrote `localStorage` would violate that contract.

---

# 🪟 Cross-Tab Synchronization

Keeping multiple browser tabs on the same origin in agreement about shared state, using the browser's `storage` event.

Before this chapter, two tabs each held independent state; saving in one left the other stale until a manual reload.

---

# 📡 storage Event

A browser event that fires in *other* open tabs on the same origin when a `localStorage` key changes — never in the tab that made the write.

This one guarantee is what makes CartWise's cross-tab sync loop-free without extra guarding.

---

# 🔂 Feedback Loop (Sync Loop)

A bug pattern where two tabs (or systems) repeatedly re-trigger updates in each other, because a receiving side's response is itself a write that produces another event.

```text
Tab A writes → Tab B's handler writes back → Tab A's handler writes back → ...
```

Avoided in CartWise because the cross-tab handler only calls `setSlugs`, never `write()`.

---

# 👂 Subscribe / Unsubscribe

The pattern of registering a callback to be notified of future changes, and providing a way to stop listening.

```ts
useEffect(
    () => store.subscribe((incoming) => { ... }),
    [],
);
```

`store.subscribe` returns an unsubscribe function, which `useEffect`'s cleanup calls automatically.

---

# 🧊 Reference Stability

Returning the exact same object/array reference when nothing meaningfully changed, so React can skip unnecessary re-renders.

```tsx
setSlugs((current) =>
    isSameList(current, incoming) ? current : incoming,
);
```

Without this, an unrelated storage event or a re-written identical value would still produce a new array reference and a wasted re-render.

---

# 🆚 isSameList

A comparison helper used to decide whether an incoming list (from another tab, or from storage) actually differs from the current in-memory list, so identical values don't trigger a state update.

---

# 🎚️ Cap (Selection Limit)

A feature-specific upper bound on how many items a list may hold.

Compare's four-item cap is applied inside Compare's own `read()`, on top of the shared store — not inside the generic persistence primitive, which has no concept of a limit.

```tsx
function read(): string[] {
    return store.read().slice(0, MAX_COMPARE);
}
```

---

# 🌐 React Context

A mechanism for sharing a value across a component subtree without passing it through every intermediate level via props.

CartWise has exactly two Context providers: `WishlistProvider` and `CompareProvider`.

---

# 🏪 Store (State Library Sense)

A centralized object holding shared application state, typically provided by a library such as Redux, Zustand, or Jotai, usually offering selectors, middleware, and sometimes time-travel debugging.

CartWise does not use one — the audit found no problem a store would solve that Context doesn't already handle.

---

# 🎯 Selector

A function that reads a specific slice of a store's state, so a component re-renders only when that slice changes.

Not present in CartWise because there is no single large store to slice — each Context already exposes a small, focused public hook.

---

# 🕰️ Time-Travel Debugging

A debugging technique, offered by tools like Redux DevTools, that lets a developer step backward and forward through a recorded history of state changes.

Named in this chapter's comparison as a genuine capability state libraries offer that Context does not — and one CartWise's current scale has no need for.

---

# 🧩 Prop Drilling

Passing a value through several layers of components that don't use it themselves, purely so a deeper component can access it.

The traditional justification for Context or a store; CartWise's audit found no prop-drilling problem — two providers wrapping the router was sufficient.

---

# 🔗 URL-Synced State

State whose current value is reflected in the URL (typically via query parameters), so it survives a reload, a shared link, or the back button.

CartWise's `useSearch` filter state is **not** URL-synced today — named explicitly as the next real gap, and framed as a routing fix (`useSearchParams`), not a state-library adoption.

---

# 🧱 Feature-Owned Rule

Logic that only makes sense in the context of one specific feature, and therefore should not live in a shared, generic utility.

Wishlist's prepend-for-recency and Compare's four-item cap are feature-owned rules; the shared `persistedList.ts` intentionally has no knowledge of either.

---

# 🚦 Hostile Storage

A test condition where `localStorage.getItem`/`setItem` are forced to throw, simulating private-mode Safari, a blocked storage API, or a full quota.

CartWise verified the app renders fully and throws no uncaught error under this condition, including through the new cross-tab subscription path.
