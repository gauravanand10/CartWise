# ❤️ CH13 — Wishlist

> **Project:** CartWise  
> **Chapter:** Wishlist  
> **Feature:** Saved Products

---

# 👋 Welcome

Chapter 11 let users understand a single product.

Chapter 12 let users answer **"which one should I buy?"**

But there is a third question users ask far more often than either of those:

> **"I like this — but not right now."**

A user finds a phone worth ₹1,29,999 on a Tuesday, is not ready to spend it, and closes the tab. On Saturday they want that exact product back. Search will not remember it. Compare will not remember it. Nothing in CartWise remembered it.

That is the purpose of the Wishlist.

The journey becomes:

```text
🔍 Search
   ↓
🛍️ Product Details
   ↓
❤️ Save
   ↓
🕒 Come Back Later
   ↓
⚖️ Compare / Buy
```

The Wishlist is deliberately **not** a shopping cart. Nothing is reserved, nothing is priced, nothing is checked out. It is a personal shortlist that survives a reload.

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- Why a wishlist stores **identity**, not product data.
- Why a slug is used as product identity instead of an object.
- How app-wide selection state is shared through React Context.
- Why the provider is split from the page's data-loading hook.
- How saved identifiers are resolved back into renderable products.
- Why `localStorage` access must be guarded rather than trusted.
- How duplicates are prevented on both write and read.
- How recency ordering is achieved without storing timestamps.
- Why a toggle decides its outcome inside the state setter.
- How an async effect is protected against a stale response.
- How a wishlist heals itself when a saved product disappears.
- How a four-state status machine drives the entire page.
- How sorting is kept pure and non-mutating.
- How the same wishlist control appears in cards, product pages and the navbar.
- Why Wishlist and Compare remain two independent stores.
- What this architecture makes easy when the backend arrives.

---

# 🧭 The Wishlist Experience

The complete CartWise journey after Chapter 13:

```text
Homepage
   │
   ▼
Search
   │
   ▼
Product Details
   │
   ├──► Add to Compare
   │
   └──► ❤️ Save to Wishlist
                │
                ▼
          Navbar Badge
                │
                ▼
          Wishlist Page
                │
                ├── Sort
                ├── Remove
                ├── Clear All
                └── Jump to Compare
```

The heart is available everywhere a product is shown. The Wishlist page is where the collection is managed.

---

# 🤔 Wishlist vs Compare

CartWise now has two selection features. They look similar and are frequently confused, so the distinction has to be explicit.

**Wishlist** answers:

> Which products am I interested in?

```text
Wishlist

├── iPhone 16 Pro
├── Galaxy S25 Ultra
├── Pixel 9 Pro
├── OnePlus 13
└── ... unbounded
```

**Compare** answers:

> Which of these is better?

```text
iPhone 16 Pro   VS   Galaxy S25 Ultra
       (maximum 4 products)
```

The differences that actually matter in the code:

```text
                  Wishlist            Compare
Purpose           Save for later      Evaluate now
Size              Unbounded           Capped at 4
Lifetime          Long-lived          Short-lived
Storage key       cartwise:wishlist   separate key
Provider          WishlistProvider    CompareProvider
```

They are two separate contexts with two separate storage keys, on purpose. Removing a product from the Wishlist must never disturb a comparison the user is in the middle of, and vice versa.

The Wishlist toolbar links to `/compare`, but that link is **navigation, not a transfer of state**.

---

# 🗂️ Feature Structure

The Wishlist lives entirely inside:

```text
frontend/src/features/wishlist/
```

The structure is:

```text
src/features/wishlist/
│
├── WishlistPage.tsx
│
├── components/
│   ├── WishlistEmpty.tsx
│   ├── WishlistError.tsx
│   ├── WishlistGrid.tsx
│   ├── WishlistSkeleton.tsx
│   └── WishlistToolbar.tsx
│
├── context/
│   ├── WishlistProvider.tsx
│   └── wishlistContext.ts
│
├── hooks/
│   ├── useWishlist.ts
│   └── useWishlistSelection.ts
│
├── services/
│   └── wishlistService.ts
│
├── types/
│   └── wishlist.ts
│
├── utils/
│   └── sortWishlist.ts
│
├── constants.ts
│
└── index.ts
```

This is the same feature-first shape used by `search`, `product` and `compare`. The feature owns its components, state, data access, types, utilities and configuration, and exposes a deliberately small public surface through `index.ts`:

```ts
export { default as WishlistPage } from "./WishlistPage";
export { default as WishlistProvider } from "./context/WishlistProvider";
export { useWishlistSelection } from "./hooks/useWishlistSelection";
export type { WishlistSort, WishlistStatus, WishlistToggleResult } from "./types/wishlist";
```

Notice what is **not** exported: `useWishlist`, `wishlistService`, `sortWishlist`, the provider internals. Those are implementation details of the Wishlist page. The rest of the application only ever needs the provider and the selection hook.

---

# 🧩 Wishlist Architecture

This is the most important section of the chapter, because the Wishlist is **two layers, not one**, and mixing them up is the easiest way to misunderstand the feature.

### Layer 1 — Selection

*What has the user saved?* Small, synchronous, app-wide, persistent.

```text
Any Product Card / Product Page / Navbar
                  ↓
        useWishlistSelection()
                  ↓
          WishlistContext
                  ↓
          WishlistProvider
                  ↓
        localStorage (guarded)
```

### Layer 2 — Loading

*What should the Wishlist page render?* Async, page-scoped, disposable.

```text
WishlistPage
      ↓
useWishlist()            ← reads the selection from Layer 1
      ↓
wishlistService
      ↓
productService (Chapter 11)
      ↓
ProductCardModel[]
      ↓
sortWishlist()
      ↓
WishlistGrid
```

The split matters. Layer 1 is needed by dozens of components on every page, so it must be cheap and always available. Layer 2 is needed by exactly one page, so it must not cost anything anywhere else.

