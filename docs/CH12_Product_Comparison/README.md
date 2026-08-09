# ⚖️ CH12 — Product Comparison

> **Project:** CartWise  
> **Chapter:** Product Comparison

---

# 👋 Welcome

Chapter 11 allowed users to open a product and understand it individually.

But users often have a different question:

> **"Which one should I buy?"**

That is the purpose of Product Comparison.

CartWise now allows users to select multiple products and evaluate them side-by-side across meaningful attributes.

The journey becomes:

```text
🔍 Search
   ↓
🛍️ Product Details
   ↓
⚖️ Product Comparison
   ↓
🧠 Better Purchase Decision
```

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- How product comparison works.
- How comparison state is managed.
- How products are added and removed from comparison.
- How comparison limits are enforced.
- How comparison sections and rows are generated.
- How differences between products are identified.
- How winner calculations work.
- How comparison verdicts are generated.
- How missing and non-comparable values are handled.
- How cross-category comparison works.
- How localStorage persistence works.
- How responsive comparison layouts are designed.
- How horizontal comparison scrolling works.
- How accessibility is implemented.
- How the comparison architecture is prepared for backend integration.

---

# ⚖️ The Comparison Experience

The complete CartWise journey is now:

```text
Homepage
   │
   ▼
Search
   │
   ▼
Product
   │
   ▼
Product Details
   │
   ▼
Add to Compare
   │
   ▼
Compare Products
   │
   ├── Add Product
   ├── Remove Product
   ├── Differences Only
   ├── Compare Specifications
   ├── Compare Prices
   └── View Verdict
```

---

# 🛒 Adding Products to Comparison

Users can add products to comparison from the existing product experience.

The flow is:

```text
Product Card
      ↓
Compare Action
      ↓
Comparison State
      ↓
Compare Badge
      ↓
Compare Page
```

The navbar can reflect the current comparison count so users know how many products are selected.

---

# 🔢 Comparison Limit

CartWise supports a maximum of:

```text
4 products
```

The selection therefore behaves like:

```text
1 Product
     ↓
2 Products
     ↓
3 Products
     ↓
4 Products
```

Once four products are selected:

- Additional products cannot be added.
- The add-product slot is hidden.
- The comparison remains manageable.

This prevents the comparison interface from becoming excessively dense.

---

# 📊 Compare Page

The Compare page is the central comparison experience.

It contains:

- Selected products
- Product columns
- Add-product control
- Remove actions
- Comparison sections
- Differences Only control
- Verdict
- Empty state

---

# 🧩 Comparison Architecture

The comparison feature follows a feature-first structure:

```text
features/
└── compare/
    ├── components/
    ├── config/
    ├── context/
    ├── hooks/
    ├── utils/
    ├── constants.ts
    ├── services/
    ├── types/
    └── ComparePage.tsx
```

This separates comparison-specific responsibilities from the rest of the application.

---

# 🧱 Comparison Components

Important components include:

```text
CompareEmpty
CompareGrid
CompareProductColumn
CompareToolbar
CompareVerdictCard
ComparisonSection
ProductPicker
```

Each component has a focused responsibility.

---

# 📐 Comparison Grid

The Comparison Grid provides the side-by-side structure.

Conceptually:

```text
                    Product A     Product B     Product C
──────────────────────────────────────────────────────────
Display
Screen Size             ✓             ✓             ✓

Performance
Processor               ✓             ✓             ✓

Battery
Capacity                ✓             ✓             ✓
```

The structure adapts to the available screen width.

---

# 📋 Comparison Sections

Related attributes are grouped together.

Examples:

```text
Overview
Price
Display
Performance
Camera
Battery
Software
Connectivity
Store Prices
```

This prevents the page from becoming one large undifferentiated specification table.

---

# 🔀 Differences Only

A comparison may contain many attributes that are identical.

For example:

```text
Product A → 256 GB
Product B → 256 GB
Product C → 256 GB
```

There is little value in repeatedly displaying that row.

The Differences Only mode removes rows where the selected products have the same value.

Conceptually:

```text
All Comparison Rows
        ↓
Compare Values
        ↓
Remove Identical Rows
        ↓
Meaningful Differences
```

This allows users to focus on what actually matters.

---

# 👑 Winner Indicators

The comparison engine can identify a winner for attributes where a meaningful comparison is possible.

Example:

```text
Battery

Product A → 4500 mAh
Product B → 5000 mAh 👑
Product C → 4800 mAh
```

The winner logic depends on the meaning of the metric.

For example:

```text
Battery Capacity → Higher is better
Rating            → Higher is better
Price             → Lower is better
```

The system should not assume that every numeric value should be maximized.

---

# 🏆 Comparison Verdict

