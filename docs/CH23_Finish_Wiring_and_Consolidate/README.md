# 🔌 CH23 — Finish Wiring & Consolidate

> **Project:** CartWise  
> **Chapter:** Finish Wiring & Consolidate  
> **Feature:** Real Authentication, Real Persistence, One ProductCard, One Token System

---

# 👋 Welcome

Chapter 22 froze the database schema. Chapter 21 proved the test suite. But two features that looked finished were quietly still fake.

Wishlist and Compare had never touched the network. Every heart click, every "add to compare" — all of it was `localStorage`, dressed up behind a provider that looked exactly like it would once a real backend arrived. The Chapter 13 handbook even said so directly:

> "When the backend arrives this becomes `GET /wishlist` + `POST/DELETE /wishlist/:slug`, and nothing above this file changes."

Chapter 23 is the day that sentence gets tested. And the moment it did, it revealed a second gap nobody had scoped: there was no way to log in. `services/api.ts` had `login`, `signup`, `getSession`, `setSession` sitting there, fully written, with zero callers. The only "Login" button in the navbar was a `<button>` with no `onClick`. A user-scoped, JWT-authenticated wishlist API has nothing to authenticate against without one.

So this chapter grew sideways before it could finish moving forward:

```text
🔌 Wire Wishlist/Compare to Real API
       ↓
🚧 Blocked — no frontend auth exists
       ↓
🔐 Build Auth Layer (login, signup, sessions, protected routes)
       ↓
🔁 Resume Wiring — now it can actually authenticate
       ↓
🧱 Unify ProductCard (two components, one)
       ↓
🎨 Migrate Colors into Tailwind's Token System
```

Two structural cleanups rode along for the same reason CH13 already anticipated wiring: a second `ProductCard` had drifted into existence under `features/home/`, and the color system was still living in bare `:root` variables instead of Tailwind's own theme layer. Neither was urgent on its own. Both were overdue.

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- Why "the backend arrives" is a real engineering event, not a formality — and what actually breaks when a synchronous, `localStorage`-backed API becomes asynchronous.
- Why optimistic updates require rollback, and three real race conditions that appear the moment state and network disagree about ordering.
- Why a `setState` updater function is not synchronous, and what breaks when code assumes it is.
- Why a 404 on `DELETE` can mean success, not failure — and why blind status-code branching gets that wrong.
- Why an async contract change (`sync value` → `Promise<value>`) can be made without breaking a "the public contract must not change" constraint, and where the actual line is.
- Why session storage should have exactly one source of truth, not a cached copy in React state.
- Why two authenticated features (Wishlist, Compare) sharing one auth layer must still remain otherwise fully independent stores.
- Why merging two similar-looking components requires diffing them first, not assuming they're near-duplicates.
- Why a functional index and a Tailwind token migration are both, at their core, the same kind of problem: something implicit becoming something explicit and versioned.

---

# 🧭 The Full CartWise Journey After Chapter 23

```text
🏠 Homepage
     ↓
🔍 Search / Browse
     ↓
🔐 Log In / Sign Up
     ↓
🛍️ Product Details
     ↓
❤️ Wishlist  ⚖️ Compare
     ↓              ↓
  (persisted to the real database, not the browser)
     ↓              ↓
🔁 Reload — everything is still there
```

For the first time, closing the tab and coming back from a different device would show the same wishlist. Before this chapter, that sentence was aspirational. Now it is true.

---

# 🤔 Why Wiring Blocked on Auth

CartWise now has two things that look similar and are easy to conflate: a **session** and a **selection**.

**Session** answers:

> Who is making this request?

**Selection** (Wishlist, Compare) answers:

> What has this person saved?

```text
                  Session               Selection
Owned by          AuthProvider          WishlistProvider / CompareProvider
Backed by         JWT + localStorage    Real API (post-CH23)
Scope             The whole app         One feature each
Lifetime          Until logout/401      As long as the account exists
```

Every wishlist and compare request now needs to answer "who is this?" before it can answer "what did they save?" That ordering is not incidental — it's why Part B (build auth) had to complete before Part C (wire the real APIs) could be finished honestly, rather than wired against a token that didn't exist yet.

---

# 🗂️ What Changed, Where

