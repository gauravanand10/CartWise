# 🎯 CH12 — Interview Questions

> **Project:** CartWise  
> **Chapter:** Product Comparison
>
> This chapter covers the architecture, state management, comparison engine, responsive comparison UI, accessibility, persistence, and verification of the CartWise Product Comparison system.

---

# 📚 Beginner Level

## Q1. What is product comparison?

### Answer

Product comparison allows users to evaluate multiple products side-by-side.

Instead of opening products individually, users can see important differences in one place.

CartWise compares areas such as:

- Price
- Rating
- Display
- Performance
- Camera
- Battery
- Software
- Store offers

The purpose is to help users make a better purchasing decision.

---

## Q2. Why does CartWise need a comparison feature?

### Answer

The Product Details page allows users to understand one product.

However, users often want to answer:

> "Which product should I actually buy?"

Comparison provides that decision layer.

The flow becomes:

```text
Search
  ↓
Product Details
  ↓
Compare
  ↓
Purchase Decision
```

---

## Q3. How many products can CartWise compare at once?

### Answer

CartWise supports a maximum of **4 products** in one comparison.

This provides enough flexibility for meaningful comparison while preventing the interface from becoming unnecessarily difficult to use.

---

## Q4. What is a comparison row?

### Answer

A comparison row represents one attribute across the selected products.

Example:

```text
RAM
────────────────────────────
8 GB     12 GB     16 GB
```

The same attribute is evaluated for every selected product.

---

## Q5. What is a comparison section?

### Answer

A comparison section groups related comparison rows.

For example:

```text
Display
├── Screen Size
├── Resolution
└── Refresh Rate
```

Other sections can include:

- Performance
- Camera
- Battery
- Software
- Connectivity
- Store Prices

This makes the comparison easier to scan.

---

## Q6. What is the Differences Only feature?

### Answer

Differences Only hides rows where the selected products have the same value.

For example:

```text
All rows:
Display
Processor
RAM
Connectivity
Battery

Differences Only:
Display
RAM
Battery
```

This lets users focus on meaningful differences.

---

## Q7. Why is Differences Only useful?

### Answer

A comparison can contain many specifications.

Some specifications may be identical across all products.

Showing every identical value creates visual noise.

Differences Only reduces that noise and lets users focus on the attributes that actually distinguish the products.

---

## Q8. What is a comparison winner?

### Answer

A comparison winner is the product that performs better for a specific comparable attribute.

For example:

```text
Battery

Product A → 4500 mAh
Product B → 5000 mAh 👑
Product C → 4800 mAh
```

Product B can be identified as the winner when the comparison rule supports that conclusion.

---

## Q9. What is a comparison verdict?

### Answer

The verdict provides a higher-level summary of the comparison.

It helps users understand which products perform well across the available comparable attributes.

The verdict should complement the detailed comparison rather than hide it.

---

## Q10. Why should duplicate products be prevented?

### Answer

Adding the same product multiple times would make the comparison meaningless.

For example:

```text
iPhone 16 Pro
iPhone 16 Pro
Galaxy S25 Ultra
```

The comparison picker therefore prevents already-selected products from being added again.

---

# 🚀 Intermediate Level

## Q11. Why should comparison state be shared across components?

### Answer

Multiple parts of the application need access to the comparison selection.

For example:

```text
Product Card
     ↓
Compare Action
     ↓
Compare State
     ↓
Navbar Badge
     ↓
Compare Page
```

If every component maintained its own comparison state, they could become inconsistent.

A shared comparison state provides a single source of truth.

---

## Q12. Why does CartWise use a Compare Provider?

### Answer

The Compare Provider exposes comparison state to components throughout the relevant application tree.

It allows components to access common operations such as:

- Add product
- Remove product
- Clear products
- Check selection
- Read product count

This avoids passing comparison state through many unrelated component levels.

---

## Q13. What is the purpose of `useCompareSelection`?

### Answer

`useCompareSelection` handles selection-related behavior.

Conceptually:

```text
useCompareSelection
├── addProduct()
├── removeProduct()
├── clearProducts()
├── isSelected()
└── selection limit
```

This keeps selection logic separate from the UI.

---

## Q14. What is the purpose of `useComparison`?

### Answer

`useComparison` handles derived comparison information.

It can provide:

- Comparison sections
- Comparison rows
- Differences
- Winners
- Verdict information

