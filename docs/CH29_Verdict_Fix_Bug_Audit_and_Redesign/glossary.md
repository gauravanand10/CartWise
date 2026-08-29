# 📖 CH29 — Glossary

> **Project:** CartWise
> **Chapter:** Verdict Algorithm Fix, Full Codebase Bug Audit, and Distinctive Frontend Redesign

---

# 🗳️ One Vote Per Signal

One Vote Per Signal is a ranking rule where facts that measure the same underlying thing are collapsed into a single vote, instead of each rendered row casting its own.

```text
Before   7 rows, all reporting price → 7 votes for the cheapest product
After    1 signal (price), 1 vote → decided by one canonical row
```

The fix for vote-stuffing: not removing the information, just refusing to let one fact outvote everything else by being displayed more times.

---

# ⚖️ Equal Weighting, Chosen Deliberately

Equal Weighting is giving every remaining signal in a scoring system the same influence, rather than assigning some signals more importance than others.

```text
Tempting alternative   "price should count for 2.5x a spec"
Problem                 that number has no real source — it would be
                        exactly the kind of invented figure this project
                        has spent several chapters removing
Chosen instead          every signal counts once, equally
```

---

# 🤝 Honest Tie

An Honest Tie is a ranking result presented to the user as genuinely undecided, when the underlying scores are actually equal — instead of an arbitrary rule silently picking a "winner."

```text
Old behaviour   count > wins[best] — first product to reach the top
                score wins, even against an equal score
New behaviour    bestOverall becomes an array; a tie renders as
                 "Tied for best overall," naming every tied product
```

---

# 🧪 Regression-Proving a Fix

Regression-Proving a Fix is confirming a bug actually existed and was actually fixed by deliberately reverting the fix, re-running the test, watching it fail, then restoring the fix.

```text
Revert fix  → run tests → 2 failed: "Reduce of empty array with
              no initial value"
Restore fix → run tests → 5 passed
```

Stronger evidence than a fix simply passing once — proves the test would have caught the original bug, not just that it passes today.

---

# 🕳️ Coverage Gap vs. Data Drift

Two different failure modes for the same underlying problem (a page reading from a stale local copy of data instead of the real source), distinguished carefully rather than treated as identical.

```text
Data Drift      (catalogue.ts, Chapter 26.5)
                 the local copy disagreed with the real data — caused
                 real wishlist rows to be deleted by a failed lookup

Coverage Gap    (/search, this chapter)
                 the local copy agrees with the real data on everything
                 it has — it just doesn't have most of it. 80 of 100
                 real products are simply invisible to search.
```

Same category of bug, different severity — worth naming precisely rather than reacting to both the same way.

---

# 🔠 Tabular Numerals

Tabular Numerals is a font feature where every digit occupies the same fixed width, so columns of numbers align vertically regardless of which digits they contain.

```text
Without   ₹1,29,999
          ₹79,999      ← digits don't line up; a "1" is narrower than a "7"

With      font-variant-numeric: tabular-nums
          → every digit the same width, columns align cleanly
```

Applied specifically to price columns and comparison tables — the one typographic decision genuinely specific to a product built around comparing numbers side by side.

---

# 🎬 Purposeful Motion

Purposeful Motion is animation added because it communicates something specific, not because it looks polished.

```text
cw-pop        wishlist heart, overshoot-then-settle — visible confirmation
              of a server write the user otherwise can't see happened
cw-reveal     staggered skeleton→content, capped at 3 steps
cw-page-in    a deliberately small 4px shift — larger would read as
              layout shift, which is alarming rather than smooth
```

Each animation is named here by what it's proving to the user, not just what it looks like.

---

# ♿ Reduced-Motion Trap

A Reduced-Motion Trap is when disabling animation for accessibility accidentally hides content instead of just making it appear instantly.

```text
Naive fix    animation: none   on an element whose animation both starts
             and ends at opacity: 0 → the element is now permanently
             invisible for exactly the users who asked for less motion
Real fix     explicitly reset opacity and transform alongside disabling
             the animation
```

Found and fixed proactively — this project's `prefers-reduced-motion` handling was checked against what it would actually do, not just whether the media query existed.

---

# 🖱️ Focus Management (Route Change / Modal / Toggle)

Focus Management is making sure keyboard and screen-reader focus lands somewhere sensible after an interaction, rather than getting silently lost.

```text
Route change   focus moves to <main tabIndex={-1}>, confirmed via
               activeElement checks — was body before the fix
Modal open      focus trapped inside the dialog; Escape returns focus
                to the element that opened it
Toggle click    focus stays on the button that was clicked — confirmed
                even when the icon inside it remounts on state change
```

All three verified with real automation checks against `document.activeElement`, not assumed from reading the component code.

---

# 🧰 Tool-Reported False Negative

A Tool-Reported False Negative is when an automated inspection tool reports a problem that doesn't actually exist, because of a limitation in how the tool itself works — not a real defect in what it's inspecting.

```text
Automated tree reader    reports the logo and both login inputs have
                          no accessible name
Direct inspection         logo has real text content; inputs are labelled
                          by a wrapping <label> the tool doesn't parse
Authoritative check        element.labels (the browser's own API) confirms
                            both are correctly labelled
```

Verified against a second, authoritative source before treating a tool's output as a real finding — the same discipline applied earlier in the project to a search tool that silently under-matched inside a minified bundle.

---

# 🏝️ Unreachable Code Island

An Unreachable Code Island is a set of files that only import each other, with no live route or component pulling any of them into what actually ships.

```text
Button → imported only by EmptyState, ErrorState
EmptyState, ErrorState → imported by nothing
```

Confirmed, not assumed — traced the import graph to prove these files render on zero live routes before deciding they were safe to leave alone rather than delete.