```text
frontend/src/features/auth/              ← new feature, mirrors wishlist/compare's shape
│
├── LoginPage.tsx
├── SignupPage.tsx
├── components/
│   ├── AuthForm.tsx
│   └── ProtectedRoute.tsx
├── context/
│   ├── authContext.ts
│   └── AuthProvider.tsx
├── hooks/
│   └── useAuth.ts
└── index.ts

frontend/src/features/wishlist/          ← rewired, contract preserved
frontend/src/features/compare/           ← rewired, contract preserved

frontend/src/components/ui/ProductCard.tsx   ← now the only ProductCard
frontend/src/features/home/components/product/ProductCard.tsx   ← deleted

frontend/src/index.css                   ← colors moved into Tailwind's theme system

backend/.../ComparisonController.java    ← new, built to unblock frontend wiring
backend/.../ComparisonService.java
backend/.../ComparisonFullException.java
```

The auth feature was built to look exactly like Wishlist and Compare already looked — Context, Provider, one consumer hook, thrown error if used outside the provider. Not because that pattern is sacred, but because a third, differently-shaped state feature in the same codebase would be its own kind of inconsistency bug.

---

# 🔐 AuthProvider

The session itself already existed, just unused. `services/api.ts` had a module-level session object under the key `cartwise.auth.session`, and every request already read it to attach `Authorization: Bearer <token>` automatically. `AuthProvider` doesn't duplicate that — it exposes it to React:

```tsx
const [state, setState] = useState<AuthState>(() => toUser(getSession()));
```

A **lazy initializer**, the same pattern Chapter 13's `WishlistProvider` used for reading `localStorage`. Calling `getSession()` directly instead of passing the function reference would re-read on every render of the entire app, since `AuthProvider` wraps the router.

Two decisions here matter more than they look:

**No second copy of the token.** `AuthProvider` does not keep its own cached token — it derives its user from `api.ts`'s existing session on mount, and nothing else. If it cached a copy, a 401 clearing the session in `api.ts` would leave a stale, still-"logged-in" React state behind — a navbar confidently showing a user who the backend just rejected.

**No session-validation endpoint exists on the backend.** A restored token is trusted until a request actually 401s. Building a `/me` endpoint just to validate on every reload was explicitly avoided — it wasn't asked for, and inventing backend surface area to solve a frontend assumption is exactly the kind of scope creep this project has been trying to avoid since Chapter 22's Flyway work.

---

# ⚔️ The Async Contract Problem

This is the single most important design decision in the chapter, and it came from actually reading the code before writing any.

`WishlistProvider` and `CompareProvider` had synchronous, meaningful return values:

```ts
toggle: (slug: string) => WishlistToggleResult   // "added" | "removed"
add:    (slug: string) => AddResult              // "added" | "duplicate" | "full"
```

The brief for this chapter carried two requirements that looked, at a glance, like they contradicted each other:

> "add/remove/toggle become async"

> "The public contract of useWishlistSelection and the compare equivalent must not change"

A network call cannot return synchronously. Something has to give. The resolution: **the contract's value types don't change — only the wrapper does.**

```ts
// Before
toggle: (slug: string) => WishlistToggleResult

// After
toggle: (slug: string) => Promise<WishlistToggleResult>
```

`"added" | "removed"` is still `"added" | "removed"`. Every consumer that branches on the result still branches on the exact same values — they just need to `await` first. This is the narrowest possible break: one `grep` for every call site, one `await` added where the result was actually read, and the meaning of "the contract didn't change" survives intact for the parts of the contract that matter — what the values *mean*, not what wrapper they arrive in.

The `grep` found exactly one call site that read a result without awaiting it (`ComparePage.tsx`), and every fire-and-forget call site (`ProductCard`, `ProductActions`, clear handlers) needed no change at all, since they never looked at the return value in the first place.

---

# 🐛 Three Bugs That Only Exist Once State Meets Network

`localStorage` is synchronous. A network request is not. Converting a provider from one to the other doesn't just add `await` — it opens a window where the world can change while a request is in flight, and three real bugs lived in exactly that window.

### Bug 1: `setState` updaters are not synchronous