A common design mistake is to put both in the provider. Then every product card in the application subscribes to a loading state and an error string it will never use, and every card re-renders when the Wishlist page finishes a fetch.

---

# 🔑 Slug as Identity

The Wishlist stores **product identity only** — a list of slugs.

`types/wishlist.ts` states the rule directly:

> The wishlist stores product identity only — a list of slugs, the same identity Product Details and Compare use. Product data is never copied in: prices and ratings change, and a wishlist holding its own stale copy would quietly disagree with the product page it links to.

The alternative, storing whole product objects, fails in a specific and embarrassing way:

```text
Day 1
User saves iPhone 16 Pro at ₹1,29,999
Copy of the product object is written to localStorage

Day 30
Price drops to ₹1,09,999

Wishlist page  → ₹1,29,999   (stale copy)
Product page   → ₹1,09,999   (live data)
```

The user is now looking at two prices for the same phone inside the same application. For a price-comparison product, that is not a cosmetic bug — it destroys the core promise.

Storing identity only makes staleness impossible:

```text
Slug
 ↓
Resolve at read time
 ↓
Always the current price, rating and stock
```

The slug is also already the URL identity used by the routes (`/product/:slug`) and by Compare, so all three features speak the same language.

---

# 💾 What Is Actually Stored

The persisted value is a plain JSON array of strings:

```json
["galaxy-s25-ultra", "iphone-16-pro", "pixel-9-pro"]
```

Under the key defined in `constants.ts`:

```ts
export const WISHLIST_STORAGE_KEY = "cartwise:wishlist";
```

Three properties fall out of that choice:

- It is tiny — a hundred saved products is a few kilobytes, nowhere near a storage quota.
- It is human-readable, which makes debugging in DevTools trivial.
- It maps one-to-one onto a future API payload, because a server wishlist is also just a list of product identifiers.

The namespaced key (`cartwise:`) prevents collisions with anything else on the origin.

---

# 🧠 WishlistProvider

`context/WishlistProvider.tsx` owns the selection.

State is a single array of slugs, read lazily on the first render:

```tsx
const [slugs, setSlugs] = useState<string[]>(read);
```

Passing the function `read` rather than calling it (`read()`) matters. React calls a lazy initialiser exactly once, on mount. Calling it directly would re-read and re-parse `localStorage` on **every single render** of the provider — which is every render of the entire application.

The contract exposed to the app is defined in `context/wishlistContext.ts`:

```ts
export interface WishlistSelection {
    slugs: string[];
    count: number;
    add: (slug: string) => void;
    remove: (slug: string) => void;
    toggle: (slug: string) => WishlistToggleResult;
    clear: () => void;
    isWishlisted: (slug: string) => boolean;
}
```

`count` is exposed but never stored as separate state:

```tsx
count: slugs.length
```

This is the distinction worth internalising. **Derived value, computed at read time — not a second source of truth.** A stored `count` would be a field that can disagree with the array it is supposed to describe, which is exactly how navbar badges end up showing "3" over an empty page.

The value object is memoised so consumers only re-render when the selection genuinely changes:

```tsx
const value = useMemo<WishlistSelection>(
    () => ({ slugs, count: slugs.length, add, remove, toggle, clear, isWishlisted }),
    [slugs, add, remove, toggle, clear],
);
```

Without `useMemo`, a new object identity on every provider render would push a new context value to every consumer — every product card, every heart, the navbar — on every unrelated render.

---

# ➕ Adding Products

```tsx
const add = useCallback((slug: string) => {
    setSlugs((current) => {
        if (current.includes(slug)) return current;

        const next = [slug, ...current];
        write(next);
        return next;
    });
}, []);
```

Three deliberate decisions in nine lines.

**Functional update.** The updater receives `current` instead of closing over `slugs`. That keeps the dependency array empty, so `add` has a stable identity for the lifetime of the app.

**Returning `current` unchanged.** When the slug is already saved, the same array reference is returned. React bails out of the re-render entirely — there is no state change to process.

**Prepending, not appending.** `[slug, ...current]` puts the newest save first. That single choice is what makes recency ordering free, covered below.

---

# 🔁 Toggle Behaviour

The heart is a toggle, and the toggle reports what it did:

```ts
export type WishlistToggleResult = "added" | "removed";
```

```tsx
const toggle = useCallback((slug: string): WishlistToggleResult => {
    let result: WishlistToggleResult = "added";

    setSlugs((current) => {
        if (current.includes(slug)) {
            result = "removed";
            const next = current.filter((item) => item !== slug);
            write(next);
            return next;
        }

        const next = [slug, ...current];
        write(next);
        return next;
    });

    return result;
}, []);
```

The obvious implementation would have been:

```tsx
// Not what the code does — and why.
const toggle = useCallback((slug: string) => {
    if (slugs.includes(slug)) remove(slug);
    else add(slug);
}, [slugs, add, remove]);
```

That version depends on `slugs`. Every save would produce a **new `toggle` function**, a new context value, and a re-render of every card holding a heart — dozens of components re-rendering because one unrelated product was saved.

Deciding inside the setter keeps the dependency array empty and the identity stable.

The return value exists so a caller can announce the outcome — a toast, or an `aria-live` message — without re-reading the state it just changed.

---

# 🚫 Duplicate Prevention

Without it:

```text
Wishlist

iPhone 16 Pro
iPhone 16 Pro
iPhone 16 Pro
```

Which breaks the count, the grid keys, the sort and the persisted value simultaneously.

CartWise prevents duplicates in **two** places.

On write, in `add` and `toggle`:

```tsx
if (current.includes(slug)) return current;
```

And on read, in `read()`:

```tsx
return [
    ...new Set(
        parsed.filter((value): value is string => typeof value === "string"),
    ),
];
```