This means the UI does not need to calculate comparison results itself.

---

## Q15. Why should comparison logic be separated from presentation?

### Answer

If comparison calculations are placed directly inside UI components, those components become difficult to maintain.

A better architecture is:

```text
Product Data
     ↓
Comparison Logic
     ↓
Comparison Result
     ↓
UI
```

This makes the comparison engine reusable and easier to test.

---

## Q16. What is unit normalization?

### Answer

Unit normalization converts values into a consistent representation before comparison.

For example, two values may represent the same measurement using different units.

The comparison engine should normalize them before deciding which value is greater or smaller.

This prevents incorrect winner calculations.

---

## Q17. Why is unit normalization important?

### Answer

Without normalization, the comparison engine may compare incompatible representations.

For example:

```text
Product A → 5,000 mAh
Product B → 5 Ah
```

These values represent the same capacity.

The comparison engine must normalize them before comparison.

---

## Q18. How does CartWise handle unavailable specifications?

### Answer

If a product does not have a value for a particular comparison attribute, CartWise uses:

```text
—
```

instead of inventing a value.

This makes missing or non-applicable information explicit.

---

## Q19. How does CartWise handle products from different categories?

### Answer

Not every specification is meaningful across different product categories.

For example:

```text
Smartphone
vs
Laptop
```

A camera specification may be meaningful for one category but not necessarily for the other.

The comparison system therefore avoids presenting misleading comparisons and uses placeholders where appropriate.

---

## Q20. Why should store offers be part of comparison?

### Answer

CartWise is a price-comparison application.

A product's value depends not only on its specifications but also on where it can be purchased and at what price.

Therefore comparison can include:

- Store
- Price
- Availability
- Delivery

This connects product evaluation with the actual purchasing decision.

---

# 🔥 Advanced Level

## Q21. How would you design a scalable comparison architecture?

### Answer

A scalable architecture can be separated into:

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

Each layer has a separate responsibility.

### Product Data

Contains the actual product information.

### Configuration

Defines what should be compared.

### Comparison Engine

Calculates rows, differences, winners, and verdicts.

### Comparison State

Tracks selected products.

### Components

Render the results.

This separation makes future changes easier.

---

## Q22. Why use configuration for comparison sections?

### Answer

Hardcoding every row directly inside the page makes the comparison difficult to extend.

Instead, configuration can describe sections and attributes.

Conceptually:

```text
sections
├── Display
├── Performance
├── Camera
├── Battery
└── Software
```

A new comparison attribute can then be added through configuration instead of rewriting the entire page.

---

## Q23. How does Differences Only work internally?

### Answer

The comparison engine first constructs the complete comparison result.

Then each row is evaluated.

Conceptually:

```text
All Comparison Rows
        ↓
Check values across products
        ↓
Are all values equal?
     /       \
   Yes        No
   ↓          ↓
 Hide        Keep
```

This keeps filtering logic separate from rendering.

---

## Q24. How should winner calculation work?

### Answer

Winner calculation should depend on the meaning of the metric.

For example:

```text
Battery Capacity
→ Higher is generally better

Price
→ Lower is generally better

Rating
→ Higher is generally better
```

The comparison configuration or metric logic should therefore define the comparison direction rather than assuming that every numeric value should be maximized.

---

## Q25. Why can't every specification have a winner?

### Answer

Some attributes are not meaningfully better or worse.

For example:

```text
Color → Black / Blue / Silver
```

There is no objectively better color.

Similarly, some specifications may not have enough information to determine a meaningful winner.

Winner indicators should therefore only appear when the comparison logic supports them.

---

## Q26. How would you test comparison logic independently of React?

### Answer

The comparison engine should be implemented as pure or mostly pure logic.

Then it can be tested with product data without rendering the UI.

Example:

```text
Input:
Product A
Product B
Product C

        ↓

Comparison Engine

        ↓

Sections
Rows
Differences
Winners
Verdict
```

This makes logic testing faster and more reliable.

---

## Q27. What happens when an unknown product slug is provided?

### Answer

The comparison system should not crash.

The lookup should resolve to:

```text
null
```

or an equivalent missing-product result.

The UI can then handle the invalid product gracefully.

---

## Q28. Why should localStorage be used for comparison persistence?

### Answer

Users may select products and then accidentally refresh the page.

Without persistence:

