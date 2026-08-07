# 🎯 CH10 — Interview Questions

> This chapter focuses on the design and implementation of the **Search System** in CartWise. The questions cover frontend search architecture, filtering, sorting, URL synchronization, performance, accessibility, and real-world engineering practices.

---

# 📚 Beginner Level

---

## Q1. What is a Search System?

### Answer

A Search System allows users to quickly find relevant products by entering keywords.

Instead of manually browsing categories, users can search directly for products they need.

In CartWise, the Search System is the primary entry point for product discovery.

---

## Q2. Why is a Search System important?

### Answer

A Search System improves user experience by reducing the time required to find products.

Without search, users would have to browse hundreds or thousands of products manually.

---

## Q3. What is a Search Query?

### Answer

A Search Query is the text entered by the user into the search bar.

Examples:

```text
iPhone
MacBook
Sony
Galaxy S25
```

The application compares this query against available product data to find relevant matches.

---

## Q4. What are Search Suggestions?

### Answer

Search Suggestions appear while the user is typing.

They help users:

- Complete searches faster
- Reduce typing
- Discover products
- Avoid spelling mistakes

---

## Q5. What are Recent Searches?

### Answer

Recent Searches store previously searched keywords.

They allow users to quickly repeat earlier searches without typing again.

---

## Q6. What are Trending Searches?

### Answer

Trending Searches display popular search terms currently used by users.

Examples:

- iPhone 16 Pro
- MacBook Air M4
- Galaxy S25 Ultra

---

## Q7. What is Filtering?

### Answer

Filtering narrows search results without changing the search query.

Examples include:

- Brand
- Category
- Price
- Rating

---

## Q8. What is Sorting?

### Answer

Sorting changes the order of displayed products.

CartWise supports:

- Relevance
- Price (Low → High)
- Price (High → Low)
- Rating
- Newest

---

## Q9. What is Pagination?

### Answer

Pagination divides a large result set into multiple pages.

It improves readability and performance by avoiding extremely long pages.

---

## Q10. What is an Empty State?

### Answer

An Empty State appears when no search has been performed yet.

It encourages users to begin searching.

---

# 🚀 Intermediate Level

---

## Q11. Why should search queries be stored in the URL?

### Answer

Storing the query inside the URL provides several benefits:

- Bookmarkable searches
- Shareable links
- Browser refresh support
- Back and forward navigation

Example:

```text
/search?q=iPhone
```

---

## Q12. Why should Product Cards be reused in Search Results?

### Answer

Reusable Product Cards maintain consistency across the application.

The same component can be used on:

- Homepage
- Search Results
- Related Products

This reduces duplicate code.

---

## Q13. Why is filtering separated from searching?

### Answer

Searching finds matching products.

Filtering refines those results.

Separating these responsibilities creates cleaner architecture and improves maintainability.

---

## Q14. Why is debouncing useful?

### Answer

Debouncing delays search execution until the user pauses typing.

Benefits include:

- Fewer unnecessary searches
- Better performance
- Reduced future API requests

---

## Q15. What is URL synchronization?

### Answer

URL synchronization keeps the search state and browser URL consistent.

If the user refreshes the page, the search remains unchanged.

---

## Q16. Why should sorting not modify the original dataset?

### Answer

Sorting should operate on a copy of the data.

Modifying the original dataset can introduce bugs and unexpected behavior.

---

## Q17. Why are Active Filter chips useful?

### Answer

They provide visual feedback showing which filters are currently applied.

Users can remove individual filters without resetting the entire search.

---

## Q18. What is a Loading Skeleton?

### Answer

A Loading Skeleton is a placeholder UI shown while data is loading.

It provides a smoother user experience than displaying a blank screen.

---

## Q19. What is a No Results State?

### Answer

The No Results State informs users when no products match the current query or filters.

It encourages them to modify their search instead of leaving the page empty.

---

## Q20. Why should search be responsive?

### Answer

Users search from many devices.

Responsive layouts ensure search remains usable on:

- Phones
- Tablets
- Laptops
- Desktops

---

# 🔥 Advanced Level

---

## Q21. How does CartWise organize the Search System?

### Answer

The Search System follows the Feature-first Architecture.

Search-related components, hooks, services, utilities, constants, and types remain inside the Search feature.

This improves modularity and scalability.

---

## Q22. Why is the search service isolated from UI components?

### Answer

Separating business logic from presentation simplifies maintenance.

If the backend changes later, only the service layer needs modification.

---

## Q23. How does URL synchronization improve scalability?

### Answer

URL-based search makes future backend integration much easier.

Search queries can be passed directly to REST APIs without changing the frontend architecture.

---

## Q24. Why should search state be centralized?

### Answer

Keeping query, filters, sorting, and results inside a single search state prevents inconsistent behavior and simplifies updates.

---

## Q25. Why is accessibility important in search interfaces?

### Answer

Accessible search improves usability for keyboard users and screen readers.

Examples include:

- Focus states
- Keyboard navigation
- ARIA attributes
- Proper labels

---

# 🏗️ Real-world & System Design Questions

---

## Q26. How would Amazon design a Search System?

### Answer

Amazon would combine:

- Search indexing
- Autocomplete
- Personalization
- Ranking algorithms
- Filters
- Backend search services
- Caching

to deliver fast and relevant results.

---

## Q27. Why is frontend search different from backend search?

### Answer

Frontend search usually works with local or already-loaded data.

Backend search queries databases or search engines such as Elasticsearch to retrieve matching records.

---

## Q28. How was the Search System verified in CartWise?

### Answer

The implementation was validated through:

- Functional testing
- Responsive testing
- URL synchronization
- Search suggestions
- Filters
- Sorting
- Pagination
- Accessibility verification

The project also passed:

- TypeScript verification
- ESLint verification
- Production build verification

before being committed.

---

## Q29. What are common mistakes when implementing search?

### Answer

Common mistakes include:

- Ignoring URL synchronization
- Using fixed layouts
- Re-rendering unnecessarily
- Mixing UI and business logic
- Not handling empty or error states

---

## Q30. Why was the Search System implemented before Product Details?

### Answer

Users must first discover products before viewing their details.

Building Search first establishes the primary navigation flow:

Homepage → Search → Product Details.

This provides a natural progression for the application's architecture.

---

# 📌 Key Takeaways

After completing these questions, you should be able to explain:

- How a Search System works.
- Why search, filtering, and sorting are separate concerns.
- The benefits of URL synchronization.
- How reusable Product Cards simplify development.
- Why debouncing improves performance.
- How CartWise implements a scalable and responsive Search System.