Guarding both sides is not redundant. `localStorage` is user-writable — a hand-edited value, a stale entry from an older build, or a half-finished migration can all produce a list the write path never created. Deduplicating on read means a corrupt stored value cannot render two identical cards.

---

# ➖ Removing Products

```tsx
const remove = useCallback((slug: string) => {
    setSlugs((current) => {
        if (!current.includes(slug)) return current;

        const next = current.filter((item) => item !== slug);
        write(next);
        return next;
    });
}, []);
```

```text
Before          Remove B         After

A                                A
B          →                     C
C
```

`filter` returns a new array rather than mutating the existing one, and the absent-slug early return means removing something that is not there is a genuine no-op rather than a pointless re-render.

---

# 🧹 Clear Wishlist

```tsx
const clear = useCallback(() => {
    setSlugs([]);
    write([]);
}, []);
```

```text
Wishlist            →   CLEAR   →      Wishlist

Product A                                (empty)
Product B
Product C
```

Clearing writes `[]` rather than removing the key. Both work, but writing an empty array keeps the stored shape consistent — the value is always a valid JSON array, never sometimes `null`.

Clear is reachable from two places: the toolbar, and — importantly — the error state.

---

# ⏱️ Recency for Free

Because `add` prepends, **array order is recency**. No timestamp is stored per entry.

```text
Save A     →   [A]
Save B     →   [B, A]
Save C     →   [C, B, A]
```

So the default sort in `sortWishlist` is the identity function:

```tsx
if (sort === "recent") return products;
```

Compare that to the alternative:

```text
Timestamp approach

{ slug: "iphone-16-pro", savedAt: 1739001234567 }

→ larger stored payload
→ a schema, so future format changes need a migration
→ sorting work on every render
→ clock-skew and timezone questions
```

versus:

```text
Order approach

["iphone-16-pro", ...]

→ list of strings
→ no schema
→ no sorting work
→ no clock involved
```

Same user-visible feature, a fraction of the machinery. This is a good example of a data-structure choice removing code instead of adding it.

The trade-off, stated honestly: the exact save time is not recoverable. If a future feature needs "saved 3 days ago" or price-drop-since-save, timestamps will have to be introduced — and *that* is when the schema version becomes necessary.

---

# 🛡️ Guarded Persistence

Every storage access is wrapped. The reason is written into the file:

> `localStorage` throws outright in private-mode Safari and is absent during server rendering, and a wishlist failing to load must never take the page down with it.

```tsx
function read(): string[] {
    try {
        const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (!raw) return [];

        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return [...new Set(parsed.filter((v): v is string => typeof v === "string"))];
    } catch {
        return [];
    }
}
```

The read path defends against four distinct failure modes:

```text
Key missing         → []          (first-ever visit)
Malformed JSON      → []          (JSON.parse throws, caught)
Valid JSON, wrong   → []          (Array.isArray guard)
shape (object/null)
Array with junk     → strings only (typeof filter)
["a", 42, null]
```

The write path is deliberately silent about failure:

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

This is a real engineering judgement, not laziness. The user asked to save a product. If storage is blocked, the in-memory state still updates, the heart still fills, the badge still increments, and the wishlist works perfectly until the tab closes. Throwing an error dialog at someone because their browser is in private mode would trade a small silent degradation for a large loud failure.

The principle generalises:

> Persistence is an enhancement of the session, not a precondition for it.

---

# 🪝 useWishlistSelection

This hook is the **only** way the rest of the application touches the Wishlist:

```tsx
export function useWishlistSelection(): WishlistSelection {
    const context = useContext(WishlistContext);

    if (!context) {
        throw new Error(
            "useWishlistSelection must be used inside <WishlistProvider>.",
        );
    }

    return context;
}
```

The context default is `null`, and the hook throws rather than returning a harmless fallback. The comment explains why:

> a missing provider would turn every heart button into a silent dead control, which is far harder to notice than a crash during development.

A fallback such as `{ slugs: [], toggle: () => {} }` would ship a build where every heart is clickable and does nothing, and nobody would notice until a user reported it. A thrown error surfaces the mistake on the first render in development.

The return type is also the reason the whole context is typed as an interface: after the null check, TypeScript narrows to `WishlistSelection`, so every consumer gets full autocomplete and no optional chaining.

Usage is uniform across the app:

```tsx
const { toggle: toggleWishlist, isWishlisted } = useWishlistSelection();
const wishlisted = isWishlisted(product.slug);
```

---

# 📦 wishlistService

`services/wishlistService.ts` is **not** the persistence layer. Persistence lives in the provider, next to the state it persists.

The service is the boundary between the Wishlist UI and its **data source**:

> Reads through the Product Details service rather than owning a catalogue of its own, so a saved product shows the same price and rating its product page shows.

```tsx
export async function getWishlistProducts(
    slugs: string[],
): Promise<{ products: ProductCardModel[]; missing: string[] }> {
    if (slugs.length === 0) return { products: [], missing: [] };

    await new Promise((resolve) => setTimeout(resolve, WISHLIST_LATENCY_MS));

    const loaded = await Promise.all(
        slugs.map(async (slug) => ({ slug, product: await getProductBySlug(slug) })),
    );

    const products: ProductCardModel[] = [];
    const missing: string[] = [];

    for (const { slug, product } of loaded) {
        if (!product) {
            missing.push(slug);
            continue;
        }

        products.push({
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            category: product.category,
            price: product.price,
            originalPrice: product.originalPrice,
            rating: product.rating,
            reviews: product.reviewCount,
            inStock: product.inStock,
            image: product.images[0]?.src ?? "",
            aiScore: product.aiScore,
        });
    }

    return { products, missing };
}
```

Four things to notice.

**No catalogue of its own.** It calls `getProductBySlug` from Chapter 11. A second catalogue would eventually disagree with the first.

**`Promise.all`, not a loop with `await` inside it.** Sequential awaits would make ten saved products cost ten round trips end to end; `Promise.all` issues them concurrently.

