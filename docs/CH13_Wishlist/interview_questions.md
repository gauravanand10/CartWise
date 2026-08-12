# 🎯 CH13 — Interview Questions

> **Project:** CartWise  
> **Chapter:** Wishlist
>
> This chapter covers slug-based identity, the selection/loading split, React Context, guarded persistence, async-effect safety, self-healing state, sorting, accessibility, and the Wishlist/Compare boundary in the CartWise Wishlist system.

---

# 📚 Beginner Level

## Q1. What is a Wishlist, and how is it different from a cart?

### Answer

A Wishlist is a personal collection of products a user is interested in but not ready to buy.

A cart implies purchase intent — quantities, checkout, payment.

CartWise's Wishlist has none of that. It answers one question:

```text
"Which products am I interested in?"
```

---

## Q2. Why does CartWise need a Wishlist feature at all?

### Answer

Users discover products they like but are not ready to act on. Without a Wishlist, closing the tab means losing the product entirely — nothing else in the app remembers it.

```text
Product Discovery
       ↓
Save Product
       ↓
Wishlist
       ↓
Return Later
       ↓
Compare / Purchase
```

---

## Q3. What does the Wishlist actually store?

### Answer

A plain array of product slugs:

```json
["galaxy-s25-ultra", "iphone-16-pro"]
```

Not product objects, not prices, not images — identity only.

---

## Q4. Why store the slug instead of the full product object?

### Answer

Product data changes — prices drop, ratings update, stock runs out. A copied object goes stale the moment any of that changes.

```text
Day 1   Save at ₹1,29,999
Day 30  Real price ₹1,09,999

Stored copy   → still ₹1,29,999   (wrong)
Resolved slug → ₹1,09,999         (always correct)
```

Storing identity and resolving data at read time makes staleness impossible.

---

## Q5. Where in the file structure does the Wishlist feature live?

### Answer

```text
frontend/src/features/wishlist/
```

Following the same feature-first layout as `search`, `product` and `compare` — components, context, hooks, services, types, utils and constants all owned by the feature.

---

## Q6. What does `WISHLIST_STORAGE_KEY` do?

### Answer

```ts
export const WISHLIST_STORAGE_KEY = "cartwise:wishlist";
```

It namespaces the `localStorage` key so it cannot collide with any other data stored on the same origin.

---

## Q7. What is `WISHLIST_LATENCY_MS` and why does it exist?

### Answer

```ts
export const WISHLIST_LATENCY_MS = 300;
```

An artificial delay in the service layer so the loading state is actually exercised in development. Without it, local data resolves instantly and a broken skeleton could ship unnoticed.

---

## Q8. What is `WISHLIST_SUGGESTIONS`?

### Answer

```ts
export const WISHLIST_SUGGESTIONS = 4;
```

The number of popular products shown on the empty-state screen as a starting point.

---

## Q9. How does a user save a product?

### Answer

By clicking the heart icon on a `ProductCard`, on the homepage, in search results, or on the product page — all three call the same `toggle` function from `useWishlistSelection()`.

---

## Q10. What are the four sort options?

### Answer

```text
Recently added (default)
Price: Low to High
Price: High to Low
Customer Rating
```

---

# 📚 Intermediate Level

## Q11. Why does the Wishlist have two hooks — `useWishlistSelection` and `useWishlist` — instead of one?

### Answer

They answer different questions.

```text
useWishlistSelection()   "what has the user saved?"     — synchronous, app-wide
useWishlist()             "what should the page render?" — async, page-scoped
```

Selection is needed by every card in the application, so it must be cheap. Loading is needed only by the Wishlist page, so its state must not leak everywhere else. Merging them would give every product card a loading flag and an error string it never uses.

---

## Q12. Why is `count` computed as `slugs.length` instead of being stored as its own state field?

### Answer

```tsx
count: slugs.length
```

A stored `count` would be a second source of truth that can drift from the array it is meant to describe — exactly how a navbar badge ends up showing "3" over an empty page. Deriving it at read time makes that class of bug impossible.

