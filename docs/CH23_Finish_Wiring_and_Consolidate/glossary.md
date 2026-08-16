# 📖 CH23 — Glossary

> **Project:** CartWise  
> **Chapter:** Finish Wiring & Consolidate

This glossary explains the important terms and concepts introduced while wiring authentication and real persistence into CartWise, and consolidating duplicated components and design tokens.

---

# 🔐 Session

A Session is the record of who is currently authenticated, held as a JWT plus user info.

```text
cartwise.auth.session
  { userId, email, token }
```

Owned entirely by `services/api.ts` — `AuthProvider` reads it, never duplicates it.

---

# 🧠 AuthProvider

AuthProvider is the Context provider exposing session state to the React tree.

```text
api.ts's session (source of truth)
        ↓
AuthProvider (reads it, exposes it)
        ↓
useAuth() (every consumer)
```

Built to mirror `WishlistProvider` and `CompareProvider`'s existing shape deliberately, not by coincidence.

---

# 🪝 useAuth

useAuth is the single hook the rest of the app uses to read or change auth state.

```tsx
const { user, isAuthenticated, login, signup, logout } = useAuth();
```

Throws if called outside `<AuthProvider>`, matching `useWishlistSelection` and the compare equivalent.

---

# 🚧 ProtectedRoute

A ProtectedRoute is a wrapper that redirects unauthenticated visitors away from a route.

```text
Logged in      → renders the route
Logged out     → redirect to /login
Status: loading → renders nothing, waits
```

Applied to `/wishlist` and `/compare` — both are user-scoped backend features with no meaningful guest experience.

---

# 🧊 Lazy Initializer

A Lazy Initializer is a function passed to `useState` that React calls exactly once, on mount.

```tsx
useState(() => toUser(getSession()))     // correct — reads once
useState(toUser(getSession()))           // wrong — reads on every render
```

Used by `AuthProvider` to seed state from the existing session without re-parsing it constantly.

---

# 🚫 No Second Source of Truth

No Second Source of Truth means a value is read from one place, never cached separately.

```text
Wrong                              Right
AuthProvider caches its own token   AuthProvider reads api.ts's session directly
    ↓                                   ↓
api.ts clears session on 401        Both agree, always
AuthProvider's copy still says
"logged in" — now they disagree
```

The reason `AuthProvider` has no `token` field of its own.

---

# ⚔️ Async Contract

An Async Contract change is converting a synchronous return value into a `Promise` of the same value.

```ts
// Before
toggle: (slug: string) => WishlistToggleResult

// After
toggle: (slug: string) => Promise<WishlistToggleResult>
```

The result values (`"added"`, `"removed"`) never changed — only the wrapper did. This is what let the chapter satisfy "becomes async" and "the contract must not change" at the same time.

---

# 🔄 Optimistic Update

An Optimistic Update applies a change to the UI immediately, before the network confirms it.

```text
Click heart → UI fills immediately → request sent in background
                                          ↓
                                request succeeds → nothing more to do
                                request fails    → roll back
```

Required the moment `add`/`remove`/`toggle` became async — without it, every click would wait on a round trip before the UI moved at all.

---

# ⏪ Rollback

Rollback is undoing an optimistic update after its underlying request fails.

```text
Optimistic: heart fills instantly
Request fails (network error, 500, etc.)
Rollback: heart empties again, matching reality
```

Never triggered by a 404 on DELETE — see Desired End State below.

---

# 🏁 Race Condition (Provider-Level)

A Race Condition is when two operations can complete in an order the code didn't anticipate, producing a wrong result.

```text
t=0    Page loads, GET starts (5 items)
t=50   User adds an item optimistically (6 items, shown now)
t=300  The GET from t=0 finally resolves with the OLD 5-item list
       ↓
       Overwrites the optimistic 6th item — heart empties itself
```

Distinct from Chapter 13's request-cancellation race — this one is a background load racing a *local* optimistic change, not two network requests racing each other.

---

# 🔢 Mutation Epoch

