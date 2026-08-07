# 🧭 CH04 — Routing & Navigation

> **Project:** CartWise  
> **Chapter:** Routing & Navigation

---

# 👋 Welcome

Imagine opening an application where every button refreshes the entire website.

Click Home...

The page reloads.

Click Wishlist...

The page reloads again.

Click Compare...

Another refresh.

Modern web applications don't work this way.

Applications like Amazon, Netflix, YouTube, GitHub, and Spotify feel incredibly smooth because they use **client-side routing**, allowing users to move between pages almost instantly.

CartWise follows the same approach.

This chapter introduces the routing system that connects every page of the application while maintaining a fast and seamless user experience.

---

# 🎯 Learning Objectives

By the end of this chapter, you will:

- Understand why routing is essential.
- Learn how navigation works in modern React applications.
- Understand why CartWise uses React Router.
- Learn how shared layouts improve maintainability.
- Understand nested routing.
- Learn how users move throughout the application.

---

# 🤔 Why Do We Need Routing?

Imagine CartWise had only one page.

Everything would be displayed together:

- Homepage
- Search
- Product Details
- Wishlist
- Compare

As the project grows, this quickly becomes impossible to maintain.

Users expect different URLs for different pages.

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

```text
/wishlist
```

Routing makes this possible.

---

# 🌍 How Users Navigate CartWise

A user rarely visits just one page.

A typical journey looks like this:

```text
Home
   │
   ▼
Search Products
   │
   ▼
View Product
   │
   ▼
Compare Products
   │
   ▼
Save to Wishlist
```

Every arrow in this journey is handled by the routing system.

Without routing, this experience would feel slow and disconnected.

---

# ⚛️ Why React Router?

React itself focuses only on building user interfaces.

Navigation is a separate concern.

React Router provides everything required to build a modern navigation system.

It allows CartWise to:

- Navigate instantly
- Maintain browser history
- Support nested pages
- Create clean URLs
- Build scalable navigation

It has become the standard routing solution for React applications.

---

# 🏗️ One Layout, Multiple Pages

Notice something common across most websites.

No matter which page you visit, certain elements never change.

Examples include:

- Navigation Bar
- Footer
- Search Bar
- Theme

Only the main content changes.

Instead of rebuilding these sections for every page, CartWise uses a shared layout.

This reduces duplicate code and keeps the user experience consistent.

---

# 🔄 Understanding Nested Routing

Think of the application like a picture frame.

The frame never changes.

Only the picture inside changes.

The frame represents:

- Navbar
- Footer
- Shared Layout

The picture represents:

- Home
- Search
- Wishlist
- Compare

Nested Routing allows us to replace only the page content while keeping the surrounding interface intact.

---

# 🚀 Navigation Without Reloading

One of the biggest advantages of modern routing is speed.

Instead of requesting an entirely new webpage from the server, React simply replaces the necessary content.

This results in:

- Faster navigation
- Better responsiveness
- Smoother user experience

The browser still updates the URL, but the application remains loaded.

---

# 📂 Routing Structure

At this stage, CartWise introduces a centralized routing structure.

```text
src/
├── routes/
│   └── AppRoutes.tsx
│
├── layouts/
│   └── MainLayout.tsx
│
└── pages/
    ├── HomePage.tsx
    ├── SearchPage.tsx
    ├── ComparePage.tsx
    └── WishlistPage.tsx
```

Keeping routing organized makes future development much easier.

---

# 🌍 CartWise Implementation

During this chapter, the following routing foundation was implemented:

- React Router installed
- BrowserRouter configured
- AppRoutes created
- MainLayout introduced
- Navigation flow established
- Initial application pages connected

Future chapters will continue expanding this routing structure as additional features are implemented.

---

# 🏗️ Engineering Philosophy

Routing is more than simply changing pages.

It defines how users experience the application.

CartWise follows a few simple principles.

### One Route, One Responsibility

Each page has a clear purpose.

Every URL should represent a meaningful destination.

---

### Shared Layouts

Common UI elements should never be duplicated.

Layouts allow one implementation to be reused across the application.

---

### Predictable Navigation

Users should always know where they are and where they can go next.

Clear navigation improves usability and accessibility.

---

### Build for Future Growth

Although CartWise currently contains only a few pages, the routing system is designed to support many more in the future.

New pages can be added without restructuring the existing application.

---

# 🌟 Why This Chapter Matters

Routing is the bridge between every feature in CartWise.

Without it:

- Users cannot search.
- Users cannot compare products.
- Users cannot access their wishlist.
- Users cannot explore the application naturally.

Every future feature depends on the routing system established in this chapter.

---

# 📈 Looking Ahead

The routing system built here will later support:

- Product Details
- Authentication
- Dashboard
- Admin Panel
- AI Assistant
- User Profile
- Protected Routes
- Dynamic URLs

The architecture introduced now ensures these additions can be integrated smoothly.

---

# 📌 Key Takeaways

- Routing connects every page of the application.
- React Router powers navigation in CartWise.
- Shared layouts reduce duplicate code.
- Nested routing improves maintainability.
- Client-side routing creates a faster user experience.
- A scalable routing system supports future application growth.

---

# ➡️ What's Next?

With navigation now in place, the next step is creating a consistent visual language for the application.

In the next chapter, we'll build the **Design System**, establishing colors, typography, spacing, shadows, animations, and reusable design tokens that will give CartWise a unified and professional appearance.
