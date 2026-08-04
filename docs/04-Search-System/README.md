# Search & Filtering

> **Version:** Chapter 4  
> **Status:** ✅ Completed  
> **Milestone:** Intelligent Product Search & Filtering System

---

# Learning Objectives

After completing this chapter, you should be able to:

- Build a production-ready search system using React.
- Implement client-side product searching.
- Design reusable search components.
- Implement category-based filtering.
- Sort products dynamically.
- Build a responsive search interface.
- Handle empty search results gracefully.
- Create reusable custom hooks.
- Separate UI, business logic and data.
- Build scalable feature-based architecture.

---

# Problem Statement

At the end of Chapter 3, CartWise had a beautiful landing page that introduced the application.

However, users still had no way to discover products.

Without a search system, users could not:

- search for products
- browse categories
- filter products
- sort results
- discover available items

Since product discovery is one of the core functionalities of CartWise, the application required a dedicated Search System capable of handling these operations efficiently.

This chapter focuses on designing and implementing that system.

---

# What We Built

During this chapter we built the complete Search System.

The Search page now contains:

- Professional Search Header
- Intelligent Search Input
- Search Button
- Clear Button
- Trending Search Chips
- Product Statistics Cards
- Search Engine Status Cards
- Category Filters
- Product Sorting
- Search Results
- Reusable Product Cards
- Empty State
- Error State
- Search Skeleton Loader
- Pagination
- Responsive Layout
- Feature-Based Search Architecture

Every section was implemented as an independent reusable component.

---

# Why We Needed It

Searching is the primary interaction between users and products.

Without a search system:

- product discovery becomes difficult
- browsing large catalogs is inefficient
- users cannot quickly locate products
- comparison workflows cannot begin

A search system should answer three questions immediately:

1. Does this product exist?
2. Can I narrow down my results?
3. Which product best matches my requirements?

Every component added in this chapter exists to answer one of those questions.

---

# Requirements

The Search System should:

- support keyword searching
- support category filtering
- support sorting
- support pagination
- support empty states
- support loading states
- support reusable architecture
- separate UI from business logic
- be responsive
- support future backend integration
- remain scalable

---

# Design Decisions

Several engineering decisions were made before implementation.

## Feature-Based Architecture

Instead of placing everything inside one page, Search became its own feature module.

Example:

```text
features/

search/

├── components/
├── hooks/
├── services/
├── data/
├── types/
├── utils/
└── SearchPage.tsx
```

Advantages:

- scalable
- modular
- easier maintenance
- easier testing

---

## Component-Based Design

Instead of one large Search page, every responsibility became a separate component.

Example:

```text
SearchPage

│

├── SearchHeader

├── SearchInput

├── SearchStats

├── FilterSidebar

├── SearchResults

├── SearchResultCard

├── SortDropdown

├── Pagination

├── EmptyState

├── ErrorState

└── SearchSkeleton
```

Advantages:

- reusable UI
- cleaner files
- isolated responsibilities

---

## Business Logic using Custom Hooks

Instead of writing search logic inside React components, we created reusable hooks.

Example:

```text
hooks/

useSearch.ts

useDebounce.ts
```

Advantages:

- reusable logic
- cleaner UI
- easier testing
- easier debugging

---

## Service Layer

Instead of reading product data directly inside components, a dedicated service layer was introduced.

Example:

```text
services/

searchService.ts
```

Advantages:

- backend ready
- reusable
- clean separation of concerns

---

## Mock Data Layer

Products are currently stored inside

```text
data/

products.ts
```

Later this will be replaced by backend APIs without changing the UI.

---

# Internal Working

The Search page acts as the composition layer.

```text
Search Page

│

├── Search Header

│

├── Search Input

│

├── Search Statistics

│

├── Filter Sidebar

│

├── Sort Dropdown

│

├── Search Results

│

├── Pagination

│

└── Empty State
```

Search Flow

```text
User Types

↓

useDebounce()

↓

useSearch()

↓

searchService

↓

Filtered Products

↓

Sorting

↓

Pagination

↓

Search Results
```

Each layer performs only one responsibility.

---

# Architecture Diagram

```text
User

↓

Search Input

↓

useDebounce()

↓

useSearch()

↓

Search Service

↓

Products Data

↓

Filtering

↓

Sorting

↓

Pagination

↓

SearchResultCard
```

---

# Folder Structure