---

## Q13. Walk through what happens, step by step, when a user clicks a heart.

### Answer

```text
Click
  ↓
toggleWishlist(slug) called (from useWishlistSelection)
  ↓
WishlistProvider's toggle() runs
  ↓
setSlugs functional updater checks current.includes(slug)
  ↓
Present → filtered out, result = "removed"
Absent  → prepended,     result = "added"
  ↓
write(next) persists to localStorage
  ↓
New slugs array → new context value (memoised)
  ↓
Every consumer with a matching isWishlisted() re-renders
  ↓
Heart fill, aria-pressed, navbar badge all update
```

---

## Q14. Why does `toggle` decide "added" vs "removed" *inside* the `setSlugs` updater instead of checking `slugs.includes(slug)` before calling `setSlugs`?

### Answer

Checking outside would require `toggle` to depend on `slugs`:

```tsx
// Rejected approach
const toggle = useCallback((slug) => {
    if (slugs.includes(slug)) remove(slug);
    else add(slug);
}, [slugs, add, remove]);
```

That gives `toggle` a new identity on every save, which changes the memoised context value, which re-renders every component holding a heart — even ones for unrelated products.

Deciding inside the functional updater keeps the dependency array empty:

```tsx
const toggle = useCallback((slug) => {
    let result: WishlistToggleResult = "added";
    setSlugs((current) => { /* decide + write here */ });
    return result;
}, []);
```

---

## Q15. Why does `add` return early when the slug is already present, rather than always writing?

### Answer

```tsx
if (current.includes(slug)) return current;
```

Returning the exact same array reference tells React nothing changed — it bails out of the re-render entirely. Writing a "new" array with identical contents would still trigger a re-render and a redundant `localStorage.setItem` call for no observable benefit.

---

## Q16. How does the Wishlist achieve "most recently saved first" without storing a timestamp?

### Answer

By prepending on every save:

```tsx
const next = [slug, ...current];
```

```text
Save A → [A]
Save B → [B, A]
Save C → [C, B, A]
```

Array order *is* recency, so the "recent" sort is just the identity function — `if (sort === "recent") return products;`. No schema, no clock, no sorting work.

---

## Q17. What are the trade-offs of the order-as-recency approach versus storing an explicit timestamp?

### Answer

```text
Order approach                      Timestamp approach

["a","b"]                           [{slug:"a", savedAt:...}]
No schema                           Needs a schema
No sort cost for default view       Sort work every time
No clock involved                   Clock skew / timezone questions
Exact save time not recoverable     Exact save time available
```

Order-as-recency is the right call for "recently added" alone. It stops being sufficient the moment a feature needs "saved 3 days ago" or "price dropped since you saved it" — at that point a timestamp and a schema version become necessary.

---

## Q18. Why is `sortWishlist` written to copy the array before sorting?

### Answer

```tsx
const sorted = [...products];
sorted.sort(...)
```

`Array.prototype.sort` mutates in place. The input here is `activeProducts`, a value held in React state via `useState`/`useMemo` inside `useWishlist`. Sorting it directly would mutate state outside a setter — React would not know to re-render, and worse, the "recent" order (which depends on the original array) would be permanently destroyed by a single sort call.

---

## Q19. What does the rating sort's tiebreaker do, and why is it necessary?

### Answer

```tsx
case "rating":
    return sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
```

Without the second term, two products both rated 4.8 would sort in an arbitrary, unstable order. With it, a 4.8 backed by 12,000 reviews outranks a 4.8 backed by 3 reviews — a materially more useful ordering for a comparison-shopping product.

---

## Q20. What does `WishlistGrid` render, and why doesn't the Wishlist have its own card component?

### Answer

It renders `components/ui/ProductCard` — the same card used on the homepage, in search results and in related products.

```text
Duplicating the card would mean:
image, brand, rating, price, discount badge,
wishlist button, compare button, product link
— maintained in two places that can drift apart.
```