The Comparison Verdict summarizes the overall comparison.

It helps users understand which products perform well across the comparable attributes.

The verdict is not intended to replace the detailed comparison.

Instead:

```text
Detailed Comparison
        +
Winner Information
        +
Verdict
        ↓
Better Decision
```

---

# 🧮 Comparison Metrics

Comparison Metrics provide normalized information to the comparison engine.

They help the system determine:

- Which values are comparable.
- Which direction is better.
- Whether a winner exists.
- How values should be normalized.

This logic is separated from UI components.

---

# 📏 Unit Normalization

Different products can represent the same measurement differently.

For example:

```text
5000 mAh
5 Ah
```

represent the same battery capacity.

The comparison system normalizes values before performing comparisons.

This prevents incorrect winner calculations.

---

# ➖ Missing Values

Not every product contains every specification.

CartWise represents missing or non-applicable values with:

```text
—
```

For example:

```text
Camera
────────────────────
Product A     50 MP
Product B     —
Product C     48 MP
```

The missing value is not treated as an actual numerical value.

---

# 🔀 Cross-Category Comparison

Different categories can contain completely different specifications.

For example:

```text
Smartphone
vs
Laptop
```

Not every specification is meaningful for both products.

CartWise therefore avoids misleading comparisons.

Non-applicable attributes can be represented using:

```text
—
```

or excluded when the comparison logic determines that the attribute is not meaningful.

---

# ➕ Product Picker

The Product Picker allows users to add another product to an existing comparison.

It should:

- Show available products.
- Prevent duplicate selections.
- Disable already-selected products.
- Respect the four-product limit.
- Close correctly after selection.

The picker therefore provides a controlled way to expand a comparison.

---

# 🗑️ Removing Products

Each selected product can be removed independently.

Example:

```text
Product A
Product B
Product C

Remove Product B

        ↓

Product A
Product C
```

The comparison updates immediately.

---

# 🧹 Clear Comparison

Users can clear the entire comparison.

The flow becomes:

```text
Selected Products
      ↓
Clear
      ↓
Empty Compare State
```

---

# 📭 Empty Compare State

When no products are selected, CartWise displays a dedicated Empty Compare state.

Instead of showing an empty or broken page, the user receives a clear explanation and a way to start comparing products again.

---

# 💾 Comparison Persistence

CartWise uses browser persistence so that comparison selections can survive a page reload.

Conceptually:

```text
User Selects Products
        ↓
Comparison State
        ↓
localStorage
        ↓
Browser Reload
        ↓
Restore Selection
```

This improves continuity for users who accidentally refresh the page.

---

# 🛡️ Persistence Guard

The comparison page should not crash if localStorage is unavailable.

The persistence layer is therefore guarded so that the comparison UI can still render even when browser storage cannot be accessed.

---

# 🔄 Navigation

The comparison state should remain consistent when navigating through the application.

For example:

```text
Product
   ↓
Compare
   ↓
Product
   ↓
Back
   ↓
Compare
```

Browser back/forward navigation should not cause the comparison interface to crash or enter an invalid state.

---

# 📱 Responsive Design

Comparison interfaces are naturally wider than normal content because multiple products must appear side-by-side.

CartWise therefore uses responsive behavior instead of shrinking everything until it becomes unreadable.

---

# 📱 Mobile

On narrow screens, the comparison region can use horizontal scrolling.

The important distinction is:

```text
Correct:

Page
└── Comparison Container
    └── Horizontal Scroll
```

rather than:

```text
Incorrect:

Entire Page
└── Horizontal Overflow
```

This keeps the rest of the application within the viewport.

---

# 🖥️ Desktop

On larger screens, the comparison grid can use the available width more efficiently.

The product columns become easier to view side-by-side while maintaining readable specification labels and controls.

---

# 📌 Sticky Specification Labels

When comparison values are horizontally scrolled, specification labels can remain visible where the responsive layout supports sticky positioning.

For example:

```text
RAM | 8 GB | 12 GB | 16 GB
```

The label remains useful while moving between product columns.

---

# ♿ Accessibility

The comparison system includes accessibility-oriented semantics and states.

Examples include:

```text
role="table"
role="row"
role="rowheader"
role="cell"
```

and appropriate ARIA states such as:

```text
aria-expanded
aria-pressed
aria-live
aria-modal
aria-busy
```

Controls should also provide:

- Keyboard access
- Visible focus
- Meaningful labels
- Appropriate interaction states

---

# 🔘 Differences Toggle Accessibility

Differences Only behaves as a toggle.

Its state can therefore be represented through:

```text
aria-pressed
```

Conceptually:

```text
false → Differences Only disabled
true  → Differences Only enabled
```

This communicates the state to assistive technologies.

---

# 🧪 Comparison Verification