**Order is preserved.** `Promise.all` resolves in input order, so wishlist order — which *is* recency — survives the fetch untouched.

**Projection to `ProductCardModel`.** The full product detail object carries specs, reviews, offers and editorial content. A grid of cards needs eleven fields. Passing the whole object around would make the grid depend on a shape it does not use, and quietly couple the card to every future change in product details.

The missing/found split is covered under self-healing below.

The empty state is served by the second export:

```tsx
export function getWishlistSuggestions(
    excludeSlugs: string[] = [],
    limit = WISHLIST_SUGGESTIONS,
): ProductCardModel[] {
    const exclude = new Set(excludeSlugs);

    return getPopularProducts(100)
        .filter((product) => !exclude.has(product.slug))
        .slice(0, limit);
}
```

A `Set` for the exclusion check rather than `Array.includes`, so filtering a hundred products stays O(n) instead of O(n × m).

The artificial delay is intentional:

```ts
/** Simulated latency so the loading state is exercised in development. */
export const WISHLIST_LATENCY_MS = 300;
```

Without it, local data resolves instantly, the skeleton never appears, and a broken loading state ships unnoticed. It is a development affordance that disappears when a real API supplies the latency.

---

# 🧵 useWishlist

`hooks/useWishlist.ts` is the page's data loader. Its return type is completely different from the selection hook:

```ts
interface UseWishlist {
    products: ProductCardModel[];
    suggestions: ProductCardModel[];
    status: WishlistStatus;
    error: string;
    retry: () => void;
    sort: WishlistSort;
    setSort: (value: WishlistSort) => void;
}
```

There is no `add`, no `remove`, no `toggle` here — those belong to the selection layer. This hook turns *what is saved* into *what to render*.

It holds five pieces of local state: `products`, `loading`, `error`, `attempt` and `sort`. All five are page-scoped and disposable. None of them belong in a provider that wraps the entire application.

---

# 🔗 The join(",") Key

```tsx
const key = slugs.join(",");
```

```tsx
useEffect(() => { /* ... */ }, [key, attempt, remove]);
```

This looks like a trick. It is a fix for a real and common bug.

`slugs` is an array. React compares dependencies with `Object.is`. If the provider ever produced a new array with identical contents, `[slugs]` would see a changed dependency and refetch. The comment in the file is blunt about the consequence:

> a new array identity on every render would restart the request continuously

```text
Array dependency (fragile)

render → new array identity → effect runs → setState → render → ...

String dependency (stable)

["a","b"] → "a,b"
["a","b"] → "a,b"   → identical → effect does not run
["a","c"] → "a,c"   → different → effect runs
```

Joining collapses the array to a primitive whose equality reflects **contents**, which is what the effect actually depends on.

The same string is split back inside the effect:

```tsx
await getWishlistProducts(key.split(","));
```

The trade-off is worth naming: a slug containing a comma would break the round-trip. Slugs are URL segments and contain no commas, so this is safe here — but it is an assumption, not a law, and it is the kind of assumption worth a comment in any codebase where slugs are user-generated.

---

# 🏁 Race Guard

```tsx
useEffect(() => {
    if (!key) return;

    let cancelled = false;

    const load = async () => {
        setLoading(true);
        setError("");

        try {
            const { products: loaded, missing } = await getWishlistProducts(key.split(","));

            if (cancelled) return;

            setProducts(loaded);
            for (const slug of missing) remove(slug);
        } catch {
            if (!cancelled) setError("We couldn't load your wishlist. Please try again.");
        } finally {
            if (!cancelled) setLoading(false);
        }
    };

    void load();

    return () => { cancelled = true; };
}, [key, attempt, remove]);
```

The problem this solves:

```text
t=0    User removes a product → request A starts (5 saved)
t=50   User removes another   → request B starts (4 saved)
t=300  Request B resolves     → 4 products rendered
t=800  Request A resolves     → 5 products rendered  ← wrong
```

Without the flag, the slower earlier request wins and resurrects a product the user just removed. The cleanup function sets `cancelled = true` when the effect re-runs, and every `setState` after the `await` is gated on it.

This is the standard async-effect discipline in React, and it is required for **any** effect that awaits and then sets state.

Note also `if (!key) return;` at the top. The comment explains a subtle point:

> Nothing saved: return without touching state. Clearing `products` here would be a synchronous setState in an effect body — a cascading render for a value that is simply derived below instead.

And derived it is:

```tsx
const activeProducts = key ? products : EMPTY;
const activeLoading = key ? loading : false;
const activeError = key ? error : "";
```

With a stable empty reference so downstream memos stay valid:

```tsx
const EMPTY: ProductCardModel[] = [];
```

An inline `[]` would be a new array on every render, defeating the `useMemo` in `sortWishlist`.

---

# 🧯 Self-Healing Missing Slugs

```tsx
for (const slug of missing) remove(slug);
```

A saved slug can stop resolving — a product is delisted, renamed, or removed from the catalogue between builds.

Without healing:

```text
localStorage:  5 slugs
Resolvable:    4 products

Navbar badge:  ❤️ 5
Page shows:    4 cards

Forever.
```

The badge is permanently wrong and the user has no control that can fix it, because there is no card to un-heart.

With healing, the loader prunes the dead entries and the storage, badge and grid converge on the truth automatically.

This also explains why the service **returns** `missing` rather than throwing on it:

> a delisted product left in localStorage should not turn the whole page into an error the user has no way to clear.

One dead slug out of five is a pruning event, not a page failure.

---

# 🚦 Status Machine

The entire page is driven by one derived value:

```ts
export type WishlistStatus = "empty" | "loading" | "error" | "ready";
```

```tsx
const status: WishlistStatus = activeLoading
    ? "loading"
    : activeError
        ? "error"
        : sorted.length === 0
            ? "empty"
            : "ready";
```

