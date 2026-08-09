# 📖 CH12 — Glossary

> **Project:** CartWise  
> **Chapter:** Product Comparison

This glossary explains the important terms and concepts introduced while building the CartWise Product Comparison system.

---

# ⚖️ Product Comparison

Product Comparison allows users to evaluate multiple products side-by-side.

CartWise compares products across areas such as:

- Price
- Ratings
- Specifications
- Performance
- Camera
- Battery
- Software
- Store offers

The goal is to help users make an informed purchasing decision.

---

# 🛒 Compare Action

The Compare Action allows a user to add a product to the comparison selection.

It is available from product discovery and Product Details experiences.

---

# 📊 Compare Selection

The Compare Selection is the collection of products currently selected by the user for comparison.

Example:

```text
Compare Selection

├── iPhone 16 Pro
├── Galaxy S25 Ultra
└── OnePlus 14
```

---

# 🔢 Comparison Limit

The Comparison Limit defines the maximum number of products that can be compared at the same time.

CartWise supports a maximum of **4 products** in one comparison.

---

# 🧩 Compare Product Column

A Compare Product Column represents one selected product inside the comparison layout.

It contains product-specific information such as:

- Product image
- Product name
- Brand
- Price
- Rating
- Remove action

Each selected product receives its own column.

---

# 📐 Comparison Grid

The Comparison Grid provides the main side-by-side structure used to compare products.

Conceptually:

```text
              Product A     Product B     Product C
Specification     ✓             ✓             ✓
Specification     ✓             ✓             ✓
Specification     ✓             ✓             ✓
```

The grid adapts between mobile and desktop layouts.

---

# 📋 Comparison Section

A Comparison Section groups related comparison rows.

Examples include:

- Overview
- Price
- Display
- Performance
- Camera
- Battery
- Software
- Connectivity
- Store Prices

Grouping keeps a large comparison readable.

---

# 🏷️ Comparison Row

A Comparison Row represents one attribute being compared across products.

Example:

```text
RAM
────────────────────────────
8 GB     12 GB     16 GB
```

The same attribute is displayed against every selected product.

---

# 🔀 Differences Only

Differences Only is a comparison mode that hides rows where all selected products have the same value.

Example:

```text
All Products
     ↓
Differences Only
     ↓
Only meaningful differences remain
```

This allows users to focus on the attributes that actually distinguish the products.

---

# 👑 Winner

A Winner identifies the product that performs better for a comparable specification when the comparison logic can determine a meaningful winner.

Example:

```text
Battery
────────────────────
Product A     4500 mAh
Product B     5000 mAh 👑
Product C     4800 mAh
```

Winner indicators are only shown when the comparison data supports a meaningful comparison.

---

# 🏆 Verdict

The Comparison Verdict summarizes the overall comparison.

It can identify products that perform well across the comparable attributes.

The verdict should complement the raw comparison rather than replacing it.

---

# 📈 Comparison Metrics

Comparison Metrics are normalized values used to evaluate products consistently.

They allow different product attributes to be compared without directly coupling the comparison logic to UI components.

---

# 🔢 Unit Normalization

Unit Normalization converts values into a consistent representation before comparison.

For example, values using different units can be normalized before determining which product has the better specification.

This prevents incorrect comparisons caused by different representations of the same measurement.

---

# 🧮 Comparison Logic

Comparison Logic determines how products are evaluated against each other.

It can handle:

- Numeric values
- Ratings
- Prices
- Specifications
- Comparable attributes
- Non-comparable attributes

The logic is kept separate from presentation components.

---

# 🏪 Store Price Comparison

Store Price Comparison compares retailer offers for the selected products.

Example:

```text
Product A
Amazon       ₹129,999
Flipkart     ₹131,499

Product B
Amazon       ₹119,999
Flipkart     ₹121,999
```

This allows users to consider both the product and its current purchasing price.

---

# ➖ Placeholder Value

A placeholder value is displayed when a product does not have a comparable value for a specific attribute.

CartWise uses:

```text
—
```

to represent unavailable or non-applicable comparison values.

This prevents missing information from being mistaken for an actual value.

---

# 🔄 Cross-Category Comparison

Cross-category comparison occurs when products from different categories are compared.

For example:

```text
Smartphone
vs
Laptop
```

Not every specification is meaningful across categories.

CartWise therefore excludes or represents non-applicable categories appropriately rather than producing misleading comparisons.

---

# 🧹 Duplicate Product

A Duplicate Product is a product that has already been selected for comparison.

CartWise prevents the same product from being added multiple times to the same comparison.

---

# 🧰 Product Picker

The Product Picker allows users to add another product to an existing comparison.

It displays products that can be selected while preventing already-selected products from being added again.

---

# 🚫 Disabled Product

A product can become unavailable for selection when it is already part of the comparison.

The picker disables or excludes such products to prevent duplicates.

---

# ➕ Add Product Slot

The Add Product Slot allows users to add another product to the comparison.

It is available while the comparison has not reached its maximum product count.

Once four products are selected, the slot is removed.

---

# 🗑️ Remove Product

The Remove Product action removes one selected product from the comparison.

The comparison updates immediately after removal.

---

# 🧹 Clear Comparison

Clear Comparison removes all selected products.

