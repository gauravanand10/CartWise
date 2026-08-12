# 📖 CH13 — Glossary

> **Project:** CartWise  
> **Chapter:** Wishlist

This glossary explains the important terms and concepts introduced while building the CartWise Wishlist system.

---

# ❤️ Wishlist

The Wishlist is a personal collection of products a user has saved to revisit later.

It is not a cart. Nothing is reserved, priced or purchased.

The Wishlist answers:

> "Which products am I interested in?"

---

# 🔑 Slug

A slug is the URL-safe identifier of a product.

Example:

```text
iphone-16-pro
```

CartWise uses the slug as the single product identity across routing (`/product/:slug`), Compare and Wishlist.

---

# 🆔 Product Identity

Product Identity is the stable value used to refer to a product without carrying its data.

The Wishlist stores identity only:

```json
["galaxy-s25-ultra", "iphone-16-pro"]
```

Product data such as price and rating is resolved at read time, so a saved product can never display a stale price.

---

# 🧠 Selection State

Selection State is the answer to *what has the user saved*.

It is small, synchronous, shared app-wide, and persisted.

In CartWise it is a single array of slugs owned by `WishlistProvider`.

---

# 🧵 Loading State (Layer 2)

Loading State is the answer to *what should the Wishlist page render right now*.

It is asynchronous, page-scoped and disposable, and lives in `useWishlist`.

Keeping it out of the provider prevents every product card in the application from subscribing to a loading flag it never uses.

---

# 🌐 React Context

React Context shares a value with an entire component subtree without passing props through every level.

```text
WishlistProvider
       ↓
WishlistContext
       ↓
Navbar · Product Cards · Product Details · Wishlist Page
```

---

# 🧱 Provider

A Provider is the component that owns a piece of state and publishes it through a Context.

`WishlistProvider` owns the saved slugs, the operations on them, and their persistence.

---

# 🪝 Custom Hook

A custom hook is a reusable function that encapsulates React logic.

CartWise Wishlist has two, and they are not interchangeable:

```text
useWishlistSelection()   reads the shared selection
useWishlist()            loads and orders products for the page
```

---

# 🚨 Provider Guard

A Provider Guard is a check that fails loudly when a hook is used outside its Provider.

```tsx
if (!context) {
    throw new Error("useWishlistSelection must be used inside <WishlistProvider>.");
}
```

Without it, a missing Provider would turn every heart button into a silent dead control.

---

# 🔁 Toggle

A Toggle is a single action that adds when absent and removes when present.

```text
Not saved  →  toggle  →  Saved
Saved      →  toggle  →  Not saved
```

---

# 📤 Toggle Result

The Toggle Result is what a toggle reports back to its caller.

```ts
type WishlistToggleResult = "added" | "removed";
```

It allows a caller to announce the outcome without re-reading the state it just changed.

---

# 🚫 Duplicate Prevention

Duplicate Prevention ensures the same product cannot appear twice.

CartWise guards both directions:

```text
On write   if (current.includes(slug)) return current;
On read    [...new Set(parsed.filter(isString))]
```

Guarding the read matters because browser storage is user-writable.

---

# 🔢 Derived Value

A Derived Value is computed from existing state rather than stored separately.

```text
count = slugs.length
```

Storing a separate `count` would create a second source of truth that can disagree with the array it describes.

---

# 🧊 Immutability

Immutability means producing a new value instead of modifying the existing one.

```tsx
// Mutation
slugs.push(slug);

// Immutable
setSlugs((current) => [slug, ...current]);
```

React detects state changes by identity, so mutation produces no re-render.

---

# 🔄 Functional Update

A Functional Update passes a function to a setter so it receives the latest state.

```tsx
setSlugs((current) => [slug, ...current]);
```

It removes the need to close over state, which keeps callback identities stable.

---

# 🧷 Stable Identity

Stable Identity means a function or object keeps the same reference across renders.

`useCallback` with an empty dependency array and `useMemo` on the context value give the Wishlist stable identities, so saving one product does not re-render every heart in the application.

---

# ⬆️ Prepending

Prepending adds a new item to the front of a list.

```tsx
[slug, ...current]
```

In CartWise this makes array order equal to recency, so "Recently added" needs no timestamps.

---

# ⏱️ Recency Ordering

Recency Ordering presents the most recently saved product first.

Because the provider prepends, the default sort is the identity function:

```tsx
if (sort === "recent") return products;
```

---

# 💾 localStorage

`localStorage` is browser key-value storage that persists across reloads and sessions.

CartWise stores the wishlist under:

```text
cartwise:wishlist
```

Namespacing the key prevents collisions with anything else on the origin.

---

# 🛡️ Guarded Persistence

Guarded Persistence means every storage access is wrapped in error handling.

`localStorage` can throw in private-mode Safari, is absent during server rendering, and can exceed its quota.

The rule applied:

> Persistence is an enhancement of the session, not a precondition for it.

---

# 🧪 Lazy Initialiser

A Lazy Initialiser is a function passed to `useState` that runs only on the first render.

