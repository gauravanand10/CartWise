# 📖 CH10 — Glossary

> This glossary explains the important terms, concepts, and technologies introduced while building the **Search System** in CartWise.

---

# 🔍 Search System

The Search System allows users to quickly discover products by entering keywords, applying filters, and sorting results.

In CartWise, the Search System is one of the core features because every product discovery journey begins with a search.

---

# 🔎 Search Query

A Search Query is the word or phrase entered by the user into the search bar.

Examples:

```text
iPhone
MacBook
Sony Headphones
Galaxy S25
```

The search engine uses this query to find matching products.

---

# 🌐 URL Query Parameter

A Query Parameter is additional information appended to a URL.

Example:

```text
/search?q=iPhone
```

Here:

- `/search` is the page.
- `q` is the parameter.
- `iPhone` is the search query.

CartWise uses URL query parameters so searches can be bookmarked, shared, and refreshed without losing state.

---

# 📦 Search Result

A Search Result is an individual product that matches the user's search query.

Each result displays:

- Product Image
- Product Name
- Brand
- Rating
- Price
- Discount
- Compare Button

---

# 🃏 Product Card

A Product Card is a reusable UI component used to display product information consistently.

The same Product Card is reused across:

- Homepage
- Search Results
- Related Products

This improves consistency and maintainability.

---

# 🧠 Search Suggestion

Search Suggestions are recommendations shown while the user is typing.

Examples:

```text
iPhone 16 Pro
Galaxy S25 Ultra
MacBook Air M4
Sony WH-1000XM6
```

Suggestions help users complete searches more quickly.

---

# 🕒 Recent Searches

Recent Searches are the user's previously searched keywords.

They provide quick access to earlier searches without requiring the user to type again.

---

# 🔥 Trending Searches

Trending Searches highlight popular products currently being searched.

Examples:

- iPhone 16 Pro
- Galaxy S25 Ultra
- MacBook Air M4

---

# 🎛️ Filter

A Filter reduces the number of displayed products based on selected criteria.

Instead of searching again, users refine the current results.

---

# 🏷️ Category Filter

Filters products by category.

Examples:

- Smartphone
- Laptop
- Television
- Smartwatch
- Audio

---

# 🏢 Brand Filter

Displays only products belonging to selected brands.

Examples:

- Apple
- Samsung
- Sony
- Dell
- Lenovo

---

# 💰 Price Filter

Limits products within a selected price range.

Example:

```text
₹25,000 – ₹75,000
```

---

# ⭐ Rating Filter

Shows products that meet or exceed a selected customer rating.

Example:

```text
4★ & Above
```

---

# 📦 Availability Filter

Filters products based on stock availability.

Examples:

- In Stock
- Out of Stock

---

# ↕️ Sorting

Sorting changes the order of displayed products without changing the search results.

CartWise supports:

- Relevance
- Price: Low → High
- Price: High → Low
- Rating
- Newest

---

# 📊 Search Statistics

Search Statistics provide useful information about the current results.

Examples include:

- Number of matching products
- Price range
- Average rating

---

# 🧾 Active Filters

Active Filters are currently applied filters displayed as removable chips.

Example:

```text
Apple ×
₹75,000–₹1,50,000 ×
4.5★ & Above ×
```

---

# 🧹 Clear Filters

Clear Filters removes all applied filters and restores the original search results.

---

# 📄 Pagination

Pagination divides large result sets into multiple pages.

Although the current implementation uses a limited mock dataset, pagination prepares the Search System for future backend integration.

---

# ⌛ Loading Skeleton

A Loading Skeleton is a temporary placeholder displayed while content is loading.

It provides visual feedback instead of showing a blank page.

---

# 📭 Empty State

The Empty State appears when the user has not yet performed a search.

It encourages users to begin searching.

---

# 🚫 No Results State

Displayed when no products match the current search query or applied filters.

Instead of leaving the page blank, CartWise informs the user and suggests modifying the search.

---

# ⚠️ Error State

The Error State appears when product data cannot be loaded.

It provides feedback and allows the user to retry.

---

# 📱 Responsive Search

Responsive Search ensures the Search System works consistently across:

- Mobile
- Tablet
- Laptop
- Desktop

Layouts, spacing, filters, and product grids automatically adapt to different screen sizes.

---

# 🎯 Debounced Search

Debouncing delays search execution until the user pauses typing.

This reduces unnecessary searches and improves performance.

---

# 🧩 Search State

Search State represents the current state of the Search System.

It includes:

- Current query
- Selected filters
- Selected sorting
- Current results

---

# 🔄 URL Synchronization

URL Synchronization keeps the search state synchronized with the browser URL.

Benefits include:

- Refresh-safe searches
- Bookmarkable URLs
- Shareable search links
- Browser back/forward support

---

# 🏗️ Feature-first Architecture

The Search System follows the Feature-first Architecture used throughout CartWise.

All search-related files remain inside the Search feature, improving maintainability and scalability.

---

# 📌 Summary

The Search System is one of the most important modules in CartWise. It allows users to discover products efficiently through search queries, filters, sorting, and responsive layouts. By combining reusable components, URL synchronization, responsive design, and a modular architecture, the Search module provides a scalable foundation for future backend integration and AI-powered product discovery.
