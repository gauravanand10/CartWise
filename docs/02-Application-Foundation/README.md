# Chapter 2 — Application Foundation

> "Before building features, every scalable application requires a strong architectural foundation."

---

# Table of Contents

1. Learning Objectives
2. Problem Statement
3. What We Built
4. Why Do We Need Application Architecture?
5. What is Client-Side Routing?
6. Why Shared Layout?
7. Engineering Goals
8. Folder Structure
9. Components Created
10. Pages Created
11. Why React Router?
12. Navigation System
13. Dynamic Routing
14. 404 Not Found Route
15. Commands Used
16. Internal Working
17. Application in CartWise
18. Industry Practices
19. Alternatives Considered
20. Common Mistakes
21. Debugging Journey
22. Best Practices
23. Interview Questions
24. Summary
25. Key Takeaways
26. Chapter Status

---

# Learning Objectives

After completing this chapter, you should understand:

- Why application architecture is important.
- How professional frontend projects are organized.
- Why routing is required.
- Difference between client-side and server-side routing.
- Why React Router is used.
- How BrowserRouter works.
- What layouts are.
- Why layouts improve maintainability.
- Why pages and components are separated.
- How dynamic routes work.
- How React handles 404 pages.
- How scalable folder structures are designed.

---

# Problem Statement

After setting up the development environment, CartWise still consisted of only a single React component.

Without proper architecture:

- Every page would exist inside App.tsx.
- Navigation would require full page reloads.
- Code would become difficult to maintain.
- Components would be duplicated.
- Future scaling would become challenging.

The second engineering milestone was therefore to establish a scalable frontend architecture before implementing actual product features.

---

# What We Built

During this chapter we completed:

✅ Organized the project into feature-based folders

✅ Created reusable layout components

✅ Created Navbar

✅ Created Footer

✅ Created MainLayout

✅ Installed and configured React Router

✅ Implemented client-side routing

✅ Created Home page

✅ Created Compare page

✅ Created Wishlist page

✅ Created Product Details page

✅ Implemented dynamic product route

✅ Added custom 404 page

✅ Separated reusable components

✅ Added constants, hooks, services, types and utilities folders

✅ Verified navigation between pages

✅ Successfully committed and pushed the architecture to GitHub

At the end of this chapter, CartWise had a scalable frontend architecture ready for feature development.

---

# Why Do We Need Application Architecture?

Application architecture defines how software is organized before functionality is added.

Instead of placing everything inside one file, responsibilities are divided into smaller reusable modules.

Benefits include:

- Better maintainability
- Easier debugging
- Higher scalability
- Team collaboration
- Code reuse
- Clear separation of concerns

A good architecture makes future development faster and more reliable.

---

# What is Client-Side Routing?

Client-side routing allows navigation between pages without reloading the browser.

Instead of requesting a new HTML page from the server, React replaces only the component displayed inside the application.

Benefits include:

- Faster navigation
- Better user experience
- Reduced server requests
- Smooth transitions
- Single Page Application (SPA) behavior

CartWise uses React Router to implement client-side routing.

---

# Why Shared Layout?

Every page in CartWise shares common elements such as:

- Navbar
- Footer

Instead of repeating these components in every page, they are placed inside a shared layout.

Benefits:

- No duplicate code
- Easier maintenance
- Consistent user interface
- Single point of modification

---

# Engineering Goals

Our objectives were:

- Build a scalable architecture.
- Separate pages from reusable components.
- Enable navigation without page refresh.
- Prepare for future feature development.
- Follow professional frontend practices.
- Reduce code duplication.

---

# Folder Structure

```
src/

│

├── assets/

├── components/
│   ├── common/
│   ├── layout/
│   └── ui/

├── constants/

├── hooks/

├── pages/
│   ├── Home/
│   ├── Compare/
│   ├── Wishlist/
│   ├── Product/
│   └── NotFound/

├── routes/

├── services/

├── types/

├── utils/

├── App.tsx

├── main.tsx

└── index.css
```

---

# Components Created

## Layout Components

- Navbar
- Footer
- MainLayout

---

## Common Components

- Button
- Loader

---

## UI Components

- Card
- Input

---

# Pages Created

- Home
- Compare
- Wishlist
- Product Details
- 404 Not Found

Each page currently contains placeholder content that will be expanded in future chapters.

---

# Why React Router?

React Router provides routing capabilities for React applications.

Responsibilities include:

- URL management
- Navigation
- Dynamic routes
- Nested routes
- Route parameters
- 404 handling

It is the industry standard routing library for React applications.

---

# Navigation System

The navigation bar currently connects:

```
Home

↓

Compare

↓

Wishlist
```

Navigation occurs instantly without refreshing the browser.

This demonstrates client-side routing.

---

# Dynamic Routing