```tsx
useState<string[]>(read)     // correct
useState<string[]>(read())   // re-reads storage on every render
```

---

# 🧰 Service Layer

The Service Layer is the single boundary between a feature's UI and its data source.

`wishlistService.ts` resolves saved slugs into renderable products by calling the Product Details service.

It is **not** the persistence layer — persistence lives in the Provider.

---

# 🃏 ProductCardModel

`ProductCardModel` is the reduced product shape a card needs: slug, name, brand, category, price, original price, rating, review count, stock, image and AI score.

---

# ✂️ Projection

Projection is mapping a large object down to only the fields a consumer needs.

The service projects full product details into `ProductCardModel`, so the grid does not depend on specs, reviews or editorial content it never renders.

---

# 🔗 Dependency Key

A Dependency Key is a primitive derived from a non-primitive value so an effect compares contents rather than identity.

```tsx
const key = slugs.join(",");
useEffect(() => { ... }, [key]);
```

An array dependency can change identity without changing contents, producing a refetch loop.

---

# 🏁 Race Condition

A Race Condition occurs when a slower earlier request resolves after a newer one and overwrites it.

```text
Request A (5 items) starts
Request B (4 items) starts
B resolves → 4 shown
A resolves → 5 shown   ← wrong
```

---

# 🚩 Cancellation Flag

A Cancellation Flag is a local boolean flipped by an effect's cleanup function to discard the result of a superseded request.

```tsx
let cancelled = false;
// ...
if (cancelled) return;
return () => { cancelled = true; };
```

---

# 🧯 Self-Healing State

Self-Healing State corrects itself when stored data no longer matches reality.

Slugs that no longer resolve are reported as `missing` and removed, so a delisted product cannot inflate the navbar badge forever.

---

# 🚦 Status Machine

A Status Machine replaces multiple loose booleans with one value describing the current screen.

```ts
type WishlistStatus = "empty" | "loading" | "error" | "ready";
```

Precedence matters: loading outranks error, error outranks empty, empty outranks ready.

---

# 🔃 Pure Function

A Pure Function returns the same output for the same input and modifies nothing outside itself.

`sortWishlist` is pure — it copies before sorting, because `Array.prototype.sort` mutates in place.

---

# 🥈 Tiebreaker

A Tiebreaker is a secondary criterion applied when the primary values are equal.

```tsx
(a, b) => b.rating - a.rating || b.reviews - a.reviews
```

A 4.8 from 12,000 reviews outranks a 4.8 from 3 reviews.

---

# 🦴 Skeleton

A Skeleton is a placeholder that mirrors the shape of the content still loading.

The Wishlist skeleton is sized from the known selection count, so the grid does not reflow when products arrive.

---

# 📭 Empty State

An Empty State is a designed screen shown when a collection contains nothing.

The Wishlist empty state offers popular products to save, rather than only explaining the feature.

---

# 🚪 Escape Hatch

An Escape Hatch is an action that lets a user leave a failure state that retrying cannot fix.

The Wishlist error state offers "Clear wishlist" alongside "Try again", because the saved list itself may be the cause of the failure.

---

# 🔘 aria-pressed

`aria-pressed` marks a button as a two-state toggle and reports which state it is in.

An icon-only heart that merely fills on click communicates nothing to a screen reader.

---

# 📢 aria-live

`aria-live="polite"` asks assistive technology to announce a region when its content changes, without interrupting the user.

The saved-product count uses it so the number is announced as it changes.

---

# 🚨 role="alert"

`role="alert"` marks a region as an urgent message that should be announced immediately.

The Wishlist error state uses it so a failure is not silent.

---

# 🧭 Feature-First Architecture

Feature-First Architecture groups code by product capability rather than by technical type.

Everything the Wishlist needs lives inside `features/wishlist/`, and `index.ts` exposes a deliberately small public surface.

---

# 🔒 Public Surface

The Public Surface is what a feature exports to the rest of the application.

```ts
WishlistPage · WishlistProvider · useWishlistSelection · types
```

`useWishlist`, `wishlistService` and `sortWishlist` remain internal.

---

# ⚡ Optimistic Update

An Optimistic Update applies a change in the UI immediately and reverts it if the request fails.

It is not needed today because wishlist operations are synchronous, and becomes necessary when they move to a server.

---

# 🔀 Merge on Login

Merge on Login is the rule for combining a guest wishlist with an account wishlist.

Union is usually correct, because nothing a user deliberately saved should silently vanish.

---

# 🗄️ Unique Constraint

A Unique Constraint is a database rule preventing duplicate rows.

```text
UNIQUE (user_id, product_id)
```

It is the server-side equivalent of the client-side duplicate check.

---

# 🧬 Schema Version

A Schema Version is a marker stored alongside data so its format can change without discarding old values.

The current wishlist stores a bare array and has no version, which is a known limitation.

---

# 🪟 Cross-Tab Synchronisation

Cross-Tab Synchronisation keeps multiple open tabs in agreement, using the browser `storage` event.

It is not implemented in CartWise yet — two tabs currently hold independent state, and the last write wins.
