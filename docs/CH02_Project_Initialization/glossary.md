# 📖 CH02 — Glossary

> This glossary explains the important terms introduced in **Chapter 2 – Project Initialization**. These concepts form the foundation of the CartWise development environment.

---

# A

## Application

An application is a software program designed to perform specific tasks for its users.

### CartWise Context

CartWise is a modern Single Page Application (SPA) built using React and TypeScript.

---

# B

## Build Tool

A build tool automates tasks required during software development.

Typical responsibilities include:

- Bundling files
- Compiling code
- Optimizing assets
- Starting development servers
- Hot Reloading

### CartWise Context

CartWise uses **Vite** as its build tool.

---

## Bundling

Bundling is the process of combining multiple JavaScript, CSS, and asset files into optimized output files for deployment.

---

# C

## CLI (Command Line Interface)

A text-based interface used to execute commands on a computer.

Examples:

```bash
npm install
npm run dev
git init
```

Developers commonly use the CLI to manage projects efficiently.

---

## Compilation

Compilation is the process of converting source code into another form that can be executed or optimized.

### CartWise Context

TypeScript code is compiled into JavaScript before running in the browser.

---

## Component

A Component is a reusable piece of UI.

Examples include:

- Button
- Navbar
- Card
- Search Bar

React applications are built by combining components.

---

# D

## Dependency

A dependency is an external package or library required by a project.

Examples:

- React
- React DOM
- Tailwind CSS
- Lucide React

Dependencies are managed through npm.

---

## Development Environment

The collection of tools used to build software.

A typical environment includes:

- Code Editor
- Runtime
- Package Manager
- Build Tool
- Browser

### CartWise Development Environment

- VS Code
- Node.js
- npm
- Vite
- Chrome
- Git

---

# F

## Framework

A framework provides a structured way to build applications.

Unlike a library, frameworks define much of the application's architecture and workflow.

### CartWise Context

React is commonly referred to as a frontend framework (though technically it is a UI library).

---

# H

## Hot Module Replacement (HMR)

Hot Module Replacement allows developers to see changes immediately without refreshing the entire webpage.

Benefits include:

- Faster development
- Preserved application state
- Improved productivity

Vite provides extremely fast HMR.

---

# J

## JavaScript

JavaScript is the programming language of the web.

It enables:

- Dynamic webpages
- User interaction
- API communication
- Browser logic

React is built using JavaScript.

---

# L

## Library

A library is a collection of reusable code that developers can use within their applications.

Examples:

- React
- Axios
- Lodash

Libraries provide functionality without dictating the overall application structure.

---

# M

## Module

A module is an individual file that exports reusable functionality.

Modules help organize code into smaller, maintainable units.

---

# N

## Node.js

Node.js is a JavaScript runtime that allows JavaScript to run outside the browser.

It is required for installing packages, running development servers, and building React applications.

### CartWise Context

Node.js powers the development workflow but is **not** used as the backend technology.

---

## npm (Node Package Manager)

npm is the default package manager for Node.js.

It is used to:

- Install dependencies
- Update packages
- Run scripts
- Manage project libraries

---

# P

## Package

A package is reusable software distributed through npm.

Examples include:

- React
- Tailwind CSS
- React Router

---

## package.json

The `package.json` file stores important project metadata.

It includes:

- Project name
- Version
- Dependencies
- Scripts

This file acts as the project's configuration file.

---

## Project Initialization

Project Initialization is the process of creating the base structure of a software application before feature development begins.

For CartWise, this includes:

- Creating the Vite project
- Installing dependencies
- Configuring Tailwind CSS
- Setting up TypeScript
- Preparing the development environment

---

# R

## React

React is a JavaScript library for building user interfaces using reusable components.

It enables:

- Component-based architecture
- Efficient rendering
- State management
- Reusable UI

### CartWise Context

React powers the entire frontend.

---

## Runtime

A runtime is the environment in which a program executes.

Node.js provides a JavaScript runtime outside the browser.

---

# S

## Script

A script is a predefined command stored inside `package.json`.

Examples:

```bash
npm run dev
npm run build
npm run preview
```

Scripts simplify common development tasks.

---

## SPA (Single Page Application)

A Single Page Application loads a single HTML page and dynamically updates content without reloading the entire website.

Advantages:

- Faster navigation
- Better user experience
- Reduced server requests

CartWise is an SPA.

---

# T

## Tailwind CSS

Tailwind CSS is a utility-first CSS framework.

Instead of writing traditional CSS files, developers compose designs using utility classes.

Example:

```html
<div class="flex items-center justify-center p-4">
```

---

## TypeScript

TypeScript is a statically typed superset of JavaScript.

It provides:

- Type Safety
- Better Autocomplete
- Early Error Detection
- Improved Maintainability

CartWise uses TypeScript throughout the project.

---

# U

## UI (User Interface)

The User Interface is the visual part of an application that users interact with.

Examples include:

- Buttons
- Cards
- Forms
- Navigation Bars

---

## Utility Classes

Utility classes are small CSS classes that perform one specific styling task.

Example:

```html
text-xl
rounded-lg
shadow-md
flex
```

Tailwind CSS is built around utility classes.

---

# V

## Vite

Vite is a modern frontend build tool optimized for speed.

Features include:

- Instant startup
- Fast Hot Module Replacement
- Optimized production builds
- Simple configuration

### CartWise Context

The CartWise project was initialized using Vite.

---

# VS Code

Visual Studio Code is the code editor used for developing CartWise.

Features include:

- IntelliSense
- Extensions
- Integrated Terminal
- Git Integration
- Debugging Support

---

# W

## Working Directory

The current folder in which terminal commands are executed.

Example:

```bash
cd cartwise
```

changes the working directory to the CartWise project.

---

# 📌 Summary

The terms introduced in this glossary represent the foundational technologies and tools used to initialize the CartWise project. Understanding these concepts will make it easier to follow the implementation, configuration, and development workflow covered throughout the remaining chapters of the handbook.
