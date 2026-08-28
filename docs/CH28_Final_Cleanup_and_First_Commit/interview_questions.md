# 🎤 CH28 — Interview Questions

> **Project:** CartWise
> **Chapter:** Final Cleanup & First Commit

---

# ⭐ storeRating

## 1. This was flagged in an earlier chapter and just... didn't get fixed. How did that happen, and how did you catch it?

### Answer
It was named explicitly as a known gap in one chapter's report, but the next chapter's cleanup swept a lot of similar issues and this one simply wasn't on its list — not because it was judged acceptable, just overlooked in the handoff between chapters. I caught it by treating every prior chapter's "deferred" list as something to actively re-check, not as a closed record. Before starting this chapter's own work, I went back and confirmed the status of everything previously flagged rather than assuming it had been handled just because time had passed.

---

## 2. What's the actual argument for why a hardcoded retailer rating is a problem, beyond "it's not real data"?

### Answer
The clearest evidence was watching it happen to a specific case: a retailer the system had never encountered before, appearing for the first time because a real API response mentioned it, was immediately assigned a 4.0-out-of-5 rating it had done nothing to earn. That's not an edge case exposing the flaw — that's the normal operation of a fallback value, and it shows exactly why a fabricated number is worse than no number at all: it looks like information right up until you check where it came from.

---

# 💯 The Discount Row

## 3. Why treat the "Discount" row in the comparison table differently from the discount pill on the product page?

### Answer
Because they're not actually the same kind of problem. The pill was pure display — both prices were already shown elsewhere, so removing it just quieted the page without losing information. The comparison table's Discount row was a live input to the function that decides which product gets labeled "Best overall." Removing it doesn't just change what's printed on screen, it changes what the algorithm computes. Treating that as equivalent to a cosmetic fix would have been the wrong level of caution for what was actually a behavior change to a real feature.

---

## 4. How did you avoid drawing the wrong conclusion from a small number of examples?

### Answer
I started with three hand-picked product comparisons, and the verdict didn't change in any of them. That result was tempting to accept and move on, but three examples all agreeing is exactly the situation that should make you suspicious of your own sample, not confident in it — either the change genuinely doesn't matter, or I'd accidentally picked three cases that happened to land in whatever fraction doesn't change. So instead of stopping there, I swept every same-category four-product comparison the real catalogue could produce — over twelve thousand of them — and found that about 1.8% actually flip. The three hand-picked examples weren't wrong, they were just unrepresentative, and I wouldn't have known that without checking the full space.

---

## 5. What did that sweep actually turn up, beyond answering the original question?

### Answer
The original question — does the verdict ever change — was answered quickly and was almost the least interesting part of what I found. Looking at why some sets flipped led to measuring what the "Best overall" verdict actually correlates with across every comparison in the catalogue, and it turned out to agree with the cheapest product 83.7% of the time, and with the best-rated product only 8.5% of the time — barely better than chance. The mechanism is that the same underlying fact — who's cheapest — gets counted as a separate "win" seven different times across different rows, so a cheap product can bank most of its wins before a single spec or rating is ever compared.

---

## 6. You found a real product example — a highly-rated headphone losing to a cheaper, lower-rated one. Walk through why that happens.

### Answer
In that comparison, the higher-rated product won exactly one row — its own rating. The cheaper competitor won nine, because five of those wins were the same five retailers all reporting the same underlying price advantage, and two more were "Current price" and "Best store price" restating that same fact again. So a single real advantage — being cheaper — gets amplified into what looks like overwhelming, multi-dimensional superiority, while a real, meaningful advantage — being rated nearly a full point higher — barely registers as one vote out of many. The system isn't lying about any individual fact, but the way those facts are weighted produces a conclusion that doesn't reflect what a shopper would actually consider "best."

---

## 7. You also found that ties get resolved silently. Why does that matter if the underlying numbers are at least real?

### Answer
Because the user never sees that a tie happened — they see a confident "Best overall" badge on one specific product, with nothing indicating the decision was actually a coin flip resolved by which product happened to be added to the comparison first. That's a different kind of honesty problem than a fabricated number: every individual fact feeding into it can be completely real, and the presentation can still overstate how decisive the conclusion actually is. 270 of the roughly 12,600 real comparisons I checked hit this today.

---

## 8. Why didn't you just fix the ranking algorithm once you found this?

### Answer
Because reweighting a recommendation algorithm is a real product decision with real tradeoffs — how much price should matter relative to rating, whether all five retailers deserve individual weight or should count as one signal, how ties should be surfaced to the user — and none of that was what this chapter was asked to do. I was verifying a specific, narrow claim about one row's removal. Finding a bigger problem while checking a smaller one doesn't turn "verify this" into implicit permission to redesign the thing you're verifying. I measured it precisely, explained the mechanism, and reported it as a decision that needs to be made deliberately, not folded into a cleanup chapter as a side effect.

---

# 🌿 Git and the First Commit

## 9. Three chapters of work had piled up uncommitted. What could have gone wrong if you'd just pushed it?

### Answer
Checking `git status` before doing anything revealed the remote had moved on without me — four commits ahead, all of them the project owner's own manually-written documentation added directly through GitHub. A plain push would have been rejected outright as a non-fast-forward. The more dangerous failure mode would have been reacting to that rejection carelessly — force-pushing, or resolving it in a way that overwrote those four commits with whatever was in my working tree. That's exactly the kind of mistake this project has a standing rule against: documentation the owner writes by hand must never be silently replaced by generated content.

---

## 10. How did you make sure that didn't happen?

### Answer
Two layers. First, before touching git at all, I confirmed there was zero file overlap between the four incoming commits and my own 117 changed paths — different files entirely, which meant a clean rebase was actually safe rather than just convenient. Second, after committing and rebasing, I verified the outcome four separate ways rather than trusting any single check: an empty `git status` for the docs path, a pathspec-excluded `git add` that structurally couldn't touch docs even by accident, an empty staged diff for that path, and a direct listing of what files the final commit actually contained. Only after all four agreed did I push.

---

## 11. Why does it matter that this ended up being one large commit spanning several chapters, instead of one per chapter?

### Answer
It's not a technical problem, but it costs something: the project's own established pattern up to this point was one commit per chapter, which makes the git history itself a readable record of how the project was built, chapter by chapter. Batching several chapters of work into a single commit because it had gone uncommitted for a while means that history is gone for this stretch — anyone reading the log later can't tell which change belonged to which chapter's stated goal. It's not something I could fix retroactively without rewriting history that shouldn't be touched, so the right response was just to name the cost and commit per chapter going forward instead of letting it happen again.
