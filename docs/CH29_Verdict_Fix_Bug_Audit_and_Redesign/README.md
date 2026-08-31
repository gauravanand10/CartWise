# 🛠️ CH29 — README

> **Project:** CartWise
> **Chapter:** Verdict Algorithm Fix, Full Codebase Bug Audit, and Distinctive Frontend Redesign

The largest chapter of the project so far, in three parts: fixing the "Best overall" verdict bias found in Chapter 28, a real bug audit across the whole codebase, and a redesign pass aimed at making CartWise feel distinctive, not just clean.

---

# ⚖️ Part A — Fixing the Verdict Algorithm

Chapter 28 measured the problem precisely: "Best overall" agreed with the cheapest product 83.7% of the time because the same underlying fact — who's cheapest — was counted as seven separate wins (five per-retailer price rows, plus "Current price" and "Best store price").

```text
Mechanism   one vote per real signal, not per row
            all seven price-related rows collapse into a single vote,
            decided by one canonical row — they're one fact wearing
            seven labels, not seven facts
```

Weighting was left equal across every remaining signal — price, rating, number of ratings, and each comparable spec — deliberately. Any other split needs an invented number ("price matters 2.5x more than a spec") of exactly the kind this project has spent several chapters removing.

```text
                        BEFORE    AFTER    delta
winner is CHEAPEST      83.7%    52.5%    -31.3 pts
winner is BEST-RATED     8.5%    48.8%    +40.3 pts
winner is WORST-RATED   59.2%    35.8%    -23.3 pts
```

Measured across all 12,605 same-category 4-product comparisons the real catalogue admits — not a handful of examples.

---

# ⚖️ Honest Ties

The old logic resolved a genuine tie silently, by array position, and presented it as a confident winner. `bestOverall` and `bestValue` are now arrays — when the top score is tied, the UI says so explicitly ("Tied for best overall," naming every product that's actually tied) instead of crowning whichever product happened to be added first.

```text
Top score tied     BEFORE: 2.1% (hidden)   AFTER: 11.3% (shown)
```

More ties are visible now, which looks like less certainty — it's less *false* certainty.

---

# 🐞 Part B — Full Codebase Bug Audit

Six real bugs found, each fixed with a real-world impact statement and a regression test:

```text
1. No error boundary anywhere        any render throw → blank white page,
                                      no nav, no way back but a manual URL
2. PricingCard crashed on an empty   reachable the moment the affiliate
   retailer list                     config is unset — the default state
3. Three unhandled promise           latent rejections in wishlist/compare/
   rejections                        product hooks
4. /browse hung on "Loading…"        forever, with a dead API — no retry,
   forever                            no error state, ever
5. No focus management on route      screen readers announce nothing on
   change                            navigation; keyboard users thrown
                                      back to the top of ~15 header controls
6. No skip link                      WCAG 2.4.1 Level A failure
```

Bug #2 was proven, not just asserted — the fix was reverted, the test suite re-run to confirm it actually failed without the fix, then restored.

One reported finding turned out to be a self-correction rather than a real bug: an initial rapid-toggle test appeared to show UI and server state desyncing, which on re-investigation was the agent's own measurement error (comparing a display name against a URL slug). Re-tested properly at 1/5/9 rapid clicks: no desync in any run.

The backend audit found no defects — transaction boundaries, pagination clamping, and the previously-removed `storeRating` field were all confirmed clean.

---

# 🎨 Part C — A Distinctive Redesign, Without Abandoning Restraint

The brief was explicit: achieve distinctiveness through typography, motion, and rhythm — not more color.

```text
Typography    headings moved from a flat 600-weight/-0.01em everywhere to
              a real 700/400 contrast, with tracking scaled per size
              (h1 -0.035em through h4 -0.012em) and text-wrap: balance
              so headings never orphan a word

Tabular       font-variant-numeric: tabular-nums on every price column —
numerals      the one typographic decision specific to a comparison
              product, so columns of prices actually align digit-for-digit

Motion        CSS only, no new dependency — an entrance curve and a state
              curve, nothing over 320ms:
                cw-pop       wishlist heart, overshoot-then-settle
                cw-reveal    staggered skeleton→content
                cw-page-in   a deliberately small 4px/220ms route transition
                cw-skeleton  replaced Tailwind's high-contrast pulse sweep
```

Reduced motion turns these off with an explicit opacity/transform reset — `animation: none` alone would have left a both-filled animation's element permanently invisible, hiding content specifically from the users least able to work around it.

Applied across all ten routes, not just the homepage — including a redesigned empty-wishlist state (an outlined, not filled, heart — the filled rose heart is the exact glyph that means "already saved," which was being shown on the page for people who had saved nothing) and a redesigned comparison error state (red spent only on the one genuinely destructive control, not the entire panel).

---

# 🕵️ A Second Fork Found and Measured — /search

Investigating a user question about mock data on the search page surfaced a second version of Chapter 26.5's `catalogue.ts` problem — a static local file (20 products) shadowing the real 100-product database.

```text
Unlike catalogue.ts:  every one of the 20 mock entries agrees with the
                       database on price and rating — no silent drift,
                       no data disagreement
The real problem:      pure coverage. 80 of 100 real products are
                       invisible to search, findable only via /browse.
```

The full fix is a real backend capability gap, not a quick patch: the product API has no free-text search parameter, and building it client-side (fetch all, filter in the browser) is the exact architecture an earlier chapter explicitly rejected. Left as a clearly marked, scoped item for a future chapter — but the fabricated claim riding alongside it ("Compared across 9 stores," the third copy of an invented number found across three different chapters) was fixed immediately, derived from the real retailer list instead.

---

# 🔬 Contrast, Caught Against Its Own Rule

While measuring newly styled text, three sites came back below WCAG AA — because `ink-subtle`, a token the design system's own documentation reserves for icons and disabled glyphs, had been used for informative body text. Caught by re-checking new work against the project's own stated rules, not just against a list of previously known problems. Moved to `ink-muted`, re-measured, all clear.

---

# 🌿 Commit

Landed using Chapter 28's protected-rebase process — remote divergence checked first, `docs/` verified untouched four independent ways before pushing.

```text
79f2eeb   36 files, 2,169 insertions, 229 deletions
```

---

# 🚧 Known Gaps, Named Rather Than Hidden

```text
/search mock→API migration      blocked on a real backend capability gap,
                                 scoped and marked for a future chapter
Screen-reader verification      tree-inspection and computed accessible
                                 names, not a hardware NVDA/VoiceOver pass
                                 (unavailable in this environment)
Memory profiling                timers/listeners audited by inspection;
                                 no heap profiler run
Seven legacy UI primitives      confirmed unreachable — zero importers on
                                 any live route — left in place, out of scope
```