```text
                    ┌──────────┐
   saved slugs ───► │ loading  │
                    └────┬─────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     ┌────────┐     ┌────────┐     ┌────────┐
     │ error  │     │ empty  │     │ ready  │
     └────────┘     └────────┘     └────────┘
```

The order of the ternaries is the precedence, and it is correct: loading outranks error, error outranks empty, empty outranks ready. Inverting any pair produces a visible bug — for example, checking `empty` first would flash the "Nothing saved yet" screen for 300ms on every load before the products arrive.

A single status is far safer than three loose booleans, which can express contradictory states like `loading && error` that the UI then has to guess about.

---

# 🔃 Sorting

`constants.ts` defines the options, with recency first and default:

```ts
export const WISHLIST_SORT_OPTIONS = [
    { value: "recent", label: "Recently added" },
    { value: "price-low-high", label: "Price: Low to High" },
    { value: "price-high-low", label: "Price: High to Low" },
    { value: "rating", label: "Customer Rating" },
];
```

> "Recently added" is first and the default because a wishlist is a timeline — the thing you just saved is the thing you are most likely looking for.

`utils/sortWishlist.ts` is a pure function:

```tsx
export function sortWishlist(
    products: ProductCardModel[],
    sort: WishlistSort,
): ProductCardModel[] {
    if (sort === "recent") return products;

    const sorted = [...products];

    switch (sort) {
        case "price-low-high":
            return sorted.sort((a, b) => a.price - b.price);
        case "price-high-low":
            return sorted.sort((a, b) => b.price - a.price);
        case "rating":
            return sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        default:
            return sorted;
    }
}
```

**The copy is mandatory.** `Array.prototype.sort` mutates in place, and the input here is the memoised array held by the loader hook — which is React state. Sorting it directly would mutate state without a setter: React would not re-render, and the "recent" order would be permanently destroyed by a single sort.

```text
Wrong                          Right

products.sort(...)             [...products].sort(...)
     ↓                              ↓
state mutated                  copy sorted
no re-render                   state untouched
recency lost                   recency recoverable
```

**The rating tiebreaker is a real correctness detail.** `b.rating - a.rating || b.reviews - a.reviews` means a 4.8 from 12,000 reviews outranks a 4.8 from 3 reviews. Without it, ordering among equal ratings is arbitrary, and a product with three glowing reviews sits above one with twelve thousand.

Sorting is memoised on the loaded list, so changing the order re-sorts without re-fetching:

```tsx
const sorted = useMemo(() => sortWishlist(activeProducts, sort), [activeProducts, sort]);
```

---

# 🖼️ Wishlist Page

`WishlistPage.tsx` is a coordinator. It contains no wishlist logic at all — it picks which state to render:

```tsx
export default function WishlistPage() {
    const { slugs, clear } = useWishlistSelection();
    const { products, suggestions, status, error, retry, sort, setSort } = useWishlist();

    if (status === "loading") return <WishlistSkeleton count={slugs.length} />;
    if (status === "error")   return <WishlistError message={error} onRetry={retry} onClear={clear} />;
    if (status === "empty")   return <WishlistEmpty suggestions={suggestions} />;

    return (/* header + toolbar + grid */);
}
```

Early returns rather than nested conditionals inside one JSX tree. Each state is a complete screen, and the reader can see all four outcomes in four lines.

The page also does **not** render a `<main>` landmark or a width container:

> MainLayout owns the `<main>` landmark and the width container, so this page only adds its own vertical rhythm — the same contract Search, Product Details and Compare follow.

Consistency at the layout boundary is what stops four pages from each inventing their own padding.

---

# 🧱 Wishlist Grid

`WishlistGrid` renders the **shared** `components/ui/ProductCard`:

```tsx
{products.map((product) => (
    <li key={product.slug} className="h-full">
        <ProductCard product={product} />
    </li>
))}
```

Not a wishlist-specific card. The shared card already carries the image, brand, rating, price, original price, discount badge, wishlist control, compare control and the link to the product page. Duplicating it would have meant maintaining two cards that must never drift apart.

There is a pleasing consequence: because the card contains a heart, **un-saving from the Wishlist page works with no extra code**. The card toggles the same context the page reads, so the item disappears from the grid immediately.

`key={product.slug}` uses the stable identity — never the array index, which would make React reuse the wrong DOM node when an item is removed from the middle.

The column ramp deliberately matches search results: `1 → 2 at 400px → 3 at lg → 4 at xl`.

---

# 🛠️ Wishlist Toolbar

Count, ordering and wishlist-wide actions.

```text
┌──────────────────────────────────────────────────────┐
│  4 saved products      [Sort ▾]  [⚖ Compare]  [🗑 Clear] │
└──────────────────────────────────────────────────────┘
```

Sorting is a **native `<select>`**:

> it gets keyboard support, type-ahead and the platform's own mobile picker for free, where a bespoke menu would have to reimplement all three.

This is worth sitting with. A custom dropdown needs arrow-key navigation, type-ahead matching, focus trapping, outside-click dismissal, `aria-expanded`, `aria-activedescendant`, and a touch-friendly mobile presentation. The platform ships all of it. A custom control should be chosen when the design genuinely requires something the native element cannot do — not by default.

The count is announced to assistive technology as it changes:

```tsx
<p className="text-sm text-slate-600" aria-live="polite">
```

And the `<select>` is labelled properly via `htmlFor` / `id`, so the label is visually hidden on small screens without becoming an unlabelled control.

---

# 📭 Empty State

`WishlistEmpty` does something more useful than explaining the feature — it offers a way out of it.

```text
              ❤️
      Nothing saved yet

  Tap the heart on any product and it
  will appear here, ready to revisit,
  compare or buy when the price is right.

   [ Browse all products ]  [ Go to homepage ]

  ─────────────────────────────────────────

  ✨ Popular right now
  Save one with the heart to start your wishlist.

  [card] [card] [card] [card]
```

