# 💻 CH02 — Commands

> **Chapter:** Project Initialization

This chapter covers every command used to initialize the CartWise project and prepare the development environment.

---

# 📋 Prerequisites

Before creating the project, make sure the following software is installed on your system:

- Node.js
- npm (comes with Node.js)
- Git
- Visual Studio Code (Recommended)

---

# 1️⃣ Verify Node.js Installation

## Command

```bash
node -v
```

### Purpose

Checks whether Node.js is installed correctly.

### Example Output

```bash
v22.17.0
```

### Common Errors

```bash
'node' is not recognized...
```

### Solution

Install Node.js from the official website.

---

# 2️⃣ Verify npm Installation

## Command

```bash
npm -v
```

### Purpose

Checks whether npm is installed.

### Example Output

```bash
10.9.2
```

---

# 3️⃣ Check Git Installation

## Command

```bash
git --version
```

### Purpose

Verifies Git installation.

### Example Output

```bash
git version 2.49.0
```

---

# 4️⃣ Create React Project using Vite

## Command

```bash
npm create vite@latest
```

### Purpose

Creates a new Vite project.

During setup Vite asks:

```text
Project Name:
```

Example

```text
cartwise
```

Then

```text
Select Framework

React
```

Then

```text
Select Variant

TypeScript
```

---

# 5️⃣ Move into Project Directory

## Command

```bash
cd cartwise
```

### Purpose

Changes the terminal to the CartWise project folder.

---

# 6️⃣ Install Project Dependencies

## Command

```bash
npm install
```

### Purpose

Downloads every dependency listed inside

```text
package.json
```

This command automatically creates

```text
node_modules/
```

and

```text
package-lock.json
```

---

# 7️⃣ Start Development Server

## Command

```bash
npm run dev
```

### Purpose

Starts the local development server.

### Example Output

```text
Local: http://localhost:5173/
```

Open this URL inside your browser.

---

# 8️⃣ Stop Development Server

## Command

```text
CTRL + C
```

### Purpose

Stops the running development server.

---

# 9️⃣ Open Project in VS Code

## Command

```bash
code .
```

### Purpose

Opens the current folder in Visual Studio Code.

### Note

Requires the VS Code command-line tool to be installed.

---

# 🔟 Initialize Git Repository

## Command

```bash
git init
```

### Purpose

Initializes a Git repository for version control.

---

# 1️⃣1️⃣ Check Git Status

## Command

```bash
git status
```

### Purpose

Displays the current state of the repository.

Shows

- Modified Files
- New Files
- Deleted Files
- Staged Files

---

# 1️⃣2️⃣ Stage All Files

## Command

```bash
git add .
```

### Purpose

Stages every modified file.

---

# 1️⃣3️⃣ Create First Commit

## Command

```bash
git commit -m "Initial CartWise setup"
```

### Purpose

Creates the first commit of the project.

---

# 1️⃣4️⃣ Install Tailwind CSS

> **Note:** Use the command corresponding to the version of Tailwind CSS adopted by the project.

### Example

```bash
npm install tailwindcss @tailwindcss/vite
```

### Purpose

Installs Tailwind CSS and its Vite integration.

---

# 1️⃣5️⃣ Install Lucide React

## Command

```bash
npm install lucide-react
```

### Purpose

Installs the Lucide icon library used throughout CartWise.

---

# 1️⃣6️⃣ Install React Router

## Command

```bash
npm install react-router-dom
```

### Purpose

Installs React Router for client-side navigation.

> Although routing is covered in Chapter 4, the package may be installed during project setup.

---

# 📂 Files Created After Initialization

After completing the initialization process, the project contains files similar to:

```text
cartwise/
│── node_modules/
│── public/
│── src/
│── package.json
│── package-lock.json
│── tsconfig.json
│── vite.config.ts
│── index.html
```

---

# 🚨 Common Errors

## node is not recognized

### Cause

Node.js is not installed or not added to PATH.

### Solution

Install Node.js and restart the terminal.

---

## npm is not recognized

### Cause

npm installation is missing.

### Solution

Reinstall Node.js.

---

## Port Already in Use

### Error

```text
Port 5173 is already in use
```

### Solution

Close the existing development server or run on another available port.

---

## Module Not Found

### Cause

Dependencies have not been installed.

### Solution

```bash
npm install
```

---

# 📌 Best Practices

- Always verify Node.js before creating a project.
- Commit the initial setup before writing features.
- Never commit the `node_modules` directory.
- Keep `package-lock.json` under version control.
- Use the latest stable versions of tools unless project requirements specify otherwise.
- Start the development server only after all dependencies are installed.

---

# 📝 Command Summary

| Command | Purpose |
|----------|---------|
| `node -v` | Check Node.js version |
| `npm -v` | Check npm version |
| `git --version` | Check Git installation |
| `npm create vite@latest` | Create Vite project |
| `cd cartwise` | Enter project directory |
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `Ctrl + C` | Stop development server |
| `code .` | Open project in VS Code |
| `git init` | Initialize Git repository |
| `git status` | Check repository status |
| `git add .` | Stage files |
| `git commit -m "Initial CartWise setup"` | Create first commit |
| `npm install tailwindcss @tailwindcss/vite` | Install Tailwind CSS |
| `npm install lucide-react` | Install Lucide React |
| `npm install react-router-dom` | Install React Router |

---

# ✅ Summary

At the end of this chapter, the CartWise project is fully initialized and ready for development. The development environment, dependencies, version control, and essential frontend libraries are in place, providing a solid foundation for implementing the application's architecture and features in the upcoming chapters.