A Mutation Epoch is a counter incremented on every local optimistic change, used to detect whether a background load's result is still trustworthy.

```text
epoch = 0 → load starts
epoch = 1 → user makes an optimistic change while load is in flight
load resolves, sees epoch changed (0 → 1)
       ↓
discards its own result — the optimistic state already knows better
```

The fix for the provider-level race condition above.

---

# 🎯 Desired End State

Desired End State is judging a response by whether the outcome it describes is what the caller wanted, not by its raw status code alone.

```text
DELETE /wishlist/slug → 404 (item already gone)
       ↓
Desired end state: "item is not in the wishlist" — already true
       ↓
Treated as success, not failure — no rollback triggered
```

Distinguishes this from naive status-code branching, which would treat every non-2xx as an error worth undoing.

---

# 🪞 setState Updater Timing

setState Updater Timing is the fact that a function passed to `setState` runs during React's render phase, not immediately at the call site.

```tsx
// Wrong — reads previous before React has actually run the updater
setSlugs(current => { previous = current; return next; });
sendRequest(previous);   // stale or undefined

// Right — a ref mirrors state synchronously, read after the fact
```

The cause of the first provider bug found in this chapter.

---

# 🧯 Self-Healing (Narrowed)

Self-Healing is a system correcting itself when stored data no longer matches reality — narrowed in this chapter to stop treating "this build can't render it" as equivalent to "the server doesn't have it."

```text
Before (CH13)   unresolved slug → assumed dead → pruned via DELETE
After (CH23)    unresolved slug → could be a real row this build can't map →
                left alone, not deleted
```

Prevents a frontend data-mapping gap from causing real, irreversible deletion of database rows.

---

# 🃏 Data Model Mismatch

A Data Model Mismatch is when two components that look interchangeable actually expect differently shaped data.

```text
ProductCardModel        HomeProduct
price: number (99999)   price: string ("₹99,999")
```

Found by diffing the two `ProductCard` implementations before merging them — the reason a straight delete-one-keep-the-other approach wouldn't have worked.

---

# 🔁 Adapter

An Adapter converts one data shape into another so two mismatched systems can share a single downstream component.

```text
HomeProduct → toCardModel() → ProductCardModel → shared ProductCard
```

Built specifically so the merged `ProductCard` didn't need two separate implementations internally.

---

# 🎨 Design Token

A Design Token is a named, reusable value (usually a color, spacing unit, or font size) that represents a design decision, kept in one place rather than repeated inline.

```text
--primary: #...;        (CSS custom property, CH23's starting point)
--color-primary: #...;  (Tailwind @theme token, CH23's destination)
```

---

# 🧬 Byte-Identical Migration

A Byte-Identical Migration is a structural change that moves a value from one system to another without altering the value itself.

```text
Old: --success: #16a34a;
New: --color-success: #16a34a;   ← same hex, different home
```

Verified by diffing every one of the 14 migrated colors — this was explicitly not a redesign.

---

# ⚠️ Naming Collision

A Naming Collision is when a new token's proposed name already exists, bound to a different value.

```text
Chapter 20's --success   ≠   Chapter 23's legacy --success
```

Resolved with a `legacy-` prefix rather than overwriting the live Chapter 20 token, preserving both rather than letting one silently replace the other.

---

# 🚪 Guest Access Decision

The Guest Access Decision is whether an authenticated feature should remain partially usable by logged-out visitors.

```text
Decided: No.
/wishlist and /compare both require login —
matches the backend, which 401s both without a token.
```

A deliberate, confirmed choice rather than an accidental side effect of adding `ProtectedRoute`.

---

# 🔀 Independent Stores (Extended)

Independent Stores is the rule, carried over from Chapter 13, that Wishlist and Compare must never let an operation on one affect the other — extended in this chapter to also mean neither should share auth-handling logic beyond both reading the same `useAuth()`.

```text
WishlistProvider ──► useAuth() ──► real wishlist API
CompareProvider  ──► useAuth() ──► real compare API
```

Same session, two fully separate stores.