```tsx
// Wrong
setSlugs(current => {
    previous = current;   // this assignment happens during React's render phase,
    return next;          // not "now" — reading `previous` right after this call
});
sendRequest(previous);    // sees stale/null data
```

React defers the updater function to the render phase. Code that reads a variable assigned *inside* the updater, immediately *after* calling `setState`, is reading a value that hasn't been set yet. The fix was a `slugsRef` mirror updated synchronously alongside state, plus a single writer responsible for committing to the network — so the network call always reads the value that's actually current, not the value React hasn't gotten around to yet.

### Bug 2: A stale response can overwrite a fresher optimistic update

```text
t=0     Page mounts → GET /wishlist starts (has 5 saved items)
t=50    User clicks a heart → optimistic add, now 6 items, shown immediately
t=300   The mount's GET finally resolves → returns the OLD list of 5
              ↓
        setProducts(oldList) overwrites the optimistic 6th item
              ↓
        Heart empties on its own, with no user action
```

This is the same shape of race condition Chapter 13's `useWishlist` guarded against with a `cancelled` flag — but that guard only protects against a *newer request* superseding an *older* one. It says nothing about a background load racing a *local optimistic change*. The fix: a mutation epoch counter. A load's result is applied only if no local mutation happened while that load was still in flight. If one did, the load's answer is simply discarded — the optimistic state already knows better.

### Bug 3: A 404 on DELETE isn't always a failure

```text
User double-clicks a heart quickly:
  Click 1 → POST /wishlist/slug   (add)
  Click 2 → DELETE /wishlist/slug (remove)

If DELETE reaches the server before POST finishes:
  DELETE runs first → 404 (nothing to delete yet)
  POST runs second  → 201 (item now exists)

Naive handling: DELETE returned an error status →
  rollback → restore the item →
  the user's second click (removal) is silently undone
```

A `404` on a `DELETE` request, in this context, means the desired end state — "this item is not in your wishlist" — is already true. Treating every non-2xx response as a failure worth rolling back was wrong here specifically. The fix: a `404` on `DELETE` returns cleanly rather than triggering rollback, because the outcome the user wanted already happened, just via a different path than expected.

None of these three bugs would exist in a synchronous `localStorage` world. They are the actual cost of "the backend arrives," and they're exactly the kind of thing a spec can't predict — only running the real thing against real timing finds them.

---

# 🧯 Self-Healing, Narrowed

Chapter 13's `useWishlist` had a self-healing behavior: if a saved slug no longer resolved to a real product, it was silently pruned via `remove(slug)`.

That behavior could not be ported as-is. V3's seed data covers 50 products, but the frontend's mock catalogue that self-healing checked against only resolved a subset of them. Porting the old logic unmodified would have meant: open the wishlist page, the app can't find a card to render for a real, existing database row, concludes the slug is dead, and **issues a real `DELETE` against a row that was never actually missing** — silent data loss against a live database, caused by a stale frontend assumption.

The behavior was narrowed rather than ported: "this build can't render a card for this slug" is no longer treated as equivalent to "the server doesn't have this." Pruning was removed. The accepted cost: the wishlist badge can now show a count slightly higher than what's visible in the rendered grid, for products the current build simply can't display yet. That's a cosmetic discrepancy. The alternative was actual, irreversible data loss. Between those two, the discrepancy is the correct trade.

---

# 🧱 Unifying ProductCard

Two components rendered a product card. They looked similar enough that "just delete one" was the obvious first instinct — and the wrong one, because they didn't share a data model.

```text
components/ui/ProductCard.tsx              features/home/components/product/ProductCard.tsx

Takes: ProductCardModel                    Takes: HomeProduct
price: number (99999)                      price: string ("₹99,999", pre-formatted)
```

Merging them required an adapter, not a delete:

```text
features/home/utils/toCardModel.ts
        ↓
Converts HomeProduct → ProductCardModel
        ↓
Every home-feature caller now feeds the shared card
```

The merged component grew three optional props (`badge`, `store`, `fallbackIcon`) to cover behavior the home-feature version had that the shared one didn't — rather than silently dropping functionality to make the merge easier. The actual importers, found by search rather than assumed from the brief's guess, were `ProductGrid` and `ProductRail` — not the three components an earlier draft of this chapter's plan had named. The old file was deleted only after confirming, via search, that zero files still imported it.

