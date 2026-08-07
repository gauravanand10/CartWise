# 🎯 CH02 — Interview Questions

> This chapter focuses on **Project Initialization**. These questions are commonly asked in Frontend, React, JavaScript, and Software Engineering interviews.

---

# 📚 Beginner Level

---

## Q1. What is Project Initialization?

### Answer

Project Initialization is the process of preparing the development environment before actual feature development begins.

It typically includes:

- Creating the project
- Installing dependencies
- Setting up the programming language
- Configuring the build tool
- Initializing version control

For CartWise, project initialization was completed using **Vite, React, TypeScript, Tailwind CSS, and npm**.

---

## Q2. Why is Project Initialization important?

### Answer

Project Initialization creates a consistent development environment for every developer working on the project.

Benefits include:

- Organized project structure
- Faster development
- Standardized tooling
- Easier collaboration
- Better maintainability

Skipping initialization often leads to configuration problems later.

---

## Q3. What is Node.js?

### Answer

Node.js is a JavaScript runtime that allows JavaScript to run outside the browser.

It enables developers to:

- Install packages
- Run build tools
- Execute scripts
- Start development servers

Node.js powers the development environment of CartWise.

---

## Q4. What is npm?

### Answer

npm (Node Package Manager) is the default package manager for Node.js.

It is used to:

- Install dependencies
- Update packages
- Remove packages
- Execute project scripts

---

## Q5. What is a Package?

### Answer

A package is a reusable piece of software distributed through npm.

Examples include:

- React
- Tailwind CSS
- React Router
- Axios

---

## Q6. What is package.json?

### Answer

The `package.json` file stores project metadata.

It contains:

- Project name
- Version
- Scripts
- Dependencies
- Development dependencies

It acts as the central configuration file of a Node.js project.

---

## Q7. What is React?

### Answer

React is a JavaScript library used for building user interfaces through reusable components.

Advantages include:

- Component-based architecture
- Virtual DOM
- Reusability
- Better maintainability

---

## Q8. Why was React chosen for CartWise?

### Answer

React was selected because it provides:

- Reusable Components
- Large Community
- Excellent Ecosystem
- Strong TypeScript Support
- Easy Scalability

It aligns well with the long-term goals of CartWise.

---

## Q9. What is TypeScript?

### Answer

TypeScript is a statically typed superset of JavaScript.

It provides:

- Type Safety
- Better IDE Support
- Early Error Detection
- Improved Maintainability

---

## Q10. Why use TypeScript instead of JavaScript?

### Answer

TypeScript reduces runtime errors by catching mistakes during development.

Advantages include:

- Compile-time error detection
- Better autocomplete
- Strong typing
- Easier refactoring
- Improved readability

---

# 🚀 Intermediate Level

---

## Q11. What is Vite?

### Answer

Vite is a modern frontend build tool designed for speed.

Features:

- Instant startup
- Fast Hot Module Replacement (HMR)
- Optimized production builds
- Minimal configuration

CartWise uses Vite for project initialization.

---

## Q12. Why Vite instead of Create React App?

### Answer

Vite offers several advantages:

- Much faster startup
- Faster Hot Reloading
- Smaller configuration
- Better build performance
- Modern tooling

These improvements make development significantly more efficient.

---

## Q13. What is Tailwind CSS?

### Answer

Tailwind CSS is a utility-first CSS framework.

Instead of writing custom CSS classes, developers compose interfaces using predefined utility classes.

Example:

```html
<div class="flex items-center justify-center p-4">
```

---

## Q14. Why was Tailwind CSS chosen?

### Answer

Tailwind CSS was selected because it provides:

- Faster UI development
- Consistent design
- Reusable utility classes
- Easy responsiveness
- Excellent maintainability

---

## Q15. What is a Development Environment?

### Answer

A Development Environment is the complete collection of software used to build applications.

CartWise Development Environment:

- VS Code
- Node.js
- npm
- Vite
- Chrome
- Git

---

## Q16. What are Dependencies?

### Answer

Dependencies are external libraries required by the project.

Examples:

- React
- React DOM
- Tailwind CSS
- Lucide React

They are installed using npm.

---

## Q17. What is Hot Module Replacement (HMR)?

### Answer

HMR updates only the modified parts of an application without refreshing the entire webpage.

Benefits:

- Faster development
- Preserved application state
- Improved productivity

---

## Q18. What is a Build Tool?

### Answer

A Build Tool automates development tasks.

Responsibilities include:

- Bundling
- Compilation
- Asset Optimization
- Development Server
- Production Build

CartWise uses Vite.

---

## Q19. What is Compilation?

### Answer

Compilation converts TypeScript source code into JavaScript that browsers can execute.

---

## Q20. What is Bundling?

### Answer

Bundling combines multiple JavaScript, CSS, and asset files into optimized files for deployment.

---

# 🔥 Advanced Level

---

## Q21. Why is TypeScript better for large projects?

### Answer

Large applications benefit from:

- Type Safety
- Better Refactoring
- Reduced Runtime Errors
- Improved Collaboration
- Better IDE Support

These advantages become increasingly important as projects grow.

---

## Q22. What happens internally when running `npm install`?

### Answer

npm:

1. Reads `package.json`
2. Downloads dependencies
3. Resolves dependency versions
4. Creates `node_modules`
5. Generates or updates `package-lock.json`

---

## Q23. Why shouldn't `node_modules` be committed to Git?

### Answer

Because:

- It is extremely large.
- It can always be regenerated using `npm install`.
- It increases repository size unnecessarily.

Instead, projects commit:

- package.json
- package-lock.json

---

## Q24. What is package-lock.json?

### Answer

`package-lock.json` records the exact versions of installed packages.

This ensures every developer installs identical dependency versions, improving consistency across environments.

---

## Q25. Explain the relationship between Node.js and npm.

### Answer

Node.js is the runtime.

npm is the package manager bundled with Node.js.

Node.js executes JavaScript, while npm manages packages and project scripts.

---

# 🏗️ Real-world & System Design Questions

---

## Q26. Why should every project use a standard initialization process?

### Answer

A standardized initialization process ensures:

- Consistent environments
- Easier onboarding
- Fewer configuration issues
- Improved collaboration
- Predictable project structure

---

## Q27. Why do companies prefer standardized tooling?

### Answer

Using common tools such as React, TypeScript, and Vite allows teams to:

- Share knowledge
- Improve maintainability
- Reduce onboarding time
- Increase developer productivity

---

## Q28. If you were starting CartWise today, would you choose different technologies?

### Answer

Given the current project goals, the selected stack remains appropriate.

React, TypeScript, and Vite provide an excellent balance of performance, ecosystem support, and scalability for a frontend-first application.

---

## Q29. How does proper initialization affect future scalability?

### Answer

Good initialization establishes:

- Consistent project structure
- Reliable tooling
- Standard configurations
- Maintainable codebase

These decisions reduce future technical debt and simplify scaling.

---

## Q30. Why is Chapter 2 important before writing application features?

### Answer

Every feature developed later depends on the environment established in this chapter.

Without a properly initialized project:

- Dependencies cannot be managed.
- The application cannot be compiled.
- Development servers cannot run.
- Team collaboration becomes difficult.

Project Initialization provides the foundation upon which the rest of CartWise is built.

---

# 📌 Key Takeaways

After completing these interview questions, you should be able to explain:

- What Project Initialization is.
- Why Node.js and npm are required.
- Why React, TypeScript, Vite, and Tailwind CSS were selected.
- How npm manages dependencies.
- What happens internally during project setup.
- Why proper initialization is essential for building scalable software.
