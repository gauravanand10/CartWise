# Product Details

> **Version:** Chapter 5  
> **Status:** ✅ Completed  
> **Milestone:** Dynamic Product Details System

---

# Learning Objectives

After completing this chapter, you should be able to:

- Build dynamic product detail pages using React Router.
- Understand feature-based architecture.
- Design reusable feature modules.
- Create service and hook layers.
- Separate business logic from UI.
- Build loading and error states.
- Design scalable Product components.
- Render dynamic product information.
- Build reusable Specifications and Description components.
- Implement related product recommendations.
- Prepare the frontend for future backend integration.

---

# Problem Statement

At the end of Chapter 4, CartWise provided a complete product search experience.

Users could search, filter and browse products, but selecting a product did not provide any additional information.

A modern e-commerce application requires dedicated product pages where users can explore complete product information before making purchasing decisions.

Without Product Details:

- users cannot inspect products
- products have no identity
- comparison becomes impossible
- wishlist becomes meaningless
- backend integration becomes difficult

Therefore, this chapter focuses on building the complete Product Details module.

---

# What We Built

During this chapter we implemented the complete Product Details feature.

The Product module now contains:

- Dynamic Product Routing
- Product Service Layer
- Product Hook
- Product Gallery
- Product Information
- Technical Specifications
- Product Description
- Related Products
- Loading Skeleton
- Error Page
- Feature Module Architecture

Every responsibility was separated into independent reusable components.

---

# Why We Needed It

A product page is one of the most important pages in any e-commerce application.

Users expect to see:

- product images
- pricing
- ratings
- specifications
- description
- recommendations

Instead of placing everything inside one component, CartWise follows enterprise React architecture by separating responsibilities into independent modules.

---

# Requirements

The Product Details feature should:

- support dynamic routing
- display product information
- separate UI from business logic
- support loading states
- support error handling
- display related products
- remain backend ready
- use reusable components
- follow feature-first architecture

---

# Design Decisions

Several architectural decisions were made before implementation.

## Feature-Based Architecture

Instead of placing Product components inside the global components folder, a dedicated Product feature was created.

```text
features/

product/

├── components/

├── hooks/

├── services/

├── data/

├── types/

├── ProductPage.tsx

└── index.ts
```

Advantages

- scalable
- modular
- isolated
- backend friendly

---

## Service Layer

UI components never directly access the data.

Instead

```text
Component

↓

Hook

↓

Service

↓

Data
```

Later

```text
Service

↓

REST API

↓

Spring Boot
```

without changing the UI.

---

## Hook Layer

All business logic was moved into

```text
useProduct()
```

Responsibilities

- load product
- handle loading
- handle errors
- fetch related products

The UI simply consumes the returned state.

---

## Reusable Product Model

A single Product interface was designed.

```text
Product

├── id

├── name

├── brand

├── category

├── price

├── originalPrice

├── rating

├── reviewCount

├── stock

├── sku

├── description

├── images[]

├── specifications[]

├── features[]

├── reviews[]

└── relatedProducts[]
```

This same model will later power:

- Search
- Compare
- Wishlist
- Backend
- Authentication

---

# Internal Working

Product flow

```text
Browser

↓

/product/:id

↓

React Router

↓

ProductPage

↓

useProduct()

↓

Product Service

↓

Mock Database

↓

React Components
```

Each component has a single responsibility.

---

# Architecture Diagram

```text
Product Page

│

├──────── Breadcrumb

│

├──────── Product Gallery

│

├──────── Product Information

│

├──────── Specifications

│

├──────── Description

│

└──────── Related Products
```

---

# Folder Structure

```text
src/

features/

product/

├── ProductPage.tsx

├── index.ts

│

├── components/

│   ├── Breadcrumb.tsx

│   ├── ProductGallery.tsx

│   ├── ProductInfo.tsx

│   ├── ProductSpecs.tsx

│   ├── ProductDescription.tsx

│   ├── RelatedProducts.tsx

│   ├── ProductSkeleton.tsx

│   └── ProductError.tsx

│

├── hooks/

│   └── useProduct.ts

│

├── services/

│   └── productService.ts

│

├── data/

│   └── products.ts

│

└── types/

    └── product.ts
```

---

# Commands Used

Development

```bash
npm run dev
```

Git

```bash
git status

git add .

git commit

git pull --rebase origin main

git push origin main
```

Project Structure

```bash
tree src /f
```

---

# Code Walkthrough

## ProductPage

Acts as the orchestration layer.

Responsibilities