---

# 🎨 Tailwind Tokens

Every color CartWise used lived as a bare `:root` CSS custom property — readable, but invisible to Tailwind's own tooling, and disconnected from the design-token conventions the rest of the frontend was moving toward.

```text
Before                          After

:root {                         @theme {
  --primary: #...;                --color-primary: #...;
  --success: #...;                 ...
}                                }
```

All 14 legacy color values were verified byte-identical after the move — this was a structural migration, not a redesign, and a diff between the old and new values confirmed nothing shifted by even one hex digit.

Three names collided with tokens Chapter 20 had already introduced under the same name but a different value — `success`, `danger`, `surface`. Overwriting them would have silently changed colors already in use elsewhere in the app. They were kept under a `legacy-` prefix instead, preserving both sets rather than letting one quietly clobber the other.

---

# 🌟 Why This Chapter Matters

Every chapter before this one added something new. This one is the first that went back and made two "finished" features actually true, and it did so by hitting a wall mid-implementation and stopping rather than pushing through it.

```text
Read the brief          → started building
Read the actual repo    → found the brief's premise was wrong (no auth existed)
Stopped                 → reported honestly, asked before proceeding
Built the missing piece → resumed with a real foundation
```

That sequence — check before building, stop when the ground shifts, report the disagreement instead of quietly working around it — is worth more than any single line of code in this chapter. It's the same discipline Chapter 22 used when it found the brief's table names were wrong, and it caught something Chapter 22's mistake couldn't have: an entire missing subsystem, not just a naming mismatch.

---

# 📌 Key Takeaways

After Chapter 23:

- Wishlist and Compare are backed by real, authenticated API calls — not `localStorage`.
- A working auth layer exists: signup, login, session restoration on reload, protected routes for `/wishlist` and `/compare`.
- The async contract change preserved every existing result value (`"added"`, `"removed"`, `"full"`, `"duplicate"`) — only the wrapper became a `Promise`.
- Optimistic updates ship with rollback, and three real race conditions were found and fixed by actually running the code, not by inspection alone.
- A 404 on `DELETE` is handled as a success case, not a failure, because the desired end state was already true.
- Self-healing was narrowed rather than ported wholesale, to avoid deleting real database rows over a frontend data-mapping gap.
- ProductCard is one component with one data model, reached via an adapter for the caller that used a different shape.
- All 14 colors moved into Tailwind's theme system with zero value drift, and three real naming collisions with Chapter 20 were preserved rather than silently overwritten.

---

# ⚠️ What's Now Worse

Stated plainly, because a chapter that only lists wins isn't trustworthy.

**Optimistic append order can disagree with server position.** Adding an item after a mid-list removal appends it locally, but the server assigns whatever slot actually freed up — briefly showing the wrong 2-3 items until the next reload reconciles it. Accepted because refetching after every single optimistic update would defeat the entire purpose of making it optimistic.

**Cross-tab sync is gone.** The old `localStorage`-backed providers picked up the browser's `storage` event, so two open tabs stayed in sync automatically. The real API has no equivalent push channel — two tabs can now genuinely disagree until one of them refetches.

**Orphaned `localStorage` keys.** `cartwise:wishlist` and `cartwise:compare` linger, unread, in any browser that used the app before this chapter. Harmless, but untidy — no migration or cleanup was written for them.

**Wishlist badge can exceed the visible grid.** Direct consequence of narrowing self-healing — a real, accepted trade against silent data loss, but a trade nonetheless.

**Wishlist clearing is now N requests, not one.** The comparison API got a bulk-delete endpoint; the wishlist API didn't. Clearing a wishlist of 20 items is 20 requests today.

---

# 🎯 Chapter Outcome

```text
🔐 Real Sessions
     ↓
❤️ Real Wishlist Persistence     ⚖️ Real Compare Persistence
     ↓                                    ↓
🧱 One ProductCard                 🎨 One Color Token System
     ↓
🏆 Two "finished" features are now actually finished
```

The gap between "looks done" and "is done" closed twice in this chapter — once for authentication, once for the two features that had been quietly waiting on it since Chapter 13.

# 🚀 Chapter 24 — Production Hardening & Deployment