CartWise includes the route:

```
/product/:id
```

Example:

```
/product/1

/product/25

/product/100
```

Instead of creating hundreds of individual pages, one component renders different products based on the route parameter.

This improves scalability and reduces duplication.

---

# 404 Not Found Route

A catch-all route was implemented using:

```
*
```

If a user visits a route that does not exist, React automatically renders the custom Not Found page.

Example:

```
/random-page
```

Result:

```
404

The page you are looking for does not exist.

Return Home
```

This provides a better user experience than displaying a blank screen or browser error.

---

# Commands Used

Install React Router

```
npm install react-router-dom
```

Run Development Server

```
npm run dev
```

Git Status

```
git status
```

Stage Changes

```
git add .
```

Commit

```
git commit -m "feat: implement application foundation with routing and shared layout"
```

Push

```
git push origin main
```

---

# Internal Working

When the browser loads CartWise:

1. main.tsx renders the React application.

2. BrowserRouter starts listening to URL changes.

3. AppRoutes matches the current URL.

4. MainLayout renders:

- Navbar
- Current Page
- Footer

5. React updates only the page component while keeping the layout unchanged.

This enables smooth navigation without refreshing the browser.

---

# Application in CartWise

This architecture forms the foundation for:

- Homepage
- Product Search
- Product Details
- Comparison Engine
- Wishlist
- Authentication
- Dashboard
- Admin Panel

Every future feature will reuse the architecture established in this chapter.

---

# Industry Practices

Professional frontend teams typically:

- Separate pages and components.
- Use routing libraries.
- Build reusable layouts.
- Organize code by responsibility.
- Avoid duplication.
- Create scalable folder structures.

CartWise follows these practices.

---

# Alternatives Considered

Instead of React Router:

- Next.js App Router
- TanStack Router
- Reach Router

Instead of Feature-Based Structure:

- Flat folder structure
- MVC-inspired structure

React Router with a modular folder hierarchy was chosen because it is widely adopted, scalable, and well suited for medium to large React applications.

---

# Common Mistakes

- Placing all code inside App.tsx
- Repeating Navbar and Footer in every page
- Forgetting BrowserRouter
- Incorrect route paths
- Missing catch-all route
- Mixing pages and reusable components
- Poor folder organization

---

# Debugging Journey

During this chapter we encountered several real issues.

### Issue 1

Navigation links were not working.

Reason:

React Router had not been configured.

Solution:

Installed and configured `react-router-dom`.

---

### Issue 2

Shared components were duplicated across pages.

Reason:

Navbar and Footer were placed directly inside each page.

Solution:

Introduced a reusable `MainLayout` component.

---

### Issue 3

Product pages required individual files.

Reason:

Static routing does not scale.

Solution:

Implemented dynamic routing using:

```
/product/:id
```

---

### Issue 4

Unknown URLs displayed no useful information.

Reason:

No fallback route was configured.

Solution:

Added a catch-all `*` route to render a custom 404 page.

---

# Best Practices

- Keep pages focused on page-level logic.
- Build reusable UI components.
- Use layouts to avoid duplication.
- Organize folders by responsibility.
- Prefer dynamic routes when appropriate.
- Implement custom 404 pages.
- Keep routing centralized.

---

# Interview Questions

### What is client-side routing?

Client-side routing changes the displayed page without reloading the browser by updating the URL and rendering different React components.

---

### Why use React Router?

It provides navigation, dynamic routes, nested routes, route parameters, and better SPA behavior.

---

### What is BrowserRouter?

BrowserRouter listens to URL changes and synchronizes them with React components using the browser's History API.

---

### What is a layout component?

A layout component contains shared UI elements such as navigation bars, sidebars, and footers that are reused across multiple pages.

---

### What are dynamic routes?

Dynamic routes use URL parameters to render different data using the same page component.

Example:

```
/product/:id
```

---

### Why separate pages and components?

Pages represent complete screens, while components are reusable building blocks. Separating them improves maintainability and reusability.

---

# Summary

In this chapter we transformed CartWise from a single-page application into a scalable frontend architecture.

We organized the project into a professional folder structure, introduced reusable layouts, configured React Router, implemented navigation, created placeholder pages, added dynamic routing, and handled unknown routes with a custom 404 page.

This architecture now provides the foundation for all future application features.

---

# Key Takeaways

- Application architecture should be established before feature development.
- Routing enables smooth navigation without page reloads.
- Shared layouts eliminate duplicate code.
- Dynamic routes improve scalability.
- Organized folder structures simplify maintenance.
- React Router is the industry standard routing solution.
- A well-designed architecture accelerates future development.

---

# Chapter Status

**Status:** ✅ Completed

**Milestone Achieved:** Application Foundation

**Next Chapter:** Home Experience
