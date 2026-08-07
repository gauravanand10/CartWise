# 🎯 CH06 — Interview Questions

> This chapter focuses on **Shared Components**. These questions cover component reusability, UI consistency, component design, maintainability, and frontend engineering best practices.

---

# 📚 Beginner Level

---

## Q1. What is a Component?

### Answer

A Component is an independent, reusable piece of a user interface.

Instead of writing the same UI repeatedly, developers create one component and reuse it throughout the application.

Examples:

- Button
- Card
- Input
- Navbar

---

## Q2. What are Shared Components?

### Answer

Shared Components are reusable components that are used across multiple pages or features.

Examples in CartWise:

- Button
- Card
- Badge
- Input
- Loader
- Skeleton
- PriceTag
- Rating

They improve consistency and reduce duplicate code.

---

## Q3. Why do we create Shared Components?

### Answer

Shared Components provide:

- Code Reusability
- UI Consistency
- Easier Maintenance
- Faster Development

Instead of fixing the same bug in multiple places, developers update a single component.

---

## Q4. What is Component Reusability?

### Answer

Component Reusability is the ability to build one component and use it in multiple places.

Example:

The same Button component can be used for:

- Search
- Login
- Compare
- Wishlist
- Checkout

---

## Q5. What is a Card Component?

### Answer

A Card is a reusable container used to display related information.

Examples:

- Product Card
- Brand Card
- Offer Card

Cards improve organization and readability.

---

## Q6. What is a Badge?

### Answer

A Badge is a small UI element used to highlight information.

Examples:

- New
- Sale
- Trending
- Best Seller

Badges help users quickly identify important information.

---

## Q7. What is a Chip?

### Answer

A Chip is a compact UI component used for categories, filters, or selections.

Examples:

- Electronics
- Mobiles
- Fashion

---

## Q8. What is a Loader?

### Answer

A Loader informs users that data is currently loading.

It improves perceived responsiveness and prevents users from assuming the application has frozen.

---

## Q9. What is a Skeleton Loader?

### Answer

A Skeleton Loader displays placeholder content while real data loads.

Instead of showing only a spinner, users see the approximate structure of the final interface.

---

## Q10. What is an Empty State?

### Answer

An Empty State appears when no data exists.

Examples:

- Empty Wishlist
- No Search Results
- No Recently Viewed Products

It should guide users toward the next action.

---

# 🚀 Intermediate Level

---

## Q11. Why are reusable components important?

### Answer

Reusable components:

- Reduce duplicate code
- Improve consistency
- Simplify maintenance
- Increase development speed

They are one of the foundations of scalable frontend architecture.

---

## Q12. Why should every page use the same Button component?

### Answer

Using one Button component ensures:

- Consistent styling
- Consistent behavior
- Easier updates
- Better maintainability

---

## Q13. What is Component Composition?

### Answer

Component Composition is the process of combining smaller components to create larger interfaces.

Example:

A Product Card may contain:

- Badge
- PriceTag
- Rating
- Button

---

## Q14. What is UI Consistency?

### Answer

UI Consistency means similar elements should always look and behave similarly.

Consistency improves usability and creates a professional user experience.

---

## Q15. Why should components have a single responsibility?

### Answer

A component should perform one clearly defined task.

This makes it:

- Easier to understand
- Easier to test
- Easier to reuse

---

## Q16. What is a PriceTag component?

### Answer

A PriceTag is a reusable component responsible for displaying pricing information consistently.

It may include:

- Current Price
- Original Price
- Discount Percentage

---

## Q17. What is a Rating component?

### Answer

A Rating component displays product ratings.

Example:

```text
⭐ 4.7
```

Using one shared component ensures consistent formatting.

---

## Q18. Why create a StoreBadge component?

### Answer

A StoreBadge identifies the marketplace associated with a product.

Examples:

- Amazon
- Flipkart
- Croma

A shared component maintains consistent branding across the application.

---

## Q19. What is an Error State?

### Answer

An Error State appears when an operation fails.

Examples:

- API Failure
- Network Error
- Product Not Found

It should clearly explain the problem and suggest a recovery action.

---

## Q20. Why should components accept props?

### Answer

Props make components flexible and reusable.

Instead of creating multiple button components, one Button component can display different labels, colors, icons, and actions through props.

---

# 🔥 Advanced Level

---

## Q21. How do Shared Components improve scalability?

### Answer

As applications grow, reusable components prevent UI duplication.

Developers spend more time building features instead of rewriting interfaces.

---

## Q22. What problems occur when components are duplicated?

### Answer

Duplicated components lead to:

- Inconsistent UI
- Higher maintenance costs
- More bugs
- Slower development

---

## Q23. How does CartWise benefit from Shared Components?

### Answer

CartWise uses shared components across:

- Homepage
- Search
- Product Details
- Wishlist
- Compare

Updating one component automatically updates every page using it.

---

## Q24. What is the difference between a Shared Component and a Feature Component?

### Answer

Shared Components are generic and reusable throughout the application.

Feature Components belong to one specific feature.

Example:

Shared:

- Button
- Card
- Loader

Feature-specific:

- HeroBanner
- FlashDealsSection
- CompareTable

---

## Q25. Why should business logic remain outside Shared Components?

### Answer

Shared Components should focus only on presentation.

Business logic belongs inside:

- Hooks
- Services
- Feature Components

This separation improves maintainability and reusability.

---

# 🏗️ Real-world & System Design Questions

---

## Q26. How would you organize hundreds of reusable components?

### Answer

Group them logically.

Example:

```text
shared/
├── buttons/
├── cards/
├── forms/
├── feedback/
├── navigation/
├── typography/
```

This improves discoverability and scalability.

---

## Q27. Why do companies build internal component libraries?

### Answer

Component libraries provide:

- Consistent UI
- Faster development
- Easier onboarding
- Shared engineering standards

Examples include Material UI, Ant Design, and Shopify Polaris.

---

## Q28. How does a Component Library reduce technical debt?

### Answer

Reusable components eliminate duplicate implementations.

Instead of fixing bugs in multiple places, developers update one shared component.

---

## Q29. What is the biggest mistake beginners make with components?

### Answer

Creating new components for every page instead of reusing existing ones.

This results in unnecessary duplication and inconsistent interfaces.

---

## Q30. Why are Shared Components introduced before building additional pages?

### Answer

Most pages share common UI elements.

Building reusable components first ensures future pages are developed faster, remain visually consistent, and are easier to maintain.

---

# 📌 Key Takeaways

After completing these questions, you should be able to explain:

- What Shared Components are.
- Why component reusability is important.
- The difference between Shared and Feature Components.
- How reusable components improve scalability.
- Why CartWise uses a centralized component library.
- How Shared Components reduce maintenance effort and technical debt.
