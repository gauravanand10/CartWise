# 🎤 CH26 — Interview Questions

> **Project:** CartWise
> **Chapter:** Monetization — Affiliate Purchase Path

---

# 💰 The Business Model

## 1. CartWise doesn't sell anything. How does it actually make money?

### Answer
Through affiliate marketing. Every "Visit store" button redirects through a CartWise-controlled endpoint that appends a retailer-specific affiliate tag before sending the reader on to the retailer's real site. If they buy something there, CartWise earns a commission from the retailer — not from the reader, and not through any transaction CartWise itself handles. CartWise never touches payment, inventory, or fulfillment; the entire purchase happens off-platform.

---

## 2. Why does the affiliate tag get added by the backend instead of just being baked into the link in the frontend?

### Answer
Two reasons. First, the tag is a credential — putting it in frontend source means it ships to every browser that loads the page, which is unnecessary exposure for something that should live in server-side configuration. Second, it decouples the tag from a deploy: swapping a placeholder tag for a real, approved one is an environment variable change, not a code change or a redeploy of frontend assets. A test proves this directly — constructing the service with a real-looking tag instead of the placeholder flips the URL and the reported status with zero production code differing between the two.

---

# 🔍 Research and Constraints

## 3. What did you find out about actually getting approved for these affiliate programs?

### Answer
It varies a lot by retailer, and none of it is instant. Amazon Associates is self-serve to apply but discretionary to approve — you get 180 days to refer three qualifying sales or the application can be withdrawn. Flipkart's direct affiliate signup has been closed since 2018 and never reopened; it's only reachable through third-party affiliate networks now. The other three retailers (Croma, Reliance Digital, Vijay Sales) don't have a documented first-party affiliate program at all — only network-mediated options exist, with no published URL parameter to build against. Rather than guess a parameter for those three, it ships empty.

---

## 4. If no real, approved account exists, how do you build and test a system that depends on one?

### Answer
By building the credential itself as configuration rather than as a hardcoded value, and testing that the code path is identical whether the configured tag is real or a placeholder. The system runs today with an obvious placeholder tag (`cartwise-test-00`) that identifies nobody, and the disclosure page reports it honestly as `PLACEHOLDER` rather than pretending it's live. When a real tag exists, nothing in the code needs to change — only the environment variable does.

---

# ⚖️ Legal and Disclosure

## 5. Why does affiliate disclosure matter here, technically and not just legally?

### Answer
Because a "Visit store" button on a comparison site implies neutrality — the reader assumes CartWise recommended this retailer because it's a good option, not because CartWise gets paid if they click it. Regulators (the FTC in the US, and equivalent bodies elsewhere) require that kind of financial interest be disclosed clearly and conspicuously, not buried. So this isn't a compliance checkbox bolted on afterward — it shapes where the disclosure lives (always visible above the offers, not a tooltip) and what it's allowed to say.

---

## 6. You mentioned a bug where the disclosure page lied. What happened?

### Answer
The first version tracked whether a retailer's link was "affiliate" as a boolean. With the placeholder tag configured for every retailer, that boolean read true across the board, and the disclosure page rendered "Yes, this is a paid affiliate link" for retailers that were, in reality, earning nothing — because no real account existed yet. That's a false statement about an actual commercial relationship, on the one page whose entire purpose is telling the reader the truth about that relationship. It was replaced with a three-state status — `PAID`, `PLACEHOLDER`, `NONE` — so the page can only say what's actually true.

---

# 🗄️ Data Model

## 7. Why do product deletions cascade into click records, but user deletions don't?

### Answer
Because they answer different questions. A click record exists to say "this product was clicked, from this retailer, at this time" — if the product itself is gone, that record has lost its subject and cascading its deletion is correct. A user deletion is different: the referral event still happened regardless of who triggered it, and anonymising the record (setting `user_id` to null) preserves that history without keeping anything personally identifying. Deleting the whole click just because a user account was deleted would erase real business history for no good reason.

---

## 8. What's deliberately *not* stored in a click record, and why?

### Answer
IP address, user agent, referrer, and request body are all deliberately excluded. The record only needs a product, a retailer, an optional user, and a timestamp to answer every question this chapter's analytics actually asks — attribution and volume. Storing more than that would be collecting personal data without a real use for it, which is its own liability, not a feature.

---

## 9. How did you confirm a migration wouldn't orphan existing wishlist or click data?

### Answer
By proving it on a scratch database rather than reasoning about it. I migrated a throwaway database up to the version right before the change, inserted real wishlist, comparison, and click rows against the specific products the new migration would touch, applied the migration, and then checked for orphaned foreign keys across all three tables. Zero orphans, confirmed by query, not assumed from reading the SQL.

---

# 🛒 Catalogue

## 10. The catalogue grew from 23 to 100 products. Why additive instead of replacing the old data?

### Answer
Because replacing it would risk renumbering or deleting IDs that other tables already reference — wishlist entries, comparison rows, click records. An additive migration leaves IDs 1 through 50 untouched and only adds new rows above that, so nothing that already pointed at an existing product silently breaks.

---

## 11. You found that most product detail pages were 404ing. What was actually going on?