```text
Select Products
      ↓
Reload
      ↓
Selection Lost
```

With localStorage:

```text
Select Products
      ↓
Save Selection
      ↓
Reload
      ↓
Restore Selection
```

This improves the user experience.

---

## Q29. What should happen if localStorage is unavailable?

### Answer

The application should fail gracefully.

The comparison page should still render rather than crashing.

The persistence layer should therefore be guarded against unavailable storage.

This is especially important in:

- Restricted browser environments
- Private browsing scenarios
- Testing environments
- Server-rendered environments

---

## Q30. Why should the comparison page not depend entirely on localStorage?

### Answer

localStorage is only a persistence mechanism.

The actual comparison state should remain application state.

A good architecture is:

```text
Comparison State
      ↓
Persistence Layer
      ↓
localStorage
```

not:

```text
UI
 ↓
localStorage directly
```

This keeps the application easier to test and replace later.

---

# 📱 Responsive Design

## Q31. How should a comparison table behave on mobile?

### Answer

A desktop comparison layout may contain several product columns.

On mobile, displaying all columns simultaneously can make each column too narrow.

A better approach is to use:

- Horizontal comparison scrolling
- Responsive grid behavior
- Sticky specification labels where appropriate
- Usable touch targets

The page itself should not develop unwanted horizontal overflow.

---

## Q32. Why use horizontal scrolling for comparison?

### Answer

A side-by-side comparison naturally requires horizontal space.

Instead of shrinking every product column until the content becomes unreadable, the comparison region can scroll horizontally.

This preserves readability.

---

## Q33. What is the difference between page overflow and comparison overflow?

### Answer

The comparison region may legitimately need horizontal scrolling.

However, the entire webpage should not accidentally become wider than the viewport.

Correct:

```text
Page
 └── Comparison Container → horizontal scroll
```

Incorrect:

```text
Entire Page → horizontal overflow
```

The scrolling should therefore be intentionally contained inside the comparison area.

---

## Q34. Why are sticky specification labels useful?

### Answer

When the user horizontally scrolls through product columns, they still need to know which specification they are looking at.

A sticky label can remain visible:

```text
RAM | Product A | Product B | Product C
```

This improves context during comparison.

---

# ♿ Accessibility

## Q35. How can a comparison interface be made accessible?

### Answer

Important practices include:

- Semantic structure
- Accessible buttons
- Keyboard navigation
- Visible focus states
- Correct ARIA states
- Meaningful labels
- Accessible dialogs
- Screen-reader-friendly relationships

CartWise uses attributes such as:

```text
aria-expanded
aria-pressed
aria-live
```

where appropriate.

---

## Q36. Why is `aria-pressed` useful for Differences Only?

### Answer

Differences Only is a toggle-style control.

It has two states:

```text
Off
On
```

`aria-pressed` communicates that state to assistive technologies.

Example:

```html
<button aria-pressed="true">
  Differences Only
</button>
```

---

## Q37. Why is `aria-expanded` useful?

### Answer

`aria-expanded` communicates whether expandable content is currently open.

For example:

```text
Section Closed
aria-expanded="false"

Section Open
aria-expanded="true"
```

This helps assistive technologies understand the current UI state.

---

# 🧪 Testing & Verification

## Q38. How was the comparison logic verified?

### Answer

The comparison logic was tested against the CartWise catalogue.

Verification covered:

- Three-product comparisons
- Comparison sections
- Comparison rows
- Differing values
- Winner calculations
- Unit normalization
- Winner edge cases
- Cross-category comparison
- Four-product comparisons
- Unknown product handling

The results confirmed that the comparison engine produced the expected structures and outcomes.

---

## Q39. How was the comparison UI verified?

### Answer

The UI was verified through rendered markup and real browser testing.

Checks included:

- Product columns
- Add-product slot
- Maximum product count
- Accessibility semantics
- Differences Only
- Product picker
- Empty state
- Four-product rendering
- Persistence handling
- Responsive layouts

---

## Q40. What responsive widths were tested?

### Answer

The comparison experience was verified across:

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

The verification checked for:

- Overflow
- Clipping
- Overlap
- Responsive grids
- Horizontal scrolling
- Mobile usability
- Desktop layout

---

## Q41. What accessibility issue was discovered during verification?

### Answer

The product-name links inside the comparison columns initially had a smaller-than-desired tap target.