> Offers products rather than only explaining the feature: the fastest way out of an empty wishlist is a list the user can save from without leaving the page.

The four suggestions (`WISHLIST_SUGGESTIONS = 4`) are rendered with the same shared `ProductCard`, so their hearts are the same control as everywhere else — saving one moves this page straight into its populated state, with no navigation at all.

The suggestions exclude anything already saved, which matters for the second time this state appears: after the user clears the list.

---

# ⏳ Loading State

`WishlistSkeleton` is sized from information the page already has:

```tsx
export default function WishlistSkeleton({ count }: WishlistSkeletonProps) {
    const cards = Math.max(1, Math.min(count, 8));
```

The selection is known synchronously — only the product data is loading. So the skeleton renders the right number of cards, clamped to a sensible range.

> mirroring the real card proportions and column ramp, so the grid does not reflow when the products arrive.

A skeleton that does not match the real layout is worse than no skeleton: the page visibly jumps when content lands, which is the layout-shift problem the skeleton was meant to prevent.

The container announces itself correctly:

```tsx
aria-busy="true"
aria-live="polite"
aria-label="Loading wishlist"
```

---

# ❗ Error State

`WishlistError` offers **two** actions:

```text
              ⚠️
      Wishlist unavailable

  We couldn't load your wishlist. Please try again.

   [ Try again ]    [ Clear wishlist ]
```

Retry is obvious. Clear is the interesting one:

> Offers "clear" alongside "retry" because the failure can be caused by the saved list itself — without a way to empty it, a user whose stored slugs keep failing would meet this screen every time they open the page.

This is an escape hatch from a permanent failure loop. If the stored data is what is broken, retry will fail forever, and the only recovery would be opening DevTools — which a user will not do.

Retry works by bumping a counter that is an effect dependency:

```tsx
const retry = useCallback(() => setAttempt((value) => value + 1), []);
```

A counter rather than a boolean, because a boolean can only toggle once meaningfully; a counter supports unlimited retries with a single line.

The container carries `role="alert"` so screen readers announce the failure rather than leaving the user on a silent page.

---

# 🧭 Navbar Integration

`NavActions` reads the live count:

```tsx
const { count: wishlistCount } = useWishlistSelection();
```

```text
Save Product
     ↓
WishlistProvider
     ↓
slugs.length
     ↓
❤️ 3
```

There is no navbar-local wishlist state. The badge is a projection of the one source of truth, which is why it can never disagree with the page.

The badge is also part of the accessible name rather than decorative text:

```tsx
aria-label={badge ? `${label} (${badge})` : label}
```

A screen reader hears "Wishlist (3)", not "Wishlist" followed by an orphan number.

---

# 🛍️ Product Card Integration

The heart appears on the shared card and on the homepage card, both using the same hook:

```tsx
const { toggle: toggleWishlist, isWishlisted } = useWishlistSelection();
const wishlisted = isWishlisted(product.slug);
```

```tsx
<button
    onClick={() => toggleWishlist(product.slug)}
    aria-pressed={wishlisted}
    aria-label={...}
>
    <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
</button>
```

State is conveyed **three** ways at once:

```text
Visual        filled vs outlined heart
Semantic      aria-pressed={true|false}
Textual       aria-label changes with state
```

`aria-pressed` is the correct pattern for a toggle button — it tells assistive technology this is a two-state control, not a link or a one-shot action.

The card sits alongside the Compare control, and the two are independent buttons over two independent stores.

---

# 📄 Product Details Integration

`ProductActions` on the product page uses the identical hook and the identical semantics:

> Wishlist toggles in place rather than navigating: saving a product is not a change of context.

This is a deliberate interaction decision. Saving should not move the user anywhere — they are still reading the product. Navigation on save would interrupt the exact task the save was meant to postpone.

So the same product can be saved from three places, and all three stay in sync automatically:

```text
Homepage card ──┐
Search card   ──┼──► useWishlistSelection() ──► one state
Product page  ──┘
```

---

# ⚖️ Wishlist and Compare Independence

`App.tsx` mounts both providers around the router:

```tsx
<WishlistProvider>
    <CompareProvider>
        <AppRoutes />
    </CompareProvider>
</WishlistProvider>
```

> Both selections wrap the router, not a single route: the navbar badges and the heart/scales buttons on product cards live outside their own pages but read and write the same state.
>
> Deliberately two independent providers with two storage keys — wishlist and comparison are separate concerns, and removing a product from one must never disturb the other.

Wrapping the router rather than the `/wishlist` route is required, not stylistic. The navbar badge and every product card exist on pages that are not the Wishlist page. A provider scoped to the route would leave every heart outside it without a context — and `useWishlistSelection` would throw.

The nesting order between the two providers is arbitrary; neither depends on the other. That independence is the point.

---

# 📱 Responsive Design

The grid ramp:

```text
Mobile (<400px)          Tablet (≥400px)

[ Product ]              [ Product ] [ Product ]
[ Product ]              [ Product ] [ Product ]


Desktop (lg)                     Large (xl)

[ P ] [ P ] [ P ]                [ P ] [ P ] [ P ] [ P ]
```

The `min-[400px]:grid-cols-2` breakpoint is unusual and intentional — it is narrower than Tailwind's `sm`. Two cards fit comfortably on a 400px phone; forcing a single column until 640px wastes half the screen on the most common device class.

The toolbar uses `flex-wrap` so the count, sort, compare link and clear button reflow onto a second line rather than overflowing on narrow screens.

The Wishlist needs none of the horizontal-scroll machinery Compare required, because a grid of independent cards has no fixed minimum width the way a side-by-side comparison table does.

---

# ♿ Accessibility

What is implemented:

