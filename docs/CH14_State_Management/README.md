# 🧠 CH14 — State Management

> **Project:** CartWise  
> **Chapter:** State Management

---

# 👋 Welcome

By Chapter 13, CartWise had two features that needed to remember something: Compare (Chapter 12) and Wishlist (Chapter 13). Each was built independently, each reached for React Context and `useState`, and each wrote its own `localStorage` guard by hand.

That is a normal way for a codebase to grow — and also exactly the point where it is worth stopping and asking a question most tutorials skip:

> Is this actually a state management problem yet?

The honest answer, confirmed by actually auditing the code rather than assuming, is **no** — not in the sense of needing Redux or Zustand. CartWise has exactly two Context providers. There is no prop-drilling crisis, no cross-slice selector logic, no need for time-travel debugging. What it *did* have was something narrower and more concrete: **the same twelve lines of guarded persistence code, copied three times**, and two real, user-visible gaps — no cross-tab sync, no schema version — that had already been named as limitations in the Wishlist chapter.

Chapter 14 is a hardening pass, not a rewrite. It audits what state actually exists, extracts what was genuinely duplicated, fixes the two gaps, and is honest in both directions: about what plain Context can't do yet, and about what it doesn't need to do.

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- Why auditing state before writing code prevents solving an imagined problem.
- The difference between *similar* code and *duplicated* code, and why only one justifies extraction.
- How to build a persistence primitive that knows nothing about the features using it.
- Why cross-tab synchronization must be read-only to avoid an infinite loop.
- Why a schema version is only useful if it exists *before* the schema changes.
- How to migrate stored data in memory without breaking a `useState` lazy initializer.
- Why a shared cap (Compare's four-item limit) belongs in the feature, not the shared store.
- What genuinely distinguishes Context from Redux, Zustand and Jotai — not as an opinion, but as a checklist against the app's actual shape.
- Why "we might need it later" is not a reason to add a dependency now.

---

# 🔍 The Audit, Not the Assumption

The instinct on hearing "Chapter 14 — State Management" is to reach for a library. CartWise's actual chapter order calls this out directly — the original project plan for this chapter says, in its own words:

> "(Currently React state only) — Redux/Zustand not yet implemented."

That parenthetical is doing real work. It is a statement of current fact, not a to-do. Before writing a line of code, the right first step is not "which library" — it's **"what state exists, right now, and where does it actually live?"**

```text
Assumption-driven approach          Audit-driven approach

"State management chapter"          "State management chapter"
        ↓                                   ↓
"must mean add Redux"               grep every useState, useContext,
        ↓                           localStorage call in the repo
Introduce a store nothing                    ↓
needed                              Find out what's actually there
        ↓                                    ↓
Now two systems solve               Decide, from evidence, whether
the same two-provider problem       anything needs to change
```

The second path is slower and produces a shorter diff. That is the point.

---

# 📋 State Inventory

Grepping the codebase for `useState`, `useContext`, and every `localStorage` call turns up fourteen distinct locations. Laid out honestly:

```text
Shared, persisted, app-wide
────────────────────────────
WishlistProvider     slugs: string[]              cartwise:wishlist
CompareProvider      slugs: string[]               cartwise:compare
useRecentSearches    recent: string[]        cartwise:recent-searches

Page-scoped loaders (async, disposable)
────────────────────────────────────────
useWishlist          products, loading, error, attempt, sort
useComparison        products, loading, error, attempt
useProduct           product, related, status, error, attempt
useSearch            query, sort, filter, results, loading, error

Component-local UI state
──────────────────────────
useGallery, useCarousel, useRailScroll, useDebounce, useScrolledPast
SearchPage, ComparePage, SearchBar, FilterGroup,
SpecGroupPanel, ComparisonSection, ProductSpecs      (toggles)
ProductActions, SafeImage, BrandCard, CountdownTimer (copied, failedSrc, ...)

URL-derived
────────────
Router                :slug via useParams, pathname via useLocation
```

Two things fall out of this table immediately, and both matter more than any library comparison.

**There are exactly two Context providers in the entire application.** Not five, not a growing pile — two. That is not a codebase straining under prop-drilling; it's a codebase where Context has been used exactly as much as it's been needed.

**`useSearch`'s filter state is not synced to the URL.** That is worth remembering — it's the one item in this table that is a real, named limitation, and it comes back at the end of the chapter as the concrete answer to "when would this actually need to change."

---

# 🧬 Duplication: Real, But Not Where Expected

The instinct going in was that `WishlistProvider` and `CompareProvider` — the two features built back-to-back in Chapters 12 and 13 — would be the duplicate pair. Auditing the actual files found a **third**, unplanned copy:

```text
WishlistProvider.tsx   16–43   read()/write() pair
CompareProvider.tsx    10–33   read()/write() pair
useRecentSearches.ts    5–29   read()/write() pair
```

All three carried the identical shape:

```text
try {
    read from localStorage
    JSON.parse
    Array.isArray guard
    filter(typeof === "string")
    de-duplicate
} catch {
    return []
}
```

This is the case worth internalizing: **the third copy had already happened before anyone was asked to look for it.** A hardening pass that only compared the two features named in the brief would have missed it. The audit step — grep first, assume nothing — is what caught it.

What was *not* duplicated, and was deliberately left alone:

```text
Memoized context value      → shape is similar, but each closes
useCallback identities      → over feature-specific state (isFull,
                               AddResult vs WishlistToggleResult)
```

Extracting those would mean building a generic "selection" abstraction shared by both features — which is precisely the "merge Wishlist and Compare into one store" move that Chapter 13 explicitly rejected. Structural similarity is not the same test as duplication. The persistence mechanics were byte-for-byte identical; the selection logic only *looks* similar because both features are toggles over a list. One justified extraction. The other didn't.

---

# 🧱 `persistedList.ts` — What the Shared Store Owns

The extraction landed at `src/lib/persistedList.ts`, next to the existing `src/lib/currency.ts` — a neutral, feature-agnostic location, not inside either feature folder.

```ts
export function createPersistedList(key: string) {
    // guarded read, guarded write, versioned envelope,
    // de-duplication, cross-tab subscription
    return { read, write, subscribe };
}
```

The design rule, stated plainly:

> It owns the *mechanics* only — guarded access, parsing, validation, de-duplication, schema versioning and cross-tab notification. It deliberately knows nothing about the features that use it.

What that boundary looks like in practice:

```text
persistedList.ts KNOWS:              persistedList.ts does NOT know:

How to safely read/write a key       That Wishlist prepends for recency
How to validate the shape            That Compare caps at 4 items
How to de-duplicate entries          What "added" vs "removed" means
How to version the envelope          Anything about ProductCardModel
How to notify other tabs
```

`WishlistProvider` and `CompareProvider` both call `createPersistedList(KEY)` and get back `{ read, write, subscribe }`. Everything feature-specific — recency ordering, the four-item cap, toggle result types — stays exactly where it was, in the provider that owns that meaning.

```tsx
// WishlistProvider.tsx
const store = createPersistedList(WISHLIST_STORAGE_KEY);
const { read, write } = store;
// prepend-for-recency logic stays here, unchanged
```

```tsx
// CompareProvider.tsx
const store = createPersistedList(COMPARE_STORAGE_KEY);
const { write } = store;

// The cap is applied on the way IN, not inside the shared store:
function read(): string[] {
    return store.read().slice(0, MAX_COMPARE);
}
```

That last detail is deliberate and worth sitting with. The generic store has no concept of "four." If the cap lived inside `persistedList.ts`, it would either need a parameter every caller must remember to pass, or it would silently apply to every future feature that reaches for this store — including ones that should never be capped. Applying the cap in Compare's own `read()` means a hand-edited value, or a value written by an older build with a different limit, can never render a fifth column, and the shared store stays genuinely generic.

---

# 🪟 Cross-Tab Synchronization

Before this chapter, two open tabs each held an independent copy of provider state, initialized once at mount from whatever was in `localStorage` at that moment. Saving in one tab left every other tab showing a stale badge until it was manually reloaded.

```text
Before                                  After

Tab A: save product                     Tab A: save product
Tab B: badge unchanged                  Tab B: badge updates — no reload
       (until manual reload)
```

The browser's `storage` event is the primitive this relies on, and it has one property that makes the whole design safe: **it fires only in *other* tabs, never in the tab that made the write.**

```tsx
useEffect(
    () =>
        store.subscribe((incoming) => {
            setSlugs((current) =>
                isSameList(current, incoming) ? current : incoming,
            );
        }),
    [],
);
```

That single fact — the writing tab never receives its own event — is what makes a read-only handler loop-free without any extra guarding:

```text
Tab A writes
      ↓
storage event fires in Tab B only
      ↓
Tab B's handler reads the new value and calls setSlugs
      ↓
Tab B does NOT write anything in response
      ↓
No event fires back in Tab A
      ↓
Loop cannot start
```

If the handler in Tab B ever called `write()` as a side effect of receiving the event, this guarantee would break, and two tabs could bounce updates back and forth indefinitely. The handler here only ever calls the setter — never the store's `write`.

`isSameList` guards a second, quieter failure mode:

```tsx
setSlugs((current) =>
    isSameList(current, incoming) ? current : incoming,
);
```

Without it, an unrelated `localStorage` key changing — or the same value being re-written — would still produce a new array reference, which would still trigger a re-render and a new memoized context value, for a change that carried no actual information. Returning the *existing* reference when the content is identical keeps the context value stable, exactly the same discipline Chapter 13 applied to `add`/`remove`/`toggle`.

The handler also has to survive `localStorage.clear()`, which fires a `storage` event with `key === null`:

```text
event.key === "cartwise:wishlist"   → read that key, update state
event.key === null                  → storage was cleared entirely,
                                       treat as an empty list
event.key === "some-other-key"      → ignore, not ours
```

---

# 🧬 Schema Versioning: Decided, Not Deferred

Before this chapter, both stores persisted a bare array:

```json
["iphone-16-pro", "galaxy-s25-ultra"]
```

The known risk, named explicitly in Chapter 13's limitations: if the stored shape ever needs to grow — a timestamp, say — the existing `Array.isArray` / `typeof` guards would reject the *new* shape as invalid and silently fall back to an empty list, discarding a real user's saved data.

The decision made here was to version now, not later, and the reasoning is the one line worth remembering from this whole chapter:

> A version marker only helps if it's already in storage before the shape changes. Adding it at the same time as a future change would leave the *old* data unversioned and still needing structural sniffing anyway — so deferring means sniffing forever.

In other words: versioning is not useful retroactively. The only moment it can be added for free is before it's needed.

```json
{ "v": 1, "items": ["iphone-16-pro", "galaxy-s25-ultra"] }
```

Migration is read-time and in-memory, not a one-time destructive rewrite:

```text
Storage holds a legacy bare array
              ↓
        store.read()
              ↓
   Recognize: no "v" field present
              ↓
     Treat as a v1 legacy list
              ↓
   Return { v: 1, items: [...] } shape to the caller
              ↓
   Storage itself is NOT rewritten yet
              ↓
        Next real write
              ↓
   Storage is now the versioned envelope
```

Reading never writes. That matters for a reason specific to React: `read` is passed as a `useState` lazy initializer, which must be a pure, side-effect-free function called once at mount. A `read()` that silently rewrote storage as a side effect of being called would violate that contract in a way that's easy to miss and hard to debug. Migration only becomes permanent the next time the user actually changes something — the first genuine `add`, `remove`, `toggle`, or `clear`.

The public contract every component depends on — `useWishlistSelection()` returning `{ slugs, count, add, remove, toggle, clear, isWishlisted }` — is completely unchanged. The versioning lives entirely inside the store; nothing above `WishlistProvider` and `CompareProvider` had to change at all.

---

# 🏗️ The Architecture, End to End

```text
Component
    ↓
useWishlistSelection() / useCompareSelection()   ← unchanged public hooks
    ↓
WishlistProvider / CompareProvider               ← feature-specific rules:
    ↓                                              prepend-for-recency,
createPersistedList(KEY)                          four-item cap
    ↓
{ read, write, subscribe }                       ← generic mechanics:
    ↓                                              guarded I/O, validation,
localStorage + storage event                      versioning, cross-tab
```

Each layer knows less than the one below it about *why*, and more about *what to expose*. `persistedList.ts` has no idea what a wishlist or a comparison is. `WishlistProvider` has no idea how `localStorage` failures are guarded — it just calls `read()` and `write()`. Every component using `useWishlistSelection()` has no idea any of the last three layers exist.

---

# ⚖️ Context vs. a State Library — An Honest Comparison

Not a recommendation. A checklist, weighed against what CartWise's audit actually found.

```text
                        React Context      Redux / Zustand / Jotai

Setup cost              None — built in    A dependency, a store file,
                                            a Provider wiring pass

Good fit when           A small number     Many features need to read
                         of independent    the *same* shared state, or
                         concerns, updated  updates need to be traced/
                         infrequently       replayed/time-travel debugged

Selectors / slices       Not needed with   Built-in, valuable once state
                          only two          is large enough that most
                          providers         components should only
                                            re-render on their slice

Middleware / devtools     None              Redux DevTools, time-travel,
                                            action logging

Cost of being wrong       Low — a Context   Low if adopted early enough
                          can be migrated   to be simple; migrating
                          into a store      *away* from an over-adopted
                          later without     store later is real work
                          touching consumers
```

CartWise today: two providers, each with a small, well-defined public hook, no cross-slice reads, no need to replay state changes for debugging. Every box in the "good fit for Context" row is checked. Every box that would justify a library is not.

---

# 🚧 Where This Would Actually Start to Break

Being honest about the other direction matters as much as the audit itself. Two concrete signs from the current codebase point at where the *next* chapter's questions would come from:

**Search filter state is not URL-synced.** `useSearch` holds `query`, `sort`, `filter`, `results` entirely in component state. That means a shared or bookmarked search link loses its filters, and the browser back button doesn't restore a previous search. This is a real gap — but it is a **routing** problem (state that should live in the URL) before it is a **state management** problem (state that should live in a global store). Solving it with `useSearchParams` from React Router requires no new dependency and no new Context.

**A third or fourth shared, cross-cutting concern.** If CartWise adds a shopping cart, and the cart needs to be read from the navbar, the product page, checkout, *and* Wishlist and Compare (e.g., "already in your cart" badges), that's the point where three or four independent providers start composing awkwardly, and a single store with selectors becomes easier to reason about than `<A><B><C><D>{children}</D></C></B></A>` in `App.tsx`. CartWise is not there. Two providers is not a wrapper problem.

Neither of these is "add Redux now." Both are the honest answer to "what would change first."

---

# 🚫 Common Mistakes

### Extracting because code looks similar, not because it's duplicated

```text
Wrong reasoning: "Wishlist and Compare both toggle a list, merge them."
Right reasoning: "Wishlist and Compare both parse/validate/guard
                   localStorage identically — merge THAT."
```

Structural similarity in *what a feature does* is not the same signal as duplication in *how it's implemented*. Only the second justifies extraction.

### Letting a shared store learn feature-specific rules

```tsx
// Wrong — the generic store now knows about Compare specifically
function createPersistedList(key: string, cap?: number) { ... }

// Right — the cap is applied by the caller that needs it
function read(): string[] {
    return store.read().slice(0, MAX_COMPARE);
}
```

The moment a "generic" utility grows a parameter for one caller's business rule, it stops being generic and starts being two features' logic tangled together.

### Writing inside a cross-tab handler

```tsx
// Wrong — breaks the loop-free guarantee
store.subscribe((incoming) => {
    setSlugs(incoming);
    write(incoming); // re-triggers a storage event elsewhere
});

// Right — read-only
store.subscribe((incoming) => {
    setSlugs((current) => (isSameList(current, incoming) ? current : incoming));
});
```

### Treating a lazy `useState` initializer as a place for side effects

```tsx
// Wrong — read() silently rewrites storage as a side effect
function read() {
    const migrated = migrate(raw);
    localStorage.setItem(key, JSON.stringify(migrated)); // side effect!
    return migrated;
}

// Right — read returns the migrated shape; only a real write persists it
function read() {
    return migrate(raw); // pure, no localStorage.setItem here
}
```

### Adding a version field after the schema has already changed

```text
Wrong order: change the shape → add "v" at the same time
             → old unversioned data still needs sniffing forever

Right order: add "v" before you need it
             → the next real shape change has something to check against
```

### Reaching for a state library because the chapter is titled "State Management"

The chapter title describes the topic, not the prescribed solution. The audit — not the title — determines whether a dependency is justified.

---

# ⚠️ Known Limitations

**`useRecentSearches` still has its own copy of the old pattern.** It was found during the audit but was out of this chapter's scope (Wishlist and Compare only). Migrating it to `persistedList.ts` — and giving recent searches cross-tab sync it currently lacks — is a clean, low-risk follow-up.

**Search filter state is not URL-synced.** Named above as the concrete next problem. Not fixed in this chapter because it's a routing concern, not a persistence one, and mixing the two would have expanded this chapter's scope past "harden what exists."

**`useTheme.ts` contains a duplicate, unused `useDebounce` implementation.** Found during the audit, imported nowhere, left untouched as genuinely out of scope for a state-management hardening pass. Worth a one-line deletion later.

**No automated tests for the new store or the migration path.** Every verification in this chapter — including the two-tab cross-tab checks — was manual, in a real browser. `persistedList.ts` is a strong candidate for unit tests: pure functions, easy to mock `localStorage`, no React involved.

---

# 🧪 Verification

### Behavior regression (Wishlist and Compare)

```text
Add / remove / toggle / clear     unchanged
Sort (recent/price/rating)        unchanged, storage unmutated by sorting
Duplicate prevention              unchanged
Self-healing of dead slugs        unchanged — bogus slug pruned, storage
                                   rewritten clean
Compare 4-item cap                unchanged, 5th item's control disabled
```

### Migration

```text
Seed a legacy bare array manually in DevTools
      ↓
Reload
      ↓
Badge and page read correctly (order preserved)
Storage NOT rewritten by the read alone
      ↓
Perform one real add/remove
      ↓
Storage now holds {"v":1,"items":[...]}, legacy entries intact
```

### Cross-tab (two real tabs)

```text
Tab A removes a product → Tab B's badge updates, no reload
Tab B removes a product → Tab A updates, Compare stays untouched
Tab B adds a 3rd compare item → Tab A's open /compare page updates live
Tab B writes 5 compare items → Tab A still shows the capped 4
Tab B calls localStorage.clear() → both tabs reset, event.key === null handled
Write count on the RECEIVING tab, across every direction: 0
                                                             (proves no loop)
```

### Hostile storage

```text
Force getItem/setItem to throw
      ↓
Click wishlist/compare controls, dispatch storage events
      ↓
No uncaught error, page renders fully
```

### Tooling

```text
npx tsc --noEmit                      0 errors
npx eslint src --max-warnings=0       0 errors, 0 warnings
npm run build                         succeeds
Console, both tabs, full session      0 errors, 0 warnings
```

---

# 📌 Key Takeaways

After Chapter 14:

- An audit of actual state, done before writing code, found a third duplication nobody had named.
- Structural similarity between features is not the same signal as literal code duplication — only the second justified extraction.
- `persistedList.ts` owns generic persistence mechanics and knows nothing about wishlists, comparisons, or caps.
- Feature-specific rules — recency ordering, the four-item cap — stay in their own providers, not the shared store.
- Cross-tab sync is safe from feedback loops only because it is strictly read-only, relying on the browser's own guarantee that a `storage` event never fires in the writing tab.
- A schema version is only useful if it exists before the shape changes — adding one after the fact means sniffing forever.
- Migration happens at read time, in memory, without side effects — the lazy `useState` initializer contract depends on that purity.
- Every public hook (`useWishlistSelection`, `useCompareSelection`) is completely unchanged by this chapter.
- CartWise's two-provider Context architecture is a good fit today, checked against real criteria — not because a library wasn't considered, but because the audit didn't find a problem one would solve.
- The next real state-management question in this codebase is Search's filter state needing to live in the URL — a routing fix, not a library adoption.

---

# 🎯 Chapter Outcome

The CartWise journey is unchanged for the user — this chapter is invisible in the browser by design. What changed is underneath it:

```text
Before                              After

3 copies of the same guard          1 shared, generic store
No cross-tab sync                   Read-only, loop-free sync
Bare arrays, no version             Versioned envelope + migration
```

Two features now share a hardened foundation, and a third (`useRecentSearches`) has a clear, low-risk path to join them. The architecture is ready for the next real layer.

# 🗄️ Chapter 15 — Backend Architecture