The link target was increased without changing the surrounding visual layout.

The fix was then re-verified.

---

## Q42. How was the final implementation validated?

### Answer

The final implementation was checked with:

```bash
npx tsc --noEmit
```

```bash
npx eslint src --max-warnings=0
```

```bash
npm run build
```

The reported results were:

```text
TypeScript → PASS
ESLint     → PASS
Build      → PASS
```

The browser verification also covered the major comparison interactions.

---

# 🏗️ System Design Questions

## Q43. How would you implement comparison with a backend?

### Answer

The frontend architecture can remain similar:

```text
React
  ↓
Compare Service
  ↓
REST API
  ↓
Backend
  ↓
Product Database
```

The backend could provide:

- Product data
- Specifications
- Store offers
- Ratings
- Comparison metadata

The frontend comparison engine could then consume the API response.

---

## Q44. How would you scale comparison for thousands of products?

### Answer

The application should avoid loading every product into the browser.

Instead:

```text
User opens picker
       ↓
Search API
       ↓
Matching products
       ↓
User selects product
```

Only the required product data should be loaded.

Other optimizations include:

- Pagination
- Debounced search
- Caching
- Lazy loading
- API filtering

---

## Q45. How would you support category-specific comparisons?

### Answer

Comparison configuration can be category-aware.

For example:

```text
Smartphone
├── Display
├── Camera
├── Battery
└── Processor

Laptop
├── Display
├── CPU
├── GPU
└── Battery

Headphones
├── Drivers
├── ANC
├── Battery
└── Connectivity
```

The comparison engine can select appropriate sections based on the product category.

---

## Q46. How would you support products from different categories?

### Answer

The engine should identify the intersection of meaningful attributes.

For example:

```text
Product A → Smartphone
Product B → Laptop
```

Only genuinely comparable information should be displayed.

Category-specific attributes can show:

```text
—
```

when they are not applicable.

This prevents misleading comparisons.

---

## Q47. How would you improve the verdict system?

### Answer

A future production verdict system could combine weighted metrics.

For example:

```text
Overall Score =
Price Score
+ Performance Score
+ Camera Score
+ Battery Score
+ Rating Score
```

Each category could have a configurable weight.

For example:

```text
Performance → 30%
Camera      → 20%
Battery     → 20%
Price       → 20%
Rating      → 10%
```

The weights could eventually depend on the user's preferences.

---

## Q48. How could AI improve Product Comparison?

### Answer

AI could summarize the comparison into user-oriented recommendations.

For example:

```text
Best Performance → Product A
Best Battery     → Product B
Best Value       → Product C
Best Camera      → Product A
```

It could also answer:

> "Which phone should I buy under ₹80,000?"

This would build naturally on the comparison foundation established in Chapter 12.

---

# 🎯 Project-Specific Questions

## Q49. What files/components form the core comparison architecture?

### Answer

The major areas include:

```text
compare/
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

Important components include:

```text
CompareGrid
CompareProductColumn
CompareToolbar
CompareVerdictCard
ComparisonSection
ProductPicker
CompareEmpty
```

---

## Q50. Why was the comparison architecture redesigned instead of extending every old comparison component?

### Answer

The comparison experience needed a more consistent architecture.

The new structure separates:

```text
State
Logic
Configuration
Presentation
```

This avoids maintaining many independent comparison components with duplicated responsibilities.

The new structure is easier to reason about and better prepared for future backend/API integration.

---

# 📌 Key Takeaways

After completing Chapter 12, you should be able to explain:

- How product comparison works.
- How shared comparison state is managed.
- Why a Compare Provider is useful.
- How product selection and limits work.
- How comparison rows and sections are generated.
- How Differences Only filtering works.
- How winner calculations are performed.
- Why unit normalization matters.
- How missing values are represented.
- How cross-category comparisons are handled.
- How localStorage persistence works.
- How responsive comparison layouts work.
- Why horizontal scrolling belongs inside the comparison region.
- How sticky labels improve comparison usability.
- How accessibility is implemented.
- How the comparison engine can evolve toward backend and AI integration.

The central architectural principle is:

```text
Product Data
     ↓
Comparison Configuration
     ↓
Comparison Engine
     ↓
Comparison State
     ↓
Comparison UI
```

This separation keeps CartWise's comparison system maintainable, testable, responsive, and ready for future expansion.
