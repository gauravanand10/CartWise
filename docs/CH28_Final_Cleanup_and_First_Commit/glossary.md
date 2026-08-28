# 📖 CH28 — Glossary

> **Project:** CartWise
> **Chapter:** Final Cleanup & First Commit

This glossary explains the important terms and concepts introduced while closing out the last known fabrication issues, landing the first commit, and diagnosing the comparison verdict.

---

# ⭐ Unsourced Rating

An Unsourced Rating is a numeric score presented as fact with no real measurement, survey, or dataset behind it.

```text
"Amazon 4.5"   →  five hardcoded literals, applied per retailer,
                   with a fallback of 4.0 for any retailer never seen before
```

The clearest evidence it had to go: a brand-new retailer, named for the first time by a live API response, was instantly awarded a rating it had never earned.

---

# 🕳️ Scope Drift Between Chapters

Scope Drift Between Chapters is when an issue is explicitly flagged as deferred in one chapter's report, but doesn't get carried forward into the next chapter's list of known issues — so it silently disappears from tracking without ever being resolved.

```text
CH26.5   flags storeRating, defers it
CH27     removes many similar issues, but storeRating isn't in its list
CH28     rediscovers it — "missed, not handled"
```

Caught here by treating a prior chapter's deferred list as a checklist to actively re-verify, not just historical color.

---

# 🗳️ Vote-Stuffing (in a ranking algorithm)

Vote-Stuffing is when the same underlying fact is counted as multiple separate "wins" in a scoring system, giving it far more influence than a single fact should have.

```text
Current price       → cheaper product wins
Best store price     → same product wins again
Amazon / Flipkart /
Croma / Reliance /
Vijay Sales price     → same product wins five more times
                       = 7 wins for one underlying fact
```

Found while investigating a much smaller question — whether removing one row changed a verdict — and turned out to be the real, larger problem underneath it.

---

# ⚖️ Silent Tie-Break

A Silent Tie-Break is when a ranking system resolves an actual tie by an arbitrary rule (like array order) and presents the result as a confident, decisive outcome with no indication a tie occurred.

```text
wins: [8, 8, 3, 1]   →  first max found wins  →  shown as "Best overall"
                        with no "tied" label anywhere
```

270 of 12,605 real product comparisons in the catalogue currently hit this — a coin-flip dressed up as certainty.

---

# 🧪 Exhaustive Sweep vs Hand-Picked Examples

An Exhaustive Sweep is checking every possible case a system can produce, rather than trusting a small number of chosen examples to represent the whole.

```text
3 hand-picked comparisons     → all showed "no change"
                                 (a signal to look wider, not a conclusion)
12,605 real comparisons swept → 226 actually changed (1.8%)
```

The three hand-picked examples weren't wrong, they were just an unrepresentative sample — a smaller check that happened to land in the 98.2% that didn't change.

---

# 🕰️ Recovering "Before" State From Git

Recovering "Before" State From Git is using version control itself as the source of truth for what removed code actually did, instead of reconstructing it from memory or notes.

```text
git show <commit>^:path/to/file.ts
```

Guarantees the "before" comparison in a before/after analysis is exact, not approximated.

---

# 🌿 Fast-Forwardable Divergence

A Fast-Forwardable Divergence is when the remote branch has commits the local branch doesn't, but none of them touch the same files the local branch has changed — meaning the two histories can be combined cleanly with no real conflict.

```text
Remote: 4 new commits, all under docs/
Local:  117 changed paths, zero overlap with docs/
             ↓
   Rebase local commit on top of remote → clean, linear history
```

Confirmed by checking file overlap directly rather than assuming a rebase would be safe.

---

# 🔐 Multi-Point Protection Check

A Multi-Point Protection Check is verifying an invariant (here: "docs/ was not touched") through several independent methods, so a single tool's blind spot can't let a mistake through unnoticed.

```text
git status --porcelain -- docs/       → confirms nothing modified
git add -A -- . ':!docs'              → structurally excludes docs/ from staging
git diff --cached --name-only -- docs/ → confirms nothing staged
git show --name-only ... -- docs/      → confirms nothing in the final commit
```

Four different checks, each catching a different way the guarantee could quietly fail.

---

# 📊 Best Overall vs Best Value

Two labels a comparison feature can present, which only mean something distinct if they're actually computed from different signals.

```text
"Best overall"   supposed to weigh price, rating, and specs together
"Best value"      supposed to weigh price against what you get for it
```

Measured here to agree 82.7% of the time — which means, in practice, the two cards on the comparison page are mostly telling the shopper the same thing twice, dressed up as two different judgments.