Reusing it also means un-saving from the Wishlist page requires no extra code: the card's own heart toggles the same context the page reads, so the card disappears from the grid immediately.

---

## Q21. Why does `WishlistEmpty` show product suggestions instead of only an explanatory message?

### Answer

Because the fastest way out of an empty wishlist is a list the user can save from without navigating anywhere. The suggestions use the same shared `ProductCard`, so saving one moves the page straight into its populated state.

---

## Q22. Why does `WishlistError` offer "Clear wishlist" in addition to "Try again"?

### Answer

Because the failure can be caused by the saved data itself — a slug the service can never resolve, for instance. Retry alone would fail forever in that case, and without a clear action the user would hit this screen every time they open `/wishlist`, with no way out short of opening DevTools.

---

## Q23. Explain the four values of `WishlistStatus` and why their check order matters.

### Answer

```ts
type WishlistStatus = "empty" | "loading" | "error" | "ready";
```

```tsx
const status = activeLoading
    ? "loading"
    : activeError
        ? "error"
        : sorted.length === 0
            ? "empty"
            : "ready";
```

The order is the precedence: loading beats error, error beats empty, empty beats ready. If `empty` were checked before `loading`, the "Nothing saved yet" screen would flash for 300ms on every visit — before the real products even had a chance to load — because an empty `products` array is also the initial state while data is in flight.

---

## Q24. Why does the navbar badge never disagree with the Wishlist page?

### Answer

Both read from the same source:

```text
WishlistProvider
       ↓
slugs.length
       ↓
Navbar badge  AND  Wishlist page count
```

There is no navbar-local wishlist state to fall out of sync. The badge is a pure projection of the one array the provider owns.

---

# 📚 Advanced Level

## Q25. Why does the `useWishlist` effect depend on `key = slugs.join(",")` instead of `slugs` directly?

### Answer

React compares effect dependencies with `Object.is`. If `WishlistProvider` ever produced a new array reference with the *same contents* (which functional updates naturally do on every state change), an array dependency would see "changed" and refetch — even though nothing meaningful changed.

```text
Array dependency: identity-based
["a","b"] (render 1) !== ["a","b"] (render 2)  → refetch, even if contents are equal

String dependency: content-based
"a,b" === "a,b"  → no refetch
"a,b" !== "a,c"  → refetch, correctly
```

Joining collapses the array into a primitive whose equality reflects contents, eliminating a refetch loop. The trade-off: a slug containing a comma would break the round-trip on `key.split(",")`. Slugs are URL segments and never contain commas, so this is safe — but it's an assumption worth documenting, not a law.

---

## Q26. Explain the `cancelled` flag in `useWishlist`'s effect. What bug does it prevent?

### Answer

```tsx
let cancelled = false;
const load = async () => {
    // ...
    if (cancelled) return;
    setProducts(loaded);
    // ...
};
void load();
return () => { cancelled = true; };
```

It prevents a race condition where a slower, earlier request resolves *after* a newer one and overwrites correct data with stale data:

```text
t=0    Remove product → request A starts (5 slugs)
t=50   Remove another → request B starts (4 slugs)
t=300  B resolves → 4 products shown (correct)
t=800  A resolves → 5 products shown (WRONG — resurrects a removed item)
```

The cleanup function runs when the effect re-fires (new `key`) or the component unmounts, flipping `cancelled` to `true` so request A's late result is discarded.

---

## Q27. Why does the effect return early with `if (!key) return;` instead of clearing `products` when there are no saved slugs?

### Answer

```tsx
if (!key) return;
```

Explicitly calling `setProducts([])` here would be a synchronous `setState` inside an effect body purely to represent a value that is already derivable:

```tsx
const activeProducts = key ? products : EMPTY;
```

Deriving it avoids a wasted extra render cycle for information the component can compute for free.

---

## Q28. What is `EMPTY` and why must it be a module-level constant rather than an inline `[]`?

### Answer

```tsx
const EMPTY: ProductCardModel[] = [];
```

