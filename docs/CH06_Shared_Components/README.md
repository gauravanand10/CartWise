# 🧩 CH06 — Shared Components

> **Project:** CartWise  
> **Chapter:** Shared Components

---

# 👋 Welcome

Imagine building a website where every page has its own button.

The homepage has a blue button.

The search page has a green button.

The wishlist has a rounded button.

The compare page has a square button.

Now imagine your designer says,

> "Let's make every primary button orange."

If you've created twenty different buttons, you'll have to modify every single one.

That's not scalable.

Instead, modern applications build a component **once** and reuse it everywhere.

Welcome to the world of **Shared Components**.

---

# 🎯 Learning Objectives

By the end of this chapter, you will:

- Understand what Shared Components are.
- Learn why component reusability matters.
- Understand how CartWise builds reusable UI.
- Learn how consistency improves development.
- Understand the role of each shared component.
- Learn why component libraries are essential in modern applications.

---

# 🤔 Why Do We Need Shared Components?

Modern applications contain hundreds of screens.

Many of these screens reuse the same UI elements.

Examples include:

- Buttons
- Cards
- Inputs
- Ratings
- Loaders
- Empty States

Creating these elements repeatedly wastes time and leads to inconsistencies.

Shared Components solve this problem.

Build once.

Reuse everywhere.

---

# 🧱 Building Blocks of CartWise

Think of CartWise as a LEGO model.

Every LEGO model is built using reusable bricks.

Instead of creating new bricks every time, we assemble existing ones into something larger.

CartWise follows the same philosophy.

Small reusable components combine to create:

- Homepage
- Search Page
- Product Details
- Wishlist
- Compare Page

The larger the application grows, the more valuable these reusable building blocks become.

---

# 🎨 One Design, Everywhere

Because every Shared Component follows the Design System introduced in the previous chapter, every page automatically shares the same visual language.

For example:

- Buttons always look familiar.
- Cards maintain consistent spacing.
- Ratings appear the same across all pages.
- Price tags use identical formatting.

Users never have to relearn the interface.

---

# 🧩 Meet the Component Library

The first version of CartWise includes several reusable components.

Examples include:

- 🔘 Button
- 🪪 Card
- 🏷️ Badge
- 🎟️ Chip
- ⌨️ Input
- ⏳ Loader
- 🦴 Skeleton
- ❌ ErrorState
- 📭 EmptyState
- 💰 PriceTag
- ⭐ Rating
- 🏪 StoreBadge
- 📝 SectionHeading
- 🪟 GlassPanel

Each component has a single responsibility and can be reused throughout the application.

---

# ♻️ Why Reusability Matters

Imagine discovering a bug inside the Button component.

If every page has its own button, you might need to fix the same issue twenty times.

With Shared Components, the fix happens once.

Every page immediately benefits.

This saves time, reduces bugs, and keeps the application consistent.

---

# 🚀 Faster Development

As CartWise grows, new pages become easier to build.

Instead of creating UI from scratch, developers simply assemble existing components.

For example, building a new Product Details page might involve combining:

- Product Card
- PriceTag
- Rating
- StoreBadge
- Button
- SectionHeading

Much of the interface already exists.

Development becomes faster with every new feature.

---

# 🌍 CartWise Implementation

During this chapter, the following reusable components were implemented:

- Button
- Card
- Badge
- Chip
- Input
- Loader
- Skeleton
- ErrorState
- EmptyState
- GlassPanel
- PriceTag
- Rating
- StoreBadge
- SectionHeading

These components now serve as the foundation for every current and future page in CartWise.

---

# 🏗️ Engineering Philosophy

The Shared Components library follows a few important principles.

### Build Once, Reuse Everywhere

Every reusable UI element should exist in only one place.

If multiple pages need the same interface, they should use the same component.

---

### Keep Components Generic

A shared component should solve a general problem.

It should never depend on a specific page or feature.

Generic components are easier to reuse.

---

### One Component, One Responsibility

Each component should perform one clearly defined task.

For example:

- Button → Trigger actions.
- PriceTag → Display pricing.
- Rating → Display ratings.

Keeping responsibilities focused makes components easier to maintain.

---

### Consistency Over Convenience

Creating a new button might seem faster.

Using the existing Button component is almost always the better long-term decision.

Consistency improves both development and user experience.

---

# 🌟 Why This Chapter Matters

Every modern frontend framework encourages reusable components.

Without them:

- Code duplication increases.
- Maintenance becomes difficult.
- UI becomes inconsistent.
- Development slows down.

Shared Components solve these problems before they appear.

They transform the application from a collection of pages into a unified design system.

---

# 📈 Looking Ahead

The component library introduced in this chapter will be reused extensively throughout the remainder of the CartWise project.

Upcoming chapters—including Layout Architecture, Homepage Development, Search, Product Details, Product Comparison, Wishlist, Authentication, and Dashboard—will all build upon these reusable components.

As the application grows, very few completely new UI elements will be needed because the foundation already exists.

---

# 📌 Key Takeaways

- Shared Components are reusable building blocks of the UI.
- Reusability reduces duplicate code and improves consistency.
- CartWise uses a centralized component library.
- Every shared component has a single responsibility.
- Reusable components speed up future development.
- Maintaining one component is easier than maintaining many copies.

---

# ➡️ What's Next?

With a reusable component library now in place, the next step is assembling those components into a complete application structure.

In the next chapter, we'll build the **Layout Architecture** of CartWise, bringing together the Navbar, Footer, Search Bar, Category Strip, and other shared layout elements that appear across multiple pages.