```text
src/

features/

search/

├── SearchPage.tsx

├── components/

│   ├── EmptyState.tsx

│   ├── ErrorState.tsx

│   ├── FilterSidebar.tsx

│   ├── Pagination.tsx

│   ├── SearchHeader.tsx

│   ├── SearchInput.tsx

│   ├── SearchResultCard.tsx

│   ├── SearchResults.tsx

│   ├── SearchSkeleton.tsx

│   ├── SearchStats.tsx

│   └── SortDropdown.tsx

├── data/

│   └── products.ts

├── hooks/

│   ├── useDebounce.ts

│   └── useSearch.ts

├── services/

│   └── searchService.ts

├── types/

│   ├── filter.ts

│   └── search.ts

├── utils/

│   └── debounce.ts

└── index.ts
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

## SearchHeader

Purpose

Displays the Search page overview.

Contains

- Search title
- Statistics cards
- Search engine information

---

## SearchInput

Purpose

Accept user search queries.

Contains

- Search textbox
- Search button
- Clear button
- Trending search chips

---

## useDebounce

Delays execution until the user stops typing.

Prevents unnecessary filtering on every keystroke.

Improves performance.

---

## useSearch

Central search logic.

Responsible for

- searching
- filtering
- sorting
- pagination

---

## SearchService

Responsible for querying product data.

Currently uses mock data.

Future backend APIs will replace this layer.

---

## FilterSidebar

Displays available categories.

Allows users to narrow search results.

---

## SortDropdown

Sorts products using:

- Relevance
- Name
- Price
- Rating

---

## SearchResults

Displays all matching products.

Uses

```tsx
<SearchResultCard />
```

instead of duplicated UI.

---

## SearchResultCard

Reusable product card.

Displays

- image
- category
- rating
- title
- brand
- price
- stock status
- Compare button
- Details button

This component will later be reused in

- Product Details
- Compare
- Wishlist

---

## EmptyState

Displayed whenever

```text
Products Found = 0
```

Contains

- illustration
- helpful message
- suggested searches

---

## ErrorState

Displays friendly UI when the search process fails.

Prepared for future API integration.

---

## SearchSkeleton

Displays loading placeholders while products are being fetched.

Provides a smoother user experience.

---

## Pagination

Allows navigation through multiple pages of search results.

Designed for future backend pagination.

---

# Application in CartWise

This chapter provides the complete product discovery system.

Future chapters will build upon this feature instead of replacing it.

Example:

Product Details

↓

Opened from Search Results

Compare

↓

Products selected from Search

Wishlist

↓

Products saved from Search

Backend APIs

↓

Replace SearchService

---

# Industry Insight

Modern React applications rarely place all search logic inside one component.

Instead they follow

- Feature-Based Architecture
- Custom Hooks
- Service Layer
- Separation of Concerns

Exactly the same architecture implemented in CartWise.

---

# Alternatives Considered

## Option 1

One massive Search component.

Rejected.

Reason:

- difficult to maintain
- poor readability
- tightly coupled

---

## Option 2

Feature-based architecture with reusable components.

Chosen.

Reason:

- scalable
- reusable
- easier testing
- production ready

---

# Common Mistakes

- Searching on every keystroke
- Mixing UI with business logic
- Hardcoding filters
- Ignoring empty states
- Duplicating product card code
- Poor folder organization
- Forgetting pagination

---

# Debugging Guide

Common issues encountered:

## Search returns no products

Verify

- product data
- search hook
- filtering logic

---

## Category filter not working

Verify

- category names
- filter state
- comparison logic

---

## Sorting incorrect

Verify

- selected option
- sorting comparator

---

## Pagination incorrect

Verify

- current page
- items per page
- total products

---

## Empty state not showing

Verify

```tsx
filteredProducts.length === 0
```

---

## Search not updating

Verify

- debounce hook
- state updates
- hook dependencies

---

# Best Practices

- Keep business logic inside hooks.
- Keep UI components presentational.
- Use feature-based architecture.
- Separate services from UI.
- Build reusable product cards.
- Debounce expensive operations.
- Handle empty states gracefully.
- Test every filter combination.
- Write meaningful Git commits.

---

# Interview Questions

### Why use a custom hook for search?

Because it separates business logic from UI, making the code reusable and easier to maintain.

---

### What is debouncing?

Debouncing delays execution until the user stops typing, reducing unnecessary computations and improving performance.

---

### Why separate SearchService from UI?

It allows the data source to change (for example from mock data to backend APIs) without modifying UI components.

---

### Why use Feature-Based Architecture?

It groups related files together, making the project easier to scale, maintain and test.

---

### Why is an Empty State important?

It informs users that no matching products were found and provides a better user experience than displaying a blank page.

---

# Summary

In this chapter we transformed CartWise from a static landing page into a complete product discovery platform.

We introduced searching, filtering, sorting, pagination, reusable hooks, service layers, feature-based architecture and responsive search interfaces.

These foundations prepare the application for dynamic product pages, comparison, wishlist management and backend integration.

---

# Key Takeaways

- Build reusable search components.
- Separate UI from business logic.
- Use custom hooks.
- Use a service layer.
- Design scalable feature modules.
- Debounce user input.
- Handle empty and loading states.
- Keep architecture modular.
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

Chapter 4

Search & Filtering

↓

Feature-Based Architecture

↓

Search Engine

↓

Filters

↓

Sorting

↓

Pagination

↓

Custom Hooks

↓

Service Layer

↓

Responsive Product Discovery

────────────────────────────

Next

↓

Chapter 5

Dynamic Product Pages
```

---

# Related Chapters

Previous

← Chapter 3 — Home Experience

Next

→ Chapter 5 — Dynamic Product Pages

---

# Completion Status

**Chapter:** 4

**Status:** ✅ Completed

**Git Commits**

```text
Complete Chapter 4 - Search & Filtering

chore: remove accidental empty files
```

**Next Milestone**

Chapter 5 — Dynamic Product Pages