The application then returns to the Empty Compare state.

---

# 📭 Empty Compare State

The Empty Compare State is displayed when there are no products selected for comparison.

It provides users with a way to begin the comparison process again.

Example:

```text
Nothing to compare yet

[Start Comparing]
```

---

# 💾 localStorage Persistence

`localStorage` allows the selected comparison products to persist across browser reloads.

Conceptually:

```text
Select Products
      ↓
localStorage
      ↓
Browser Reload
      ↓
Restore Selection
```

This prevents users from losing their comparison after refreshing the page.

---

# 🔄 Comparison State

Comparison State represents the current selected products and related comparison information.

It includes information such as:

- Selected products
- Product count
- Comparison state
- Persistence state

---

# 🧠 Compare Provider

The Compare Provider supplies comparison state to components that need access to it.

This allows multiple parts of the application to work with the same comparison selection without manually passing the state through every component.

---

# 🪝 useCompareSelection

`useCompareSelection` is a custom hook responsible for comparison selection behavior.

It handles operations such as:

- Adding products
- Removing products
- Clearing products
- Checking selected products
- Managing selection limits

---

# 🪝 useComparison

`useComparison` handles derived comparison information.

It can provide:

- Comparison rows
- Differences
- Winners
- Verdict information
- Comparison sections

This separates comparison calculations from UI rendering.

---

# 🧱 Comparison Configuration

Comparison Configuration defines how comparison sections and attributes should be organized.

Instead of hardcoding every comparison row directly into the page, the configuration describes the structure used by the comparison engine.

---

# 🔧 Comparison Utility

Comparison utilities contain reusable logic used to construct and calculate comparison data.

Examples include:

```text
buildComparison
metrics
```

These utilities keep business logic outside presentation components.

---

# 🏗️ Feature-first Architecture

The Product Comparison system follows CartWise's Feature-first Architecture.

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

This keeps comparison-specific functionality isolated and maintainable.

---

# 🔌 Compare Service

The Compare Service separates comparison-related data operations from UI components.

This creates a clean boundary for future backend integration.

---

# 📱 Responsive Comparison

Responsive Comparison ensures the comparison experience works across:

- Mobile
- Tablet
- Desktop
- Large desktop

On smaller screens, the comparison content can use horizontal scrolling while the page itself remains within the viewport.

---

# ↔️ Horizontal Comparison Scrolling

When the comparison contains more columns than the viewport can display, the comparison grid can scroll horizontally.

This allows users to compare multiple products without creating horizontal overflow on the entire page.

---

# 📌 Sticky Specification Label

The specification label identifies the attribute being compared.

Example:

```text
RAM | 8 GB | 12 GB | 16 GB
```

On supported layouts, the label column is intended to remain visible while comparison values move horizontally.

---

# ♿ Accessible Comparison

The comparison interface uses accessible semantics and controls.

Important concepts include:

- Accessible buttons
- Keyboard navigation
- Focus states
- `aria-pressed`
- `aria-expanded`
- `aria-live`
- Table-like roles
- Accessible modal controls

---

# 📊 Comparison Table Semantics

The comparison interface exposes semantic relationships between:

```text
Table
├── Row
├── Row Header
└── Cell
```

This allows assistive technologies to understand the comparison structure.

---

# 🔘 aria-pressed

`aria-pressed` communicates the current state of toggle-style controls.

CartWise uses it for interactions such as the Differences Only mode.

Example:

```text
false → Differences disabled
true  → Differences enabled
```

---

# 📂 aria-expanded

`aria-expanded` communicates whether an expandable section is currently open or closed.

This is useful for comparison sections and other collapsible content.

---

# 🔔 aria-live

`aria-live` allows dynamic updates to be announced to assistive technologies.

It is useful when comparison results change after an action.

---

# 🧪 Responsive Verification

Responsive Verification confirms that the comparison interface behaves correctly at different viewport sizes.

The CH12 implementation was verified across:

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

The final verification reported:

- No horizontal page overflow
- No clipped text
- No cell overlap
- Mobile comparison layout works
- Horizontal comparison scrolling works
- Four-product layout works

---

# 🧪 Comparison Verification

The comparison logic was verified against the CartWise product catalogue.

The verification covered:

- Multiple products
- Comparison sections
- Comparison rows
- Differing values
- Winner calculations
- Unit normalization
- Cross-category comparison
- Four-product comparison
- Unknown product handling

---

# 🛠️ Accessibility Fix

During final browser verification, Product Comparison product-name links were found to have a 19px target height.

They were adjusted to provide a 27px target without changing the surrounding layout.

This improved accessibility while preserving the existing visual design.

---

# 🧠 Backend-ready Comparison

The current comparison implementation works with frontend product data.

The architecture is designed so future backend/API data can replace local data without requiring a complete rewrite of the comparison UI.

---

# 📌 Summary

The Product Comparison system transforms individual Product Details into a side-by-side decision experience.

It combines:

```text
Product Selection
       ↓
Comparison State
       ↓
Comparison Engine
       ↓
Comparison Grid
       ↓
Differences
       ↓
Winner / Verdict
```

The architecture keeps state, comparison logic, configuration, and presentation separated so that CartWise can scale the comparison system in future chapters.