```tsx
const activeProducts = key ? products : EMPTY;
const sorted = useMemo(() => sortWishlist(activeProducts, sort), [activeProducts, sort]);
```

An inline `[]` creates a brand-new array reference on every render. Since `useMemo` compares dependencies by reference, that would defeat the memoisation of `sorted` every single time the wishlist is empty. A stable module-level constant keeps the reference identical across renders.

---

## Q29. Explain the self-healing behavior for missing slugs. Why does the service return `missing` instead of throwing?

### Answer

```tsx
const { products: loaded, missing } = await getWishlistProducts(key.split(","));
setProducts(loaded);
for (const slug of missing) remove(slug);
```

A saved slug can stop resolving if a product is delisted or renamed. If unresolved slugs simply stayed in storage:

```text
5 slugs stored, 4 resolve
Badge: ❤️ 5     Page shows: 4 cards     — forever, with no user-facing fix
```

Returning `missing` rather than throwing keeps one dead entry from turning the whole page into an error state the user cannot escape. Pruning it via `remove(slug)` lets storage, badge and grid re-converge automatically on the next load.

---

## Q30. Why is `getWishlistProducts` implemented with `Promise.all` instead of a `for...of` loop with `await` inside it?

### Answer

```tsx
const loaded = await Promise.all(
    slugs.map(async (slug) => ({ slug, product: await getProductBySlug(slug) })),
);
```

A sequential loop would await each slug one at a time — ten saved products would take roughly ten round trips end-to-end. `Promise.all` issues all the lookups concurrently, and because it resolves in input order, the wishlist's recency ordering survives the fetch untouched.

---

## Q31. Why does the read path deduplicate with a `Set` even though the write path already prevents duplicates?

### Answer

```tsx
return [...new Set(parsed.filter((v): v is string => typeof v === "string"))];
```

The write path (`add`/`toggle`) only guards what *this session's* code writes. `localStorage` is user-writable and outlives any one code path — a hand-edited value in DevTools, a value from an older build with different rules, or a half-applied migration can all produce a list the current write path never created. Deduplicating on read means a corrupted stored value can never render two identical cards, regardless of how it got corrupted.

---

## Q32. Why is `read` passed to `useState` as a function reference (`useState(read)`) instead of being called (`useState(read())`)?

### Answer

React only invokes a *function* passed to `useState` once — on the initial render — treating it as a lazy initializer. Calling it directly (`read()`) evaluates it on every render of `WishlistProvider`, which is every render of the entire app, since the provider wraps the router. That would mean parsing `localStorage` on every keystroke, every navigation, every state change anywhere in the tree.

---

## Q33. What specific failure modes does the guarded `read()` function handle, and how?

### Answer

```text
Key missing in storage        → getItem returns null → return []
Value is not valid JSON       → JSON.parse throws → caught → return []
Value is valid JSON but not   → Array.isArray(parsed) is false → return []
an array (e.g. an object)
Array contains non-strings    → filtered out by the typeof guard
```

Every layer degrades to a safe empty list rather than crashing the page.

---

## Q34. The `write()` function silently swallows storage errors instead of surfacing them. Is that a bug?

### Answer

No — it's a documented, deliberate trade-off:

```tsx
function write(slugs: string[]): void {
    try {
        window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(slugs));
    } catch {
        // Storage full or blocked. The wishlist still works for this session;
        // it just will not survive a reload, which is not worth failing over.
    }
}
```