- loading state
- error state
- component composition

---

## Product Service

Provides

- getProductById()
- getRelatedProducts()
- getProductsByCategory()

Acts as the only gateway to data.

---

## useProduct()

Responsible for

- loading data
- error handling
- fetching related products

Keeps business logic outside UI.

---

## Product Gallery

Displays

- hero image
- image thumbnails
- active image

Future ready for backend images.

---

## Product Information

Displays

- title
- price
- rating
- SKU
- stock
- features
- CTA buttons

---

## Product Specifications

Displays

```tsx
product.specifications.map(...)
```

instead of hardcoded rows.

---

## Product Description

Displays

- description
- product highlights

---

## Related Products

Displays recommendation cards using dynamic rendering.

---

## Product Skeleton

Provides loading placeholders.

Improves perceived performance.

---

## Product Error

Professional error page for invalid or unavailable products.

---

# Application in CartWise

This Product module becomes the foundation for:

Chapter 6

↓

Compare

Chapter 7

↓

Wishlist

Chapter 8

↓

Backend APIs

Chapter 9

↓

Authentication

Every future feature reuses the Product model instead of creating duplicate implementations.

---

# Industry Insight

Modern React applications separate responsibilities into:

- Components
- Hooks
- Services
- Types
- Data

instead of placing everything inside one component.

Exactly the same architecture adopted in CartWise.

---

# Alternatives Considered

## Option 1

Large Product component.

Rejected.

Reason

- difficult maintenance
- poor scalability

---

## Option 2

Feature Module

Chosen.

Reason

- reusable
- modular
- backend ready
- enterprise architecture

---

# Common Mistakes

- Mixing UI and business logic
- Multiple Product interfaces
- Direct data access from components
- Large React files
- No loading state
- No error handling
- Hardcoded specifications
- Duplicate product cards

---

# Debugging Guide

Common issues

## Product not found

Verify

```text
/product/:id
```

matches available IDs.

---

## Import errors

Check

- index.ts
- relative imports
- default exports

---

## React Router errors

Ensure

```tsx
<BrowserRouter>
```

exists only once.

---

## TypeScript errors

Verify Product interface consistency across all files.

---

## Loading issues

Confirm

```text
useProduct()
```

returns

- product
- loading
- error

---

# Best Practices

- Keep one Product model.
- Separate UI from business logic.
- Use feature-based architecture.
- Build reusable components.
- Prefer hooks over component state.
- Never access data directly from UI.
- Use loading and error states.
- Keep services backend ready.

---

# Interview Questions

### Why use a Service Layer?

To isolate data access from the UI and simplify backend integration.

---

### Why create useProduct()?

To encapsulate business logic and keep components focused on presentation.

---

### Why feature-based architecture?

It groups related files together, improving scalability and maintainability.

---

### Why maintain a single Product interface?

It prevents duplication and keeps every feature consistent.

---

### Why implement Skeleton Loading?

It improves perceived performance and reduces layout shifts.

---

# Summary

In this chapter we transformed CartWise into a complete e-commerce application by implementing a fully modular Product Details system.

We introduced feature-based architecture, service layers, custom hooks, reusable Product components, loading states and error handling.

The Product module now serves as the foundation for all future commerce-related features.

---

# Key Takeaways

- Build reusable Product modules.
- Separate business logic from UI.
- Use Service and Hook layers.
- Design backend-ready components.
- Maintain one Product model.
- Prefer modular architecture.
- Handle loading and errors gracefully.

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

Tailwind CSS

────────────────────────────

Chapter 2

Application Foundation

↓

Routing

↓

Layouts

↓

Architecture

────────────────────────────

Chapter 3

Home Experience

↓

Landing Page

↓

Hero

↓

Categories

↓

Featured Products

────────────────────────────

Chapter 4

Search & Filtering

↓

Search

↓

Sorting

↓

Filtering

↓

Pagination

────────────────────────────

Chapter 5

Product Details

↓

Dynamic Routing

↓

Feature Module

↓

Gallery

↓

Information

↓

Specifications

↓

Description

↓

Recommendations

↓

Skeleton

↓

Error Handling

────────────────────────────

Next

↓

Chapter 6

Product Comparison System
```

---

# Related Chapters

Previous

← Chapter 4 — Search & Filtering

Next

→ Chapter 6 — Product Comparison System

---

# Completion Status

**Chapter:** 5

**Status:** ✅ Completed

**Git Commit**

```text
Complete Chapter 5 - Product Details
```

**Next Milestone**

Chapter 6 — Product Comparison System