```text
Heart button        aria-pressed + state-dependent aria-label
Navbar badge        count folded into the accessible name
Saved count         aria-live="polite"
Sort control        native <select> with an associated <label>
Loading state       aria-busy + aria-live + aria-label
Error state         role="alert"
Suggestions block   aria-labelledby pointing at its heading
Decorative icons    aria-hidden="true"
Focus               visible focus-visible rings on every control
```

The pattern to take away: **an icon-only control is not accessible by looking correct.** A heart that fills on click communicates nothing to a screen reader. `aria-pressed` plus a label that changes between "Add to wishlist" and "Remove from wishlist" is what makes it a real control.

Equally, every purely decorative icon carries `aria-hidden="true"`, so assistive technology does not read out an inventory of glyphs.

---

# 🧪 Verification

### Selection logic

```text
Save a product              → appears once
Save the same product twice → still appears once
Remove a product            → only that one disappears
Toggle twice                → returns to the original state
Clear                       → empty state appears
```

### Persistence

```text
Save 3 products → reload → 3 products still saved
DevTools → Application → Local Storage → cartwise:wishlist
    → ["slug-c","slug-b","slug-a"]   (newest first)

Set the value to "not json"   → reload → empty wishlist, no crash
Set the value to {"a":1}      → reload → empty wishlist, no crash
Set the value to ["a","a"]    → reload → one entry
```

### Loading and error

```text
Open /wishlist with saved items → skeleton with the right card count
Skeleton → grid with no layout jump
Add a slug that does not exist to storage → it is pruned, badge corrects itself
```

### Integration

```text
Save from a homepage card    → navbar badge increments
Save from a search result    → same
Save from a product page     → same
Open /wishlist               → all three appear
Un-heart from the grid       → card disappears immediately
Add to Compare               → wishlist unchanged
Clear the wishlist           → comparison unchanged
```

### Sorting

```text
Default order                → most recently saved first
Price: Low to High           → ascending
Price: High to Low           → descending
Customer Rating              → highest first, more reviews wins a tie
Switch back to Recently added → original order intact  ← proves no mutation
```

That last check is the one that catches a mutating sort, and it is easy to skip.

---

# ⚡ Performance Considerations

Membership is a linear scan:

```tsx
isWishlisted: (slug: string) => slugs.includes(slug)
```

For a wishlist of realistic size — tens of products — this is entirely fine, and a `Set` would add conversion cost and a second structure to keep in sync for no measurable gain. If a grid ever renders hundreds of cards against a wishlist of hundreds of entries, the O(n × m) product becomes worth revisiting. **Measure first.**

What actually matters more than the algorithm here:

```text
useCallback on add/remove/toggle/clear   → stable identities
useMemo on the context value             → consumers re-render only on real change
useMemo on the sorted list               → re-sorts without re-fetching
lazy useState initialiser                → storage read once, not per render
join(",") dependency                     → no refetch loop
stable EMPTY constant                    → memo chain stays valid
```

Every one of those exists to stop unnecessary re-renders of components that are mounted on every page in the application. In a context that wide, render discipline is the performance work.

---

# 🏗️ Separation of Responsibilities

```text
WishlistPage            picks which state to render
components/             render one state each
useWishlist             loads, orders, tracks status
useWishlistSelection    reads shared selection
WishlistProvider        owns selection + persistence
wishlistService         the only door to product data
sortWishlist            pure ordering
types/                  the vocabulary
constants.ts            the tunable values
```

Read the list as a test: each line has one job, and no line needs to know how the line below it works. `WishlistGrid` cannot tell whether the products came from `localStorage`, an API, or a test fixture.

---

# 🔌 Backend-ready Architecture

Today:

```text
WishlistProvider ──► localStorage
useWishlist ──► wishlistService ──► productService (local catalogue)
```

With a backend:

```text
WishlistProvider ──► POST /wishlist  |  DELETE /wishlist/:slug
useWishlist ──► wishlistService ──► GET /wishlist
```

The service file already anticipates it:

> When the backend arrives this becomes `GET /wishlist` + `POST/DELETE /wishlist/:slug`, and nothing above this file changes — the UI already talks in slugs and awaits a promise.

Two properties make the migration small rather than a rewrite:

- **The UI already speaks slugs.** A server wishlist is also a list of product identifiers, so the payload shape does not change.
- **The loader is already async.** `getWishlistProducts` already returns a promise, and the page already renders loading, error and retry states. Swapping the implementation does not introduce a single new UI state.

Being honest about what *would* change: `add`, `remove` and `toggle` are currently synchronous. Against a server they become async and need optimistic updates plus rollback on failure — the heart should fill instantly and revert if the request fails. That is real work, and it belongs in the provider, where it will not touch a single component.

---

# 🔐 Future Authentication

```text
Guest                          Signed in

Browser storage                Server storage
Per-device                     Follows the user
Lost on clear                  Durable
```

```text
Laptop  → save iPhone 16 Pro
              ↓
Mobile  → log in → it is already there
```

The interesting problem is not storage — it is the **merge on login**. A guest with four saved products who signs into an account holding six needs a defined rule: union, server-wins, or local-wins. Union is usually correct for a wishlist, because nothing the user deliberately saved should silently vanish.

---

# 🗄️ Future Database Model

```text
wishlist_items
──────────────────
id
user_id        → users.id
product_id     → products.id
created_at

UNIQUE (user_id, product_id)
```

```text
User
  └── Wishlist Items
          ├── Product A
          ├── Product B
          └── Product C
```

The unique constraint is the server-side equivalent of the client-side duplicate check — the database enforces the invariant even if a buggy client sends the same save twice.

`created_at` restores the recency ordering that array order provides today, and unlocks the timestamp-dependent features (saved-N-days-ago, price-drop-since-save) the current design cannot support.

This is a future design, not part of the current implementation.

---

# ⚠️ Known Limitations

Stated deliberately, because a handbook that only lists strengths is not useful.