If storage is blocked (private-mode Safari, quota exceeded), the in-memory React state has already updated — the heart fills, the badge increments, everything works until the tab closes. Surfacing an error dialog for that would trade a minor, invisible degradation (no persistence this session) for a major, disruptive one (an error the user can't act on).

---

## Q35. Why does `useWishlistSelection` throw instead of returning a safe fallback like `{ slugs: [], toggle: () => {} }`?

### Answer

```tsx
if (!context) {
    throw new Error("useWishlistSelection must be used inside <WishlistProvider>.");
}
```

A silent fallback would make every heart button in the app clickable and completely non-functional, with no error anywhere — a bug that could ship to production and go unnoticed until users report hearts "not working." A thrown error surfaces the missing provider immediately, in development, at the exact call site.

---

## Q36. Why are `WishlistProvider` and `CompareProvider` both mounted around the router in `App.tsx` rather than around individual routes?

### Answer

```tsx
<WishlistProvider>
    <CompareProvider>
        <AppRoutes />
    </CompareProvider>
</WishlistProvider>
```

Hearts and compare buttons appear on product cards across the homepage, search results and product pages — none of which is the `/wishlist` or `/compare` route itself. The navbar, which shows both badges, isn't scoped to any single route either. A provider scoped to `/wishlist` would leave every heart elsewhere in the app without a context, and `useWishlistSelection` would throw everywhere it's used.

---

## Q37. Why are Wishlist and Compare kept as two entirely separate providers and storage keys instead of one shared "selections" store?

### Answer

They're independent product concerns with independent lifecycles — Wishlist is long-lived and unbounded, Compare is short-lived and capped at 4. Sharing one store risks an operation on one leaking into the other:

```text
WishlistProvider → cartwise:wishlist
CompareProvider  → separate key
```

Removing a product from the Wishlist must never disturb an in-progress comparison, and clearing a comparison must never touch saved products. Two stores make that impossible to get wrong; one shared store would make it possible to get wrong by accident.

---

# ⚛️ React-Specific Questions

## Q38. Why is the context value wrapped in `useMemo`?

### Answer

```tsx
const value = useMemo<WishlistSelection>(
    () => ({ slugs, count: slugs.length, add, remove, toggle, clear, isWishlisted }),
    [slugs, add, remove, toggle, clear],
);
```

Without `useMemo`, a brand-new object literal would be created on every render of `WishlistProvider`, giving the context a new value identity every time — even when nothing changed. Every consumer via `useContext` would re-render on every provider render, not just on actual selection changes.

---

## Q39. What is `isWishlisted` doing, and why isn't it memoised with `useCallback` like the other operations?

### Answer

```tsx
isWishlisted: (slug: string) => slugs.includes(slug),
```

It's defined inline inside the `useMemo` for `value`, so it's already re-created only when `slugs` (or the other dependencies) change — matching the reason it needs to change in the first place: it closes over `slugs` directly, and giving it a stable identity independent of `slugs` would make it return stale answers.

---

## Q40. What does `aria-pressed` communicate that a plain `onClick` handler and a filled icon do not?

### Answer

A filled vs. outlined heart is a purely visual signal — invisible to a screen reader. `aria-pressed={wishlisted}` explicitly tells assistive technology "this is a two-state toggle button, and it is currently in the pressed/unpressed state," independent of how it looks.

```tsx
<button aria-pressed={wishlisted} aria-label={...}>
    <Heart fill={wishlisted ? "currentColor" : "none"} />
</button>
```

State is conveyed three ways simultaneously: visually (fill), semantically (`aria-pressed`), and textually (the label text changes between "Add to wishlist" / "Remove from wishlist").

---

# 🗃️ State Management Questions

## Q41. Why is Wishlist state kept in React Context instead of local `useState` inside each component that needs it?

### Answer

Wishlist selection is needed simultaneously by the Navbar, every Product Card, Product Details, and the Wishlist page — components with no direct parent-child relationship to each other. Local state per component would mean five separate, disconnected copies of "is this product saved," with no way to keep them consistent. Context gives one source of truth that every consumer reads and writes.

---

## Q42. Why does `useWishlist` hold its own local state (`products`, `loading`, `error`, `attempt`, `sort`) instead of putting that in the Context too?

### Answer

That state is specific to rendering the Wishlist *page* — nowhere else in the app needs to know if the page's product-resolution fetch is loading, or what sort order is currently selected. Putting it in the provider would mean the Navbar and every product card re-subscribe to state changes (loading toggling, sort changing) that are completely irrelevant to them, causing unnecessary re-renders app-wide.

---

## Q43. If CartWise later migrates from Context to Redux or Zustand, what changes and what doesn't?

### Answer

```text
Would change:
  WishlistProvider internals (becomes a store slice / atom)
  How components subscribe (useContext → useSelector / hook from the store)

Would NOT change:
  The public contract: slugs, count, add, remove, toggle, clear, isWishlisted
  Every component calling useWishlistSelection()
  wishlistService.ts
  sortWishlist.ts
  The four-state status machine in useWishlist
```

Because `useWishlistSelection` is the only door consumers use, swapping what's behind that hook doesn't require touching a single `ProductCard`.

---

# 💾 Persistence Questions

## Q44. Trace exactly what's written to `localStorage` when a third product is saved.

### Answer

```text
Before:  cartwise:wishlist = ["b","a"]
Action:  add("c")
current.includes("c") → false
next = ["c","b","a"]
write(["c","b","a"])
After:   cartwise:wishlist = ["c","b","a"]
```

---

## Q45. What happens if a user opens CartWise in a browser with `localStorage` completely disabled?

### Answer

```text
read()  → getItem throws → caught → returns []
write() → setItem throws → caught → silently no-ops
```

The app functions normally for that session — saves and removals update in-memory state and the UI reflects them correctly — but nothing survives a reload. No crash, no error shown, degraded gracefully.

---

## Q46. Why does the Wishlist resolve product data through `productService` (Chapter 11) instead of maintaining its own product list?

### Answer

```text
Reads through the Product Details service rather than owning a
catalogue of its own, so a saved product shows the same price
and rating its product page shows.
```

Two independent catalogues would eventually disagree — a price update applied to one and not the other would make the Wishlist and the product page contradict each other for the same slug.

---

# 🏗️ Architecture Questions

## Q47. What is the exact responsibility boundary between `WishlistProvider` and `wishlistService.ts`? They're easy to confuse.

### Answer

```text
WishlistProvider    owns the slug list and its persistence (localStorage)
wishlistService.ts  resolves slugs → full product data (via productService)
```

`WishlistProvider` never fetches product data. `wishlistService` never touches `localStorage`. Neither knows the other's internals — the provider hands `useWishlist` a list of slugs, and the service turns slugs into `ProductCardModel[]`.

---

## Q48. What would have to change to move the Wishlist from `localStorage` to a real backend?

### Answer

```text
Today:
  WishlistProvider ──► localStorage
  useWishlist ──► wishlistService ──► productService (local data)

With a backend:
  WishlistProvider ──► POST /wishlist · DELETE /wishlist/:slug
  useWishlist ──► wishlistService ──► GET /wishlist
```

Because the UI already speaks in slugs and `useWishlist` is already async with loading/error/retry states built in, the migration touches `WishlistProvider` and `wishlistService` only — no component changes. The one new requirement: `add`/`remove`/`toggle` become asynchronous against a server, which means introducing optimistic updates with rollback-on-failure in the provider.

---

## Q49. Why does the feature's `index.ts` export `useWishlistSelection` but not `useWishlist`, `wishlistService`, or `sortWishlist`?

### Answer

```ts
export { default as WishlistPage } from "./WishlistPage";
export { default as WishlistProvider } from "./context/WishlistProvider";
export { useWishlistSelection } from "./hooks/useWishlistSelection";
export type { WishlistSort, WishlistStatus, WishlistToggleResult } from "./types/wishlist";
```

`useWishlistSelection` is the only thing the rest of the app legitimately needs — it's how any component participates in the Wishlist. `useWishlist`, the service, and the sort utility are implementation details of the Wishlist *page* specifically, and exposing them would let other features reach into internals that are free to change.

---

## Q50. What does the unique constraint `UNIQUE (user_id, product_id)` in the proposed future database model correspond to on the client today?

### Answer

```text
Client:  if (current.includes(slug)) return current;
Server:  UNIQUE (user_id, product_id)
```

Both enforce the same invariant — no duplicate entry for the same product — at different layers. The database constraint matters because it protects the invariant even if a buggy or malicious client sends the same save request twice; the client check alone can't be trusted once a network is involved.

---

# 🧩 Scenario-Based Questions

## Q51. A user reports the wishlist count in the navbar is "3" but the wishlist page shows only 2 products. What would you check first?

### Answer

Almost certainly a slug that no longer resolves. Check whether `missing` is non-empty on the last load — if the self-healing `for (const slug of missing) remove(slug)` line was ever removed or is failing silently, a delisted product's slug would stay in storage forever, inflating `slugs.length` (and thus the badge) without a corresponding card. First step: inspect `cartwise:wishlist` in DevTools and try resolving each slug through `getProductBySlug` manually.

---

## Q52. A teammate "optimizes" `isWishlisted` by rewriting it as a `Set` lookup stored in a `useMemo`, separate from `slugs`. What's the risk?

### Answer

Any derived structure kept alongside the source array (`slugs`) risks becoming a second, potentially stale, source of truth if the memoisation dependency list is ever wrong. It's not incorrect in principle — a `Set` genuinely is faster for large lists — but it must be derived from `slugs` on every render where `slugs` changes, exactly the same discipline that already governs `count = slugs.length`. The safer version: `useMemo(() => new Set(slugs), [slugs])`, never a separately-updated Set.

---

## Q53. Two browser tabs are open. A product is un-hearted in Tab A. Tab B still shows it as saved. Is this a bug in the current implementation?

### Answer

It's a known limitation, not an accidental bug — each tab holds its own independent `WishlistProvider` state, initialized once from `localStorage` at mount. There's no subscription to changes made by other tabs. Fixing it requires listening for the browser's `storage` event (which fires in *other* tabs on the same origin when a key changes) and re-running `read()` when it fires.

---

## Q54. Why would switching the `sort` dropdown from "Recently added" to "Price: Low to High" and back ever be used as a test case? What bug would it catch?

### Answer

It specifically catches a mutating sort. If `sortWishlist` sorted `products` in place instead of copying first, switching to "Price: Low to High" would permanently destroy the original insertion order — switching back to "Recently added" would then return the *already price-sorted* list, not the true original order, because the underlying array was mutated. This round-trip test is the cheapest way to catch that class of bug.

---

## Q55. A product that was in the wishlist gets discontinued and removed from the catalogue entirely. Walk through what the user sees.

### Answer

```text
1. User opens /wishlist
2. useWishlist effect fires, calls getWishlistProducts(slugs)
3. getProductBySlug returns undefined for the discontinued slug
4. wishlistService adds that slug to `missing`, excludes it from `products`
5. setProducts(loaded) — page shows the remaining products
6. for (const slug of missing) remove(slug) — the dead slug is pruned from storage
7. Navbar badge updates to match the new, smaller count
```

The user simply sees the wishlist shrink by one, with no error and no manual cleanup required.

---

## Q56. If you were asked to add a "saved 3 days ago" label to each wishlist card, what would actually need to change?

### Answer

The current design cannot support it — array order encodes *relative* recency only, with no absolute timestamp stored. This would require:

```text
1. Change stored shape from string[] to { slug, savedAt }[]
2. Add a schema version to the stored value for safe migration
3. Update read()/write() to the new shape
4. Update add/remove/toggle to set/read savedAt
5. Update sortWishlist's "recent" case to sort by savedAt explicitly
   (it can no longer rely on insertion order alone)
```

This is exactly the trade-off named in the "Recency for Free" design: the simplicity was chosen deliberately, with this exact feature as the acknowledged cost.

---

# 📌 Summary

These questions cover:

- Identity vs data, and why the Wishlist stores slugs only
- The Selection/Loading split and why two hooks exist
- Guarded persistence and every failure mode it handles
- The `join(",")` dependency fix and the race-condition guard
- Self-healing state for unresolvable products
- Pure, non-mutating sorting with a review-count tiebreaker
- The four-state status machine and its precedence
- Accessibility semantics for toggle controls
- Wishlist/Compare independence
- The migration path to a backend-backed wishlist
