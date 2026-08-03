# Home Experience

> **Version:** Chapter 3  
> **Status:** ✅ Completed  
> **Milestone:** Modern Responsive Landing Page

---

# Learning Objectives

After completing this chapter, you should be able to:

- Build a professional landing page using React and Tailwind CSS.
- Design reusable React components.
- Understand component composition.
- Render UI dynamically using data.
- Separate UI from data.
- Organize a React project for scalability.
- Build responsive layouts.
- Create reusable Product Cards.
- Understand props in React.
- Design a maintainable frontend architecture.

---

# Problem Statement

At the end of Chapter 2, CartWise had a working application architecture, routing system and shared layout.

However, the application still lacked an actual user experience.

The home page was essentially empty.

Users had no way to understand

- what CartWise does
- why it exists
- what products it supports
- how to begin using the application

A modern application requires a landing page that immediately communicates its purpose while guiding users toward the primary functionality.

Therefore, this chapter focuses on designing and implementing the complete Home Experience.

---

# What We Built

During this chapter we built the complete landing page for CartWise.

The homepage now contains:

- Professional Hero Section
- Search Bar
- Product Categories
- Featured Products
- Statistics Section
- Why CartWise Section
- Responsive Layout
- Professional Navbar
- Professional Footer

Every section was built as an independent reusable component.

---

# Why We Needed It

The homepage is the first impression of the application.

Without a structured homepage:

- users don't understand the application
- navigation feels confusing
- product discovery becomes difficult
- the project appears incomplete

A homepage should answer three questions immediately:

1. What is this product?
2. Why should I use it?
3. What should I do next?

Every component added in this chapter exists to answer one of those questions.

---

# Requirements

The homepage should:

- be responsive
- use reusable components
- separate UI from data
- be easy to extend
- support future backend integration
- maintain consistent spacing
- maintain consistent typography
- follow production-ready folder organization

---

# Design Decisions

Several engineering decisions were made before implementation.

## Component-Based Design

Instead of writing one large Home component, every section was extracted into its own component.

Example:

```text
Home

│

├── Hero

├── Categories

├── FeaturedProducts

├── Stats

├── WhyCartWise
```

Advantages:

- easier maintenance
- reusable code
- cleaner files
- isolated responsibilities

---

## Data-Driven UI

Instead of hardcoding cards repeatedly,

we created dedicated data files.

Example:

```text
data/

categories.ts

featuredProducts.ts

stats.ts

whyCartWise.ts
```

The UI simply renders the data using

```tsx
.map()
```

Advantages:

- scalable
- backend friendly
- reusable
- easier updates

---

## Responsive Design

Tailwind responsive utilities were used.

Example:

```tsx
lg:flex-row

md:grid-cols-2

lg:grid-cols-4
```

The same component adapts automatically to different screen sizes.

---

# Internal Working

The Home page acts as the composition layer.

```text
Home

│

├── Hero

│

├── Categories

│

├── Featured Products

│

├── Statistics

│

└── Why CartWise
```

Each component has a single responsibility.

Example:

Hero

↓

Displays

- Heading
- Search
- CTA Buttons

Categories

↓

Displays

- category cards

Featured Products

↓

Displays

- reusable Product Cards

---

# Architecture Diagram

```text
Home Page

│

├──────────── Hero

│

├──────────── Categories

│

├──────────── Featured Products

│

├──────────── Statistics

│

└──────────── Why CartWise
```

---

# Folder Structure

```text
src/

components/

home/

Hero.tsx

SearchBar.tsx

Categories.tsx

FeaturedProducts.tsx

ProductCard.tsx

Stats.tsx

WhyCartWise.tsx

data/

categories.ts

featuredProducts.ts

stats.ts

whyCartWise.ts
```

---

# Commands Used

Project execution

```bash
npm run dev
```

Git

```bash
git status

git add .

git commit

git push
```

Project Structure

```bash
tree src /f
```

---

# Code Walkthrough

## Hero

Purpose

Introduce CartWise.

Contains

- heading
- description
- search bar
- CTA buttons
- hero image