**No cross-tab synchronisation.** Two open tabs each hold their own React state. Saving in tab A does not update tab B's badge, and the last tab to write wins. The fix is a `window.addEventListener("storage", ...)` subscription in the provider — the `storage` event fires in *other* tabs on the same origin.

**No schema version in the stored value.** The key holds a bare array. If entries ever become objects (to add timestamps), old stored values will fail the `Array.isArray`/`typeof` guards and be silently discarded — users lose their wishlist. A versioned envelope (`{ v: 1, slugs: [...] }`) would allow migration instead of loss.

**No automated tests.** Every verification in this chapter is manual. `sortWishlist`, `read`, and the provider reducers are pure or near-pure and are the easiest possible unit-test targets. This is addressed in Chapter 22.

**Unbounded growth.** Nothing caps the list. A thousand saved slugs would issue a thousand concurrent `getProductBySlug` calls in a single `Promise.all`. Pagination or a cap becomes necessary before that is realistic.

**Suggestions recompute on every selection change.** `getWishlistSuggestions` scans a hundred products whenever `slugs` changes, including while the populated page is showing and the suggestions are not rendered at all.

None of these are blocking for the current stage. All of them are worth knowing before someone asks.

---

# 🚫 Common Mistakes

### Storing product objects instead of identity

```tsx
// Wrong — the copy goes stale the moment a price changes
["...full product object..."]

// Right
["iphone-16-pro"]
```

### Storing a count alongside the list

```tsx
// Wrong — two sources of truth that can disagree
{ slugs: [...], count: 3 }

// Right
count: slugs.length
```

### Mutating state

```tsx
// Wrong
slugs.push(slug);
products.sort(...);

// Right
setSlugs((current) => [slug, ...current]);
[...products].sort(...);
```

### Closing over state in a callback

```tsx
// Wrong — new identity on every change, re-renders every heart
const toggle = useCallback(() => { if (slugs.includes(slug)) ... }, [slugs]);

// Right — decide inside the setter, empty dependency array
const toggle = useCallback((slug) => { setSlugs((current) => ...); }, []);
```

### Depending on an array in an effect

```tsx
// Wrong — identity changes cause refetch loops
useEffect(() => { ... }, [slugs]);

// Right
const key = slugs.join(",");
useEffect(() => { ... }, [key]);
```

### Setting state after an await without a guard

```tsx
// Wrong — a stale response overwrites a newer one
const data = await load();
setProducts(data);

// Right
if (cancelled) return;
setProducts(data);
```

### Unguarded localStorage

```tsx
// Wrong — throws in private-mode Safari, takes the page down
const saved = JSON.parse(localStorage.getItem(KEY));

// Right
try { ... } catch { return []; }
```

### Reaching for localStorage from components

```text
Wrong                          Right

ProductCard  → localStorage    ProductCard  ┐
Navbar       → localStorage    Navbar       ├─► useWishlistSelection()
WishlistPage → localStorage    WishlistPage ┘         ↓
                                              WishlistProvider
                                                     ↓
                                               localStorage
```

### A silent fallback for a missing provider

```tsx
// Wrong — every heart becomes a dead control, and nobody notices
return context ?? { slugs: [], toggle: () => {} };

// Right
if (!context) throw new Error("...must be used inside <WishlistProvider>.");
```

### An index as a list key

```tsx
// Wrong — React reuses the wrong node when an item is removed
products.map((p, i) => <li key={i}>)

// Right
products.map((p) => <li key={p.slug}>)
```

---

# 🌟 Why This Chapter Matters

The Wishlist is roughly 500 lines of code. The concepts underneath it are the ones that recur in every feature that follows.

```text
Identity over data          → Chapter 15, 16, 17 (APIs and schema)
Guarded persistence         → any browser storage, ever
Derived over stored state   → every counter and badge in the app
Async effect discipline     → every API call in Chapter 17
Status machines             → every screen that can fail
Layered separation          → the whole backend migration
Toggle semantics + ARIA     → every interactive control
```

It is also the first CartWise feature where **stale data was the design problem**. Search and Compare read fresh data every time. The Wishlist is the first feature that persists something across sessions, and persistence is where "just store the object" quietly turns into a wrong price on a comparison site.

---

# 📌 Key Takeaways

After Chapter 13:

- Users can save products from cards, search results and product pages.
- The wishlist stores slugs only, never product data, so prices never go stale.
- Selection state is shared app-wide through one provider and one hook.
- Persistence is guarded against private mode, quota limits and corrupt values.
- Duplicates are prevented on write and again on read.
- Recency ordering comes from array order, with no timestamps stored.
- The toggle keeps a stable identity by deciding inside the state setter.
- The loader uses a joined key, a cancellation flag and a retry counter.
- Unresolvable slugs are pruned automatically, so the badge cannot go wrong.
- A four-state status machine drives the page.
- Sorting is pure, non-mutating and memoised, with a review-count tiebreaker.
- Loading, empty and error states are complete screens, and the error state offers an escape hatch.
- The empty state offers products to save, not just an explanation.
- The wishlist grid reuses the shared product card, so un-saving works for free.
- Wishlist and Compare are two providers with two storage keys and no shared state.
- Every wishlist control is a proper toggle button with `aria-pressed`.
- The architecture swaps `localStorage` for an API without touching a component.

---

# 🎯 Chapter Outcome

The CartWise journey now looks like:

```text
🏠 Homepage
     ↓
🔍 Search
     ↓
🛍️ Product Details
     ↓
❤️ Wishlist  ←──────┐
     ↓              │
⚖️ Compare          │
     ↓              │
🏆 Better Purchase Decision
```

The arrow back into the Wishlist is the point of the chapter — for the first time, CartWise remembers something between visits.

Three features now hold state: Search holds filters, Compare holds a capped selection, and Wishlist holds a persistent one. Each invented its own approach, and that is exactly the right moment to step back and ask what state management should look like across the whole application.

# 🧠 Chapter 14 — State Management
