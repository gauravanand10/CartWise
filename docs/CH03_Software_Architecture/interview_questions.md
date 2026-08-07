# 🎯 CH03 — Interview Questions

> This chapter focuses on the **Software Architecture** of CartWise. These questions cover project organization, scalability, maintainability, and architectural decision-making.

---

# 📚 Beginner Level

---

## Q1. What is Software Architecture?

### Answer

Software Architecture is the high-level blueprint of a software application.

It defines:

- How the project is organized
- How different modules communicate
- How responsibilities are divided
- How the application scales over time

A good architecture makes software easier to maintain, test, and extend.

---

## Q2. Why is Software Architecture important?

### Answer

Without a proper architecture, projects quickly become difficult to manage.

Good architecture provides:

- Better code organization
- Easier maintenance
- Improved scalability
- Clear separation of responsibilities
- Faster onboarding for new developers

---

## Q3. What architecture does CartWise use?

### Answer

CartWise follows a **Feature-First Architecture**.

Instead of grouping files only by type, related files are grouped by feature.

This improves scalability and keeps related code together.

---

## Q4. What is Feature-First Architecture?

### Answer

Feature-First Architecture organizes code around business features.

Example:

```text
features/
├── homepage/
├── search/
├── compare/
└── wishlist/
```

Each feature owns everything it needs.

---

## Q5. What is a Component?

### Answer

A Component is a reusable UI building block.

Examples:

- Button
- ProductCard
- Navbar
- SearchBar

Components reduce duplication and improve consistency.

---

## Q6. What is a Page?

### Answer

A Page represents an entire screen within the application.

Examples:

- Home
- Search
- Compare
- Wishlist

Pages combine multiple reusable components.

---

## Q7. What is a Layout?

### Answer

A Layout is a reusable page structure shared across multiple pages.

Examples include:

- Navbar
- Footer
- Main Content Area

Layouts prevent repeating common UI across pages.

---

## Q8. What is a Utility Function?

### Answer

Utility functions are reusable helper functions.

Examples:

- Currency Formatting
- Date Formatting
- String Manipulation

Utilities keep business logic reusable and organized.

---

## Q9. What is a Hook?

### Answer

Hooks are reusable functions that encapsulate shared logic.

Custom hooks prevent duplicated logic between components.

---

## Q10. What is a Service?

### Answer

A Service handles business logic or communication with external systems.

Examples:

- API Requests
- Authentication
- Product Fetching

CartWise will introduce services during backend integration.

---

# 🚀 Intermediate Level

---

## Q11. Why did CartWise choose Feature-First Architecture?

### Answer

Feature-First Architecture keeps all files related to a feature together.

Benefits include:

- Easier navigation
- Better scalability
- Simpler maintenance
- Clear ownership

---

## Q12. What are the disadvantages of organizing projects only by file type?

### Answer

Type-based organization often separates related files.

Developers constantly switch between multiple folders to work on a single feature.

As projects grow, navigation becomes difficult.

---

## Q13. What is Separation of Concerns?

### Answer

Separation of Concerns means each part of the application should have one clear responsibility.

Example:

- Components → UI
- Services → Business Logic
- Hooks → Shared Logic
- Utils → Helper Functions

---

## Q14. What makes an architecture scalable?

### Answer

Scalable architectures are:

- Modular
- Reusable
- Loosely coupled
- Easy to extend

These characteristics reduce future maintenance costs.

---

## Q15. Why are reusable components important?

### Answer

Reusable components:

- Reduce duplicate code
- Improve consistency
- Simplify maintenance
- Speed up development

---

## Q16. Why should business logic stay outside components?

### Answer

Components should focus on displaying UI.

Business logic belongs inside services or hooks.

This separation improves readability and testing.

---

## Q17. What are Constants?

### Answer

Constants are values that rarely change.

Examples:

- Routes
- Theme Colors
- API URLs
- Animation Durations

Keeping constants centralized improves maintainability.

---

## Q18. What are Types?

### Answer

Types describe the shape of data in TypeScript.

They improve:

- Type Safety
- Autocomplete
- Refactoring
- Readability

---

## Q19. Why use Assets Folder?

### Answer

Assets store static resources.

Examples:

- Images
- Fonts
- Icons

Organizing assets separately keeps the project clean.

---

## Q20. Why should mock data be separated from components?

### Answer

Separating mock data allows components to focus only on rendering.

When backend APIs are introduced, only the data source changes—not the UI.

---

# 🔥 Advanced Level

---

## Q21. How does Feature-First Architecture improve scalability?

### Answer

As new features are added, each one remains isolated.

This prevents unrelated modules from becoming tightly coupled and makes future development easier.

---

## Q22. When would Layer-Based Architecture be preferred?

### Answer

Layer-Based Architecture is useful for small applications where the number of features is limited.

As projects grow, Feature-First Architecture generally becomes easier to maintain.

---

## Q23. How does architecture reduce technical debt?

### Answer

Good architecture encourages:

- Reusability
- Consistency
- Modular Design
- Clear Responsibilities

These practices reduce duplicate code and future refactoring.

---

## Q24. Why shouldn't components directly fetch APIs?

### Answer

Direct API calls tightly couple UI with business logic.

Using services separates concerns and improves:

- Testing
- Maintainability
- Reusability

---

## Q25. How does architecture affect team productivity?

### Answer

A well-organized project allows developers to:

- Find files quickly
- Understand project structure
- Work independently
- Reduce merge conflicts

---

# 🏗️ Real-world & System Design Questions

---

## Q26. How would the CartWise architecture change when the backend is added?

### Answer

The frontend structure would largely remain unchanged.

New services would communicate with backend APIs while components continue focusing on presentation.

---

## Q27. How would you organize a project with 100+ features?

### Answer

A Feature-First Architecture is recommended.

Each feature should own:

- Components
- Hooks
- Services
- Types
- Tests

This keeps the project modular.

---

## Q28. Why do companies invest heavily in software architecture?

### Answer

Architecture decisions influence the entire software lifecycle.

Changing architecture after implementation is expensive.

Planning it early reduces long-term maintenance costs.

---

## Q29. What architectural mistake do beginners commonly make?

### Answer

Keeping everything inside a single folder.

As projects grow, this becomes difficult to navigate and maintain.

Organizing code from the beginning avoids future restructuring.

---

## Q30. Why is Software Architecture covered before implementing more features?

### Answer

Architecture defines the foundation upon which every future feature is built.

Without a proper structure, adding routing, authentication, AI, or backend functionality becomes significantly harder.

---

# 📌 Key Takeaways

After completing these questions, you should be able to explain:

- What Software Architecture is.
- Why CartWise uses Feature-First Architecture.
- How architecture improves scalability.
- The responsibilities of components, pages, layouts, hooks, services, and utilities.
- How good architecture reduces technical debt and improves maintainability.