---

## Categories

Displays all available product categories.

Uses

```tsx
categories.map(...)
```

instead of hardcoded UI.

---

## Featured Products

Displays selected products.

Uses

```tsx
<ProductCard />
```

for every product.

Demonstrates component reuse.

---

## ProductCard

Reusable UI component.

Accepts props.

Displays

- image
- title
- category
- rating
- price
- buttons

This component will later be reused in

- Search Results
- Wishlist
- Compare
- Product Details

---

## Statistics

Displays application metrics.

Rendered using

```tsx
stats.map(...)
```

---

## Why CartWise

Explains the value proposition.

Each feature is rendered dynamically from

```text
whyCartWise.ts
```

---

# Application in CartWise

This chapter provides the complete visual foundation of the application.

Future chapters will build upon these components instead of replacing them.

Example:

Search Results

↓

ProductCard

Wishlist

↓

ProductCard

Compare

↓

ProductCard

---

# Industry Insight

Modern React applications rarely place all UI inside one file.

Instead they follow

- Component Composition
- Data Driven Rendering
- Separation of Concerns

Exactly the same approach used in CartWise.

---

# Alternatives Considered

## Option 1

One massive Home component.

Rejected.

Reason:

- difficult to maintain
- poor readability

---

## Option 2

Separate reusable components.

Chosen.

Reason:

- scalable
- reusable
- easier testing

---

# Common Mistakes

- Hardcoding repeated cards
- Mixing data with UI
- Huge React components
- Ignoring responsiveness
- Duplicating code
- Poor folder organization

---

# Debugging Guide

Common issues encountered:

## JSX pasted into `.ts` file

Solution

Move JSX into `.tsx`.

---

## TypeScript prop mismatch

Ensure interface matches component props.

---

## Import errors

Verify

- export
- default export
- relative path

---

## Tailwind classes not applying

Verify

- className spelling
- Tailwind configuration
- Vite server restart

---

# Best Practices

- Keep components small.
- Use reusable UI.
- Separate data from UI.
- Prefer `.map()` over duplication.
- Keep folders organized.
- Write meaningful Git commits.
- Test after every milestone.

---

# Interview Questions

### Why do we split the Home page into multiple components?

Because each component should have a single responsibility, improving maintainability and reusability.

---

### Why use `.map()` instead of repeating JSX?

It allows rendering dynamic data, reduces duplication, and scales as data grows.

---

### Why separate data into dedicated files?

It keeps UI independent from the data source and simplifies future API integration.

---

### What is Component Composition?

Building larger interfaces by combining smaller reusable components.

---

### Why is responsive design important?

Users access applications from devices of different sizes. Responsive layouts improve usability without maintaining separate implementations.

---

# Summary

In this chapter we transformed CartWise from an empty application shell into a complete, responsive landing page.

We introduced reusable components, data-driven rendering, responsive layouts, and a scalable project structure.

These foundations will support every future feature of the application.

---

# Key Takeaways

- Build reusable components.
- Keep data separate from UI.
- Prefer composition over large components.
- Design for scalability.
- Implement responsive layouts from the beginning.
- Maintain a clean folder structure.
- Commit meaningful milestones.

---

# Project Evolution

```text
Chapter 1

Development Environment

↓

React

↓

Vite

↓

TypeScript

↓

Tailwind

────────────────────────────

Chapter 2

Application Foundation

↓

Routing

↓

Layouts

↓

Pages

↓

Architecture

────────────────────────────

Chapter 3

Home Experience

↓

Hero

↓

Categories

↓

Featured Products

↓

Statistics

↓

Why CartWise

↓

Responsive Landing Page

────────────────────────────

Next

↓

Chapter 4

Search System
```

---

# Related Chapters

Previous

← Chapter 2 — Application Foundation

Next

→ Chapter 4 — Search System

---

# Completion Status

**Chapter:** 3

**Status:** ✅ Completed

**Git Commit**

```text
feat: complete homepage with reusable landing page components
```

**Next Milestone**

Chapter 4 — Search System
