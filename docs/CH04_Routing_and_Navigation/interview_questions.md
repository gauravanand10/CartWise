# 🎯 CH04 — Interview Questions

> This chapter focuses on **Routing & Navigation** in React applications using **React Router**. These questions cover routing concepts, layouts, nested routes, navigation flow, and best practices.

---

# 📚 Beginner Level

---

## Q1. What is Routing?

### Answer

Routing is the process of deciding which page or component should be displayed based on the current URL.

In traditional websites, changing the URL loads a completely new page.

In React applications, routing usually happens on the client side, allowing users to navigate without refreshing the browser.

---

## Q2. Why is Routing important?

### Answer

Routing allows users to move between different pages of an application while maintaining a smooth user experience.

Without routing, every page would require a separate application or a full page reload.

---

## Q3. What is React Router?

### Answer

React Router is the official routing library for React.

It enables:

- Client-side routing
- Nested routing
- Dynamic routing
- Layout-based routing
- Route protection

CartWise uses React Router to manage navigation across the application.

---

## Q4. What is BrowserRouter?

### Answer

BrowserRouter is the top-level routing component.

It listens for URL changes and determines which page should be rendered.

Every route inside CartWise exists within BrowserRouter.

---

## Q5. What is a Route?

### Answer

A Route connects a URL to a React component.

Example:

```text
/           → Home
/search     → Search
/wishlist   → Wishlist
```

Each Route represents one destination in the application.

---

## Q6. What is the Routes component?

### Answer

Routes is a container that holds all Route components.

It compares the current URL with available routes and renders the matching page.

---

## Q7. What is Navigation?

### Answer

Navigation is the process of moving between different pages.

Examples include:

- Navbar links
- Buttons
- Search results
- Product cards

Good navigation improves usability.

---

## Q8. What is a Layout?

### Answer

A Layout is a reusable page structure shared across multiple pages.

Examples:

- Navbar
- Footer
- Sidebar

Layouts prevent duplicate code.

---

## Q9. What is MainLayout?

### Answer

MainLayout is the primary layout used in CartWise.

It provides:

- Navbar
- Footer
- Main Content Area

All public pages share this layout.

---

## Q10. What is Outlet?

### Answer

Outlet is a placeholder used by React Router.

It tells React where child pages should be rendered inside a layout.

Without Outlet, nested pages cannot be displayed.

---

# 🚀 Intermediate Level

---

## Q11. What is Client-Side Routing?

### Answer

Client-side routing updates the displayed page without refreshing the browser.

Advantages:

- Faster navigation
- Better user experience
- Reduced server requests

---

## Q12. Difference between Client-Side Routing and Server-Side Routing?

### Answer

Client-Side Routing:

- Handled by JavaScript
- No page refresh
- Faster navigation

Server-Side Routing:

- Server returns a new HTML page
- Browser refreshes completely
- Slower navigation

React applications primarily use Client-Side Routing.

---

## Q13. What are Nested Routes?

### Answer

Nested Routes allow one route to exist inside another.

Example:

```text
MainLayout
     │
     ▼
   Outlet
     │
     ▼
 Home / Search / Wishlist
```

Only the changing content is replaced.

---

## Q14. Why use Nested Routes?

### Answer

Nested Routes avoid repeating common UI elements.

Instead of rendering Navbar and Footer for every page, they are placed inside a shared layout.

---

## Q15. What is Navigation Flow?

### Answer

Navigation Flow describes how users move through an application.

Example:

```text
Home
 ↓
Search
 ↓
Product Details
 ↓
Compare
 ↓
Wishlist
```

A clear navigation flow improves usability.

---

## Q16. What is AppRoutes?

### Answer

AppRoutes is a centralized file where all application routes are defined.

Benefits:

- Easier maintenance
- Better readability
- Simpler scalability

---

## Q17. Why centralize routes?

### Answer

Keeping routes in one place:

- Avoids duplication
- Simplifies debugging
- Makes adding pages easier

---

## Q18. What is a Dynamic Route?

### Answer

A Dynamic Route contains variables.

Example:

```text
/products/:id
```

The page changes depending on the product ID.

---

## Q19. What is Route Protection?

### Answer

Route Protection restricts access to certain pages.

Examples:

- Dashboard
- Profile
- Admin Panel

Only authenticated users should access protected routes.

---

## Q20. Why doesn't CartWise currently use Route Protection?

### Answer

Authentication has not yet been implemented.

Route Protection will be introduced alongside authentication in a future chapter.

---

# 🔥 Advanced Level

---

## Q21. Why use Layout-Based Routing?

### Answer

Layout-Based Routing allows multiple pages to share common UI.

Benefits:

- Less duplicate code
- Easier maintenance
- Consistent user experience

---

## Q22. What happens internally when a route changes?

### Answer

React Router:

1. Detects the URL change.
2. Matches the correct route.
3. Finds the associated component.
4. Updates only the required part of the UI.

No full browser refresh occurs.

---

## Q23. Why is BrowserRouter preferred for SPAs?

### Answer

BrowserRouter uses the browser's History API.

Benefits:

- Clean URLs
- Better user experience
- Faster navigation

---

## Q24. What problems occur if routing is poorly designed?

### Answer

Poor routing can lead to:

- Broken navigation
- Duplicate pages
- Difficult maintenance
- Confusing URLs

---

## Q25. How does React Router improve scalability?

### Answer

It separates navigation logic from UI components.

As the application grows, new pages can be added without changing existing routes.

---

# 🏗️ Real-world & System Design Questions

---

## Q26. How would CartWise navigation change after backend integration?

### Answer

Public navigation remains mostly unchanged.

Additional authenticated routes such as Dashboard and Profile will be introduced.

---

## Q27. How would you organize routing in a large application?

### Answer

Use:

- Centralized route definitions
- Layout-based routing
- Feature-specific route modules
- Protected routes
- Lazy loading

---

## Q28. Why do large companies invest heavily in navigation design?

### Answer

Navigation directly affects:

- User Experience
- Accessibility
- Discoverability
- Conversion Rate

Poor navigation often leads to higher bounce rates.

---

## Q29. What is the biggest routing mistake beginners make?

### Answer

Duplicating layouts across pages.

Instead, shared UI should be placed inside reusable layouts using nested routing.

---

## Q30. Why is Routing introduced before building more features?

### Answer

Every major feature requires navigation.

Without routing, users cannot move between different sections of the application.

Establishing routing early creates the foundation for future pages and features.

---

# 📌 Key Takeaways

After completing these questions, you should be able to explain:

- What Routing is.
- Why React Router is used.
- The purpose of BrowserRouter, Routes, Route, MainLayout, and Outlet.
- The difference between Client-Side and Server-Side Routing.
- How Nested Routing improves maintainability.
- Why a well-designed navigation system is essential for scalable applications.