The comparison engine was tested independently against the CartWise product catalogue.

The verification covered:

- Three-product comparisons.
- Comparison sections.
- Comparison rows.
- Differing values.
- Winner calculations.
- Unit normalization.
- Winner edge cases.
- Cross-category comparison.
- Four-product rows.
- Unknown product handling.

---

# 🧪 UI Verification

The rendered comparison interface was also checked for:

- Product columns.
- Add-product slot.
- Maximum comparison count.
- Differences Only.
- Product picker.
- Empty state.
- Accessibility semantics.
- Four-product rendering.
- Persistence handling.

---

# 📱 Responsive Verification

The comparison interface was verified across:

```text
320px
375px
390px
414px
480px
768px
1024px
1280px
1536px
1920px
```

The verification checked:

- Horizontal overflow.
- Clipped text.
- Cell overlap.
- Mobile layout.
- Tablet layout.
- Desktop layout.
- Horizontal comparison scrolling.
- Product picker behavior.
- Four-product comparison.
- Sticky comparison elements.

---

# 🛠️ Accessibility Fix

During verification, the product-name links inside comparison columns were found to have a smaller tap target than desired.

The target was increased without changing the surrounding layout.

The fix was then re-verified.

This is an example of why accessibility verification should happen against the actual rendered interface rather than relying only on static code inspection.

---

# 🧪 Engineering Verification

The implementation was verified using:

```bash
npx tsc --noEmit
```

```bash
npx eslint src --max-warnings=0
```

```bash
npm run build
```

Results:

```text
TypeScript → PASS
ESLint     → PASS
Build      → PASS
```

Browser verification also confirmed the major comparison interactions and responsive behavior.

---

# 🏗️ Separation of Responsibilities

The comparison system separates several responsibilities.

```text
Product Data
      ↓
Comparison Configuration
      ↓
Comparison Engine
      ↓
Comparison State
      ↓
Comparison Components
```

This is important because the UI should not be responsible for calculating every comparison result.

---

# 🔌 Backend-ready Architecture

The current implementation uses CartWise's frontend product data.

The architecture is prepared for future backend integration.

Current:

```text
Compare Service
      ↓
Frontend Data
```

Future:

```text
Compare Service
      ↓
REST API
      ↓
Backend
      ↓
Database
```

The UI should remain largely independent from where the data originates.

---

# ⚡ Performance Considerations

The comparison system avoids unnecessary complexity by:

- Reusing existing components.
- Keeping comparison calculations separate.
- Avoiding unnecessary rendering.
- Limiting the number of simultaneously compared products.
- Keeping configuration separate from presentation.

Future optimizations can include:

- API-level caching.
- Product search pagination.
- Lazy loading.
- Memoization where profiling justifies it.

---

# 🌟 Why This Chapter Matters

Chapter 11 answered:

> **"What is this product?"**

Chapter 12 answers:

> **"Which product is better for me?"**

This changes CartWise from a product discovery interface into a decision-support experience.

The user can now move through:

```text
Discover
   ↓
Understand
   ↓
Compare
   ↓
Decide
```

---

# 📈 Future Expansion

The comparison architecture provides a foundation for future capabilities such as:

### Personalized Comparison

```text
What matters to the user?
        ↓
Apply preferences
        ↓
Weighted comparison
```

### AI Comparison

```text
Products
   ↓
Comparison Data
   ↓
AI Analysis
   ↓
Personalized Recommendation
```

### Backend Comparison

```text
Product Database
      ↓
Store Data
      ↓
Comparison API
      ↓
CartWise
```

These capabilities can be introduced without rebuilding the entire comparison UI.

---

# 📌 Key Takeaways

After Chapter 12:

- Users can add products to comparison.
- Comparison supports up to four products.
- Products can be added and removed dynamically.
- Duplicate selections are prevented.
- Comparison sections organize product attributes.
- Differences Only reduces visual noise.
- Winner logic identifies meaningful advantages.
- Verdicts summarize the comparison.
- Unit normalization supports reliable metric comparison.
- Missing values are handled safely.
- Cross-category comparisons avoid misleading results.
- localStorage preserves comparison state.
- Empty and error states provide graceful behavior.
- Responsive comparison uses contained horizontal scrolling.
- Accessibility semantics improve usability.
- Comparison logic is separated from presentation.
- The feature is ready for future backend and AI integration.

---

# 🎯 Chapter Outcome

The CartWise shopping journey now looks like:

```text
🏠 Homepage
     ↓
🔍 Search
     ↓
🛍️ Product Details
     ↓
⚖️ Compare
     ↓
🏆 Better Purchase Decision
```

The foundation is now ready for the next major user feature:

# ❤️ Chapter 13 — Wishlist
