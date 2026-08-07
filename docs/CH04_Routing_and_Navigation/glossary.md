# 📖 CH04 — Glossary

> This glossary explains the routing and navigation terminology used throughout the CartWise project.

---

# 🌐 Routing

Routing is the process of deciding **which page should be displayed** when a user visits a particular URL.

Instead of loading a completely new website, modern React applications change the displayed page without refreshing the browser.

### CartWise Context

Routing allows users to move between pages such as:

- Home
- Search
- Product Details
- Wishlist
- Compare

---

# 🧭 Navigation

Navigation is the mechanism that allows users to move from one page to another.

Examples include:

- Navbar Links
- Search Results
- Buttons
- Logo
- Breadcrumbs

Good navigation makes an application intuitive and easy to use.

---

# ⚛️ React Router

React Router is the routing library used in CartWise.

It enables:

- Client-side routing
- Nested routes
- Dynamic routes
- Layout-based routing
- Navigation without full page refresh

---

# 🌍 BrowserRouter

`BrowserRouter` is the top-level routing provider.

It listens to changes in the browser URL and tells React which page should be rendered.

Every page inside CartWise exists within `BrowserRouter`.

---

# 🛣️ Route

A Route maps a URL to a React component.

Example:

```text
/ → Home
/search → Search
/wishlist → Wishlist
```

Each route represents a destination inside the application.

---

# 🗺️ Routes

`Routes` is the container that holds all Route definitions.

React checks each route and renders the one that matches the current URL.

---

# 📄 Page

A Page represents a complete screen displayed to the user.

Examples:

- Home
- Search
- Product Details
- Compare
- Wishlist

Each page is connected to a route.

---

# 🧱 Layout

A Layout defines the common structure shared across multiple pages.

Examples include:

- Navbar
- Footer
- Main Content Area

Instead of repeating these components on every page, CartWise uses layouts.

---

# 🏠 MainLayout

`MainLayout` is the primary layout used throughout CartWise.

It provides:

- Navbar
- Page Content
- Footer

Every page wrapped by `MainLayout` automatically receives this common structure.

---

# 📤 Outlet

`Outlet` is a placeholder provided by React Router.

It tells React where the currently matched page should appear inside a layout.

Without `Outlet`, nested pages would never be rendered.

---

# 🔗 Nested Routing

Nested Routing allows one route to exist inside another.

Instead of rebuilding the entire page, only the changing content is replaced.

This keeps shared UI elements such as the Navbar and Footer intact.

---

# 🏷️ URL

A URL (Uniform Resource Locator) is the address used to access a page.

Examples:

```text
/
```

```text
/search
```

```text
/compare
```

Each URL corresponds to a specific route.

---

# 🔄 Client-Side Routing

Client-side routing changes pages **without refreshing the browser**.

Advantages:

- Faster navigation
- Better user experience
- Less server communication

CartWise uses client-side routing.

---

# 📌 Navigation Flow

Navigation Flow describes how users move through the application.

Typical CartWise flow:

```text
Home
   │
   ▼
Search
   │
   ▼
Product Details
   │
   ▼
Compare
   │
   ▼
Wishlist
```

Designing a clear navigation flow improves usability.

---

# 🎯 AppRoutes

`AppRoutes` is the centralized file responsible for defining all routes in CartWise.

Keeping routes in one place improves:

- Maintainability
- Readability
- Scalability

---

# 🚪 Route Protection

Route Protection limits access to certain pages.

Examples:

- Dashboard
- Profile
- Admin Panel

### CartWise Context

This feature is planned for future chapters when authentication is implemented.

---

# 🔀 Dynamic Route

A Dynamic Route contains variables within the URL.

Example:

```text
/products/:id
```

The value changes depending on the selected product.

### CartWise Context

Dynamic routes will be introduced in the Product Details chapter.

---

# 📌 Summary

Routing is the backbone of navigation in CartWise. By combining **React Router**, **BrowserRouter**, **Routes**, **Route**, **MainLayout**, and **Outlet**, the application provides a fast, seamless, and scalable navigation experience while maintaining a consistent user interface across all pages.