### Answer
The database had 100 real products, but the product detail page was reading from a static local file that only ever had 23 records in it — a fork that traced all the way back to the project's very first schema migration, which literally said in its own comment that the database was "mirrored from the frontend catalogue." Nobody had kept the local file in sync as the database grew, first to 50 products and then to 100, so the gap widened silently over multiple chapters until 78 of 100 products couldn't be viewed at all. The fix was to delete the local file and make the detail page read the real API like every other page already did.

---

## 12. Why didn't you just fill in the missing product specs the same way?

### Answer
Because the two problems aren't actually the same shape. The detail-page fork had a real source of truth to switch to — the database already had the 100 real products, just not being read. Structured specs (screen size, RAM, processor) never existed as real columns in the database at all — only name, brand, price, and rating did. Filling that gap with invented per-product numbers would be fabricating data, which this chapter explicitly refuses to do elsewhere. So it's documented as a known, deliberate gap — a category-level template covers all 100 products with reasonable defaults, and 23 of them additionally carry real, individually researched values — rather than silently faked as if it were solved.

---

# 🎨 Design

## 13. What's the actual design decision behind using only one accent color?

### Answer
Restraint. If every button, badge, and highlight uses its own color, none of them read as more important than another — the reader has to work to figure out what to click. A single accent used only for primary actions and active states means the eye is drawn exactly where it should be, and everything else can recede into a calm neutral palette. It was audited after the fact by counting every filled-accent occurrence in the codebase and checking each one was a genuine primary action, not decoration.

---

## 14. How did you verify color contrast instead of just eyeballing it?

### Answer
By computing real contrast ratios from relative luminance for every text/background pairing actually used — accent-on-canvas, white-on-accent, error and success states, and so on — and checking each against the WCAG AA threshold of 4.5:1 for text. One token came in below that threshold and was deliberately restricted to non-text use only, documented in code rather than left as an implicit assumption someone could violate later without noticing.

---

## 15. Tell me about the `.inline-block` bug. How did you find the actual root cause?

### Answer
A comparison-page button was rendering far narrower than its own content — visibly broken, but the cause wasn't obvious. Measuring rather than guessing was what cracked it: the element's shrink-to-fit width was smaller than its computed `min-content` width, which is mathematically impossible unless something else is explicitly setting a fixed width. Dumping the actual stylesheet rules for `.inline-block` showed two competing definitions — Tailwind's own display utility, and a second rule generated by a custom spacing token whose name happened to collide with it. The custom one was declared later in the cascade and won, silently pinning every `inline-block` element in the entire application to a fixed width. It also explained an earlier, previously-unresolved layout workaround elsewhere in the app — same root cause, different symptom. The token was removed entirely once nothing was found to depend on it.

---

# 🚫 Fabricated Content

## 16. What made you go looking for fabricated content beyond just the affiliate links?

### Answer
Once "Visit store" links became real, the site started actually resembling a retailer — and a few other things nearby stopped feeling like harmless placeholder content and started feeling like actual false claims sitting next to real money. An "AI score" implying a model that doesn't exist, a "price dropped in the last 90 days" implying tracked history that isn't recorded anywhere, a delivery date computed as "today plus two days" with nothing behind it — these are the same category of problem as an undisclosed affiliate link, just less regulated. Once the standard was "don't state something as fact unless it's real," it was inconsistent to apply it only to affiliate disclosure and not to the rest of the page.

---

## 17. Fabricated reviews specifically — why treat that as more serious than the others?

### Answer
Because fake customer reviews aren't just a style problem, they're a recognized deceptive practice under consumer protection law in multiple jurisdictions — the same general regulatory territory as affiliate disclosure, just a different specific rule. A fabricated "4.8 stars, 230 reviews" implies real people said real things, which is a much more concrete and checkable lie than a vague marketing badge. It was removed and replaced with a short, honestly labelled note generated only from real catalogue figures (rating and price), explicitly stating it isn't a customer review.

---

## 18. When you removed a fabricated claim, what determined whether you replaced it with something or just deleted it?

### Answer
Whether there was a true, useful statement available to put there. Fake delivery dates and fake financing terms got replaced with something real and useful — that delivery and payment terms are set by the retailer, not CartWise, with a link to the disclosure page. Fake AI scores and fake recently-viewed history didn't have a true equivalent to substitute — there's no real recommendation model and no view history recorded — so those sections were removed outright rather than replaced with something equally hollow.

---

# 🧪 Verification Discipline

## 19. You found a test-count discrepancy at one point. What was it, and how did you resolve it?

### Answer
Two different ways of counting the same test suite gave two different numbers — 390 versus 393. The lower number came from summing the `tests=` attribute across Surefire's XML reports, but that attribute de-duplicates by bare method name, so a test method appearing in two different `@Nested` classes with the same name only got counted once. Counting the actual `<testcase>` elements gave the real number, 393. The lesson wasn't really about the count — it was that my own verification script had a bug, and I didn't assume either number was right until I found the actual cause of the mismatch.

---

## 20. Was there a moment where a test run passed but shouldn't have been trusted?

### Answer
Yes — a full backend test run reported `BUILD SUCCESS` while Docker wasn't running, which silently skipped 26 Testcontainers-backed repository tests rather than failing. A build that skips a quarter of its integration tests looks identical, from the console output, to one that ran everything and passed. Restarting Docker and re-running was the only way to know the real result. It's the same category of risk as `Skipped: 0` being called out as meaningful in earlier chapters — a green result isn't trustworthy unless you know what it actually covered.
