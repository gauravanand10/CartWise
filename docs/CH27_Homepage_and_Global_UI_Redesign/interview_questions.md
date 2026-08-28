# 🎤 CH27 — Interview Questions

> **Project:** CartWise
> **Chapter:** Homepage & Global UI Redesign

---

# 🕵️ The Stale Build

## 1. A previous chapter reported a piece of copy deleted, but it was still visible. How did you actually track that down instead of just re-deleting it and hoping?

### Answer
I didn't trust either claim — the earlier "deleted" report or the assumption that it must still be a code problem. I ran three independent checks in parallel: whether a stale Docker container was shadowing the port (it wasn't — the daemon wasn't even running), whether the source still contained the string (it didn't — only a comment describing its removal), and whether the actual built JavaScript bundle contained it. The bundle did, verbatim. That told me immediately this wasn't a logic bug or an incomplete fix — it was a deployment artifact that had simply never been rebuilt since before the fix landed.

---

## 2. How did you prove the build was actually stale, rather than just asserting it?

### Answer
By comparing timestamps directly. The fix to the component that generates this content landed on the 21st. The bundle being served was built on the 17th — four days before the fix existed. There's no ambiguity in that comparison; a build can't contain a fix that hadn't been written yet. `frontend/dist/` is gitignored, so nothing in version control tracks when it was last regenerated — it just sits there, silently serving whatever was true the last time someone ran the build command.

---

## 3. Why does this matter beyond fixing one banner?

### Answer
Because it means "COMPLETE" reports up to this point were only ever verified against source code and a dev server, neither of which is what a real deployed instance actually serves. That's a real gap in how correctness was being confirmed for this entire project, not just this one component. So the fix wasn't just deleting the stale bundle — it was changing what "verified" is allowed to mean going forward: rebuild from scratch, read the actual output, serve that exact output, and probe it live.

---

## 4. You found a tool that silently gave a wrong answer. What happened, and why is that worse than a tool that errors?

### Answer
I first grepped the built bundle with PowerShell's `Select-String -SimpleMatch` and got zero hits for a string I already had independent reason to believe was in there. It turns out that matcher silently fails on very long lines — and a minified JavaScript bundle is one enormous line. There was no error, no warning — it just reported a clean result that was wrong. That's more dangerous than a tool that crashes, because a crash gets noticed immediately and a false "clean" result doesn't. I switched to reading the entire file as raw text and got the real count: fifteen occurrences. The lesson isn't really about that one command — it's that a negative result from any search tool needs to be trusted only as far as you understand what that tool is actually capable of matching.

---

# 🧹 The Broader Pattern

## 5. The user only mentioned one banner. How did you find the rest of what you removed?

### Answer
By taking the user's framing seriously as a category, not a single bug report — "looks like a copy of a Chinese app" describes a whole aesthetic, not one line of text. So I audited the homepage and its neighboring pages against that aesthetic specifically: saturated competing colors, repeated urgency badges, claims implying live tracking or personalization that don't exist. That's how a green "% off" pill repeated on every product card — which nobody had specifically named — turned out to be the loudest actual instance of the exact pattern the user was describing.

---

## 6. What made the newsletter form different from the other copy problems you found?

### Answer
Every other fabricated claim in this chapter was a false statement — text that implied something untrue. The newsletter form was worse: it was a fake interaction. Its submit handler called `preventDefault()` and did nothing else. A visitor who typed their real email address and clicked Subscribe had every reason to believe they'd signed up for something, and nothing happened — no request was sent, nothing was stored, nothing was ever going to arrive in their inbox. That's not overstated marketing copy, that's a UI element actively misleading someone about a real action they just took. There's no honest way to reword an email capture form that captures nothing — it had to be deleted outright.

---

## 7. You found the same false claim on two different pages. Why does that matter more than just removing it twice?

### Answer
Because it's evidence the underlying claim itself — "price history is tracked" — had been threaded through the app in more than one place, and searching only for a specific component name would have missed the second instance entirely. I found the duplicate on `/browse`'s hero banner by searching for the underlying idea, not the deleted component. It was technically outside this chapter's stated scope, since the instruction was about the homepage — but leaving an identical false claim one click away would have been the exact same failure mode this chapter exists to fix, just relocated. I fixed it and flagged the scope decision explicitly rather than quietly expanding scope without saying so.

---

# 🎨 Design Judgment

## 8. Why keep the top bar at all instead of just deleting it, since it was the most marketplace-coded element on the page?

### Answer
Because what made it look like a marketplace banner was its shape — a full-bleed dark band pinned above everything — not its content. The actual content was already honest: a reference-price disclaimer and a link to how CartWise makes money, both required to stay above the fold for the same disclosure standard established two chapters earlier. Deleting the bar entirely would have pushed that disclosure below the fold on every route, which trades one problem for a worse one. So I restyled the container — light, neutral, a single hairline rule — and left the honest content inside it untouched.

---

## 9. How do you decide what belongs in this chapter's scope versus what's a separate design decision?

### Answer
By asking whether an element is fabricating something or just imperfect. Two categories accidentally sharing the same icon glyph is a real flaw, but it isn't urgency, it isn't a saturated competing color, and it isn't a false claim — fixing it means choosing new icons, which is a design decision with its own tradeoffs, not a restraint pass removing clutter. I named it explicitly rather than either silently fixing it (scope creep without disclosure) or silently ignoring it (an unreported known issue).

---

## 10. Why remove the discount pill entirely instead of just making it smaller or a calmer color?

### Answer
Because the information wasn't unique to the pill — both the original and the discounted price were already printed on the same card, one struck through. The pill wasn't adding a fact, it was adding volume: a saturated color competing for attention on top of a number that was already visible. Muting its color would have kept the redundancy while looking like a compromise. Removing it entirely meant the card states the same fact once, calmly, instead of twice, loudly.

---

# 🧪 Honesty in Reporting

## 11. You mentioned an unreproduced test failure. Why report something you couldn't pin down instead of just re-running until it passed and moving on?

### Answer
Because "it passed nine times after" isn't the same as "it's understood." I ran the suite ten times; one run showed a real failure — one test failed, took noticeably longer than the others — and I didn't capture which test before the next run overwrote the log. I could have just reported the nine clean runs and left it at that, but that would be hiding a real, if rare, signal. Instead I reported it exactly as what it is: an unreproduced flake, not a confirmed defect and not something I've ruled out either. That's a more honest state to hand off than false confidence in either direction.

---

## 12. Looking back, what's the actual lesson from this chapter, beyond the specific bugs fixed?

### Answer
That a chapter can do everything right — write correct code, delete the right things, pass every test — and still ship something false, if the thing being verified isn't the thing a real user actually receives. The gap here wasn't in the code at any point; it was in the distance between "the source is correct" and "the deployed artifact reflects the source." Every verification step from this chapter onward has to close that specific distance, not just check that the logic is sound.
