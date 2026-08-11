# 📖 CH15 — Glossary

> **Project:** CartWise  
> **Chapter:** Backend Architecture

This glossary explains the important terms and concepts introduced while building CartWise's backend skeleton.

---

# 🏗️ Backend

The Backend is a server that holds business logic, persists data to a database, and serves API requests from the frontend.

Before Chapter 15, CartWise was entirely frontend — a React app with no backend server. After Chapter 15, the backend is a separate Java/Spring Boot process running on `localhost:8080`.

---

# 🌐 Frontend

The Frontend is the user-facing application, typically running in a browser.

CartWise's frontend is React, TypeScript, Vite, and Tailwind — everything built in Chapters 1–14. It now makes HTTP requests to the backend instead of reading from a local JSON catalogue.

---

# 🔄 API (Application Programming Interface)

An API is a contract between two programs — a set of endpoints and the data they accept and return.

CartWise's backend exposes REST endpoints under `/api/`, which the frontend calls via HTTP. Chapter 17 defines the full API; Chapter 15's `/api/health` is the first proof-of-concept.

---

# 🏥 Health Check Endpoint

A Health Check Endpoint is a simple endpoint that a monitoring tool or load balancer can call to verify the server is alive.

`GET /api/health` returns `{"status":"UP",...}` and `200 OK` if the backend is running. Monitoring tools call it every 10 seconds to detect if the backend crashes.

---

# 🛠️ Build Tool

A Build Tool compiles source code, manages dependencies, runs tests, and packages an application for deployment.

CartWise's backend uses Maven. The `pom.xml` file declares dependencies, plugins, and build configuration.

---

# 📜 Maven

Maven is a Java build tool that uses XML for configuration.

```text
Declarative    every dependency and plugin is named explicitly
Extensible     thousands of plugins for different tasks
Predictable    well-established conventions and naming
```

The alternative is Gradle (more compact, more programmatic), but Maven was chosen for learning clarity.

---

# 🎁 Dependency

A Dependency is an external library or framework that a project requires.

CartWise's backend depends on Spring Boot, which depends on Spring Framework, which depends on many others. Maven resolves and downloads all of them automatically.

---

# 📝 pom.xml

The Project Object Model (POM) is Maven's configuration file.

It declares:
- The project's group ID, artifact ID, and version
- Dependencies and their versions
- Plugins and build configuration
- Profiles for different environments

---

# ☕ Java

Java is a compiled, statically-typed programming language with automatic memory management (garbage collection).

CartWise's backend is written in Java 21, compiled to bytecode, and run by the Java Virtual Machine (JVM).

---

# 🍃 Spring Boot

Spring Boot is a framework that makes building Java web applications fast by providing sensible defaults and auto-configuration.

Without Spring Boot, you would manually wire HTTP servers, dependency injection, configuration, logging, etc. Spring Boot does this automatically so you can focus on business logic.

---

# 🔧 Spring Framework

Spring Framework is the underlying container that provides dependency injection, aspect-oriented programming, and the core abstractions Spring Boot builds on.

You rarely interact with Spring directly; Spring Boot handles most of it.

---

# 💉 Dependency Injection

Dependency Injection (DI) is a pattern where a framework creates objects and wires their dependencies together, rather than objects creating their own dependencies.

```java
@Service
public class HealthService {
    private final SomeRepository repo;
    
    // Spring injects repo via constructor
    public HealthService(SomeRepository repo) {
        this.repo = repo;
    }
}
```

This makes testing easier (inject a mock) and decouples objects from their dependencies.

---

# 🧱 Bean

A Bean is an object managed by Spring — created, configured, and injected by the framework.

Classes annotated with `@Service`, `@Repository`, `@Controller`, or `@Component` are beans. Spring creates one instance (by default) and reuses it.

---

# 📡 HTTP

HTTP (Hypertext Transfer Protocol) is the protocol browsers and servers use to communicate.

A request goes `GET http://localhost:8080/api/health`; a response comes back with a status code (200, 404, 500, etc.) and a body.

---

# 🔗 REST API

REST (Representational State Transfer) is an architectural style for HTTP APIs that uses:
- Standard HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove)
- URLs as resource identifiers: `/api/products/123`
- HTTP status codes for outcomes: 200 (success), 404 (not found), 500 (error)

CartWise's backend will be a REST API.

---

# @RestController

`@RestController` is a Spring annotation that marks a class as an HTTP endpoint handler.

Methods in a `@RestController` respond to HTTP requests and return data (usually JSON).

---

# @GetMapping

`@GetMapping("/api/health")` is a Spring annotation that maps an HTTP GET request to that path to a Java method.

```java
@RestController
public class HealthController {
    @GetMapping("/api/health")
    public HealthResponse getHealth() { ... }
}
```

---

# DTO (Data Transfer Object)

A DTO is a small object that holds data being transferred between layers or over HTTP.

```java
public record HealthResponse(String status, LocalDateTime timestamp, String message) {}
```

DTOs are separate from domain entities to avoid exposing internal database structure to the API.

---

# 🏛️ Layered Architecture

Layered Architecture organizes code into separate layers, each with a specific responsibility:

```text
Controller    HTTP entry point, input validation
Service       Business logic, orchestration
Repository    Data access only
Entity        Domain model
```

Each layer depends only on the layers below it, not on the layers above.

---

# 🎮 Controller Layer

The Controller Layer handles HTTP requests, validates input, calls services, and returns responses.

Controllers don't contain business logic — they delegate to services.

---

# 💼 Service Layer

The Service Layer contains business logic, decision-making, and coordination across repositories.

Services are reusable and can be called from multiple controllers or from other services.

---

# 🗄️ Repository Layer

The Repository Layer handles all database access — queries, inserts, updates, deletes.

Repositories don't contain business logic; they only fetch and store data.

---

# 🏘️ Entity

An Entity is a domain object that represents something in the business — a Product, a User, a Wishlist entry.

Entities map to database tables in a one-to-one relationship (Chapter 16).

---

# ⚙️ Configuration

Configuration is the setup needed to make an application work, separate from code — database URLs, logging levels, feature flags, secrets.

CartWise keeps configuration in `application.yml` and profile-specific files, separate from Java code.

---

# 🎭 Profile

A Profile is a named configuration set for a specific environment.

`application-dev.yml` is used during development; `application-prod.yml` is used in production. Spring loads the active profile based on the `spring.profiles.active` setting.

---

# 📊 application.yml

The main configuration file for a Spring Boot application, written in YAML format.

It sets defaults for all profiles; profile-specific files override values as needed.

---

# 🔐 CORS (Cross-Origin Resource Sharing)

CORS is a browser security feature that blocks HTTP requests to a different origin unless the server explicitly permits them.

```text
Frontend origin: http://localhost:5173
Backend origin: http://localhost:8080
Different ports = different origins → browser blocks the request
```

The backend must send CORS headers permitting the frontend's origin for the request to succeed.

---

# 🔄 Preflight Request

A Preflight Request is an automatic HTTP OPTIONS request the browser sends before a real request, to ask if the destination allows it.

Only the destination's CORS headers can say yes or no. If they say yes, the browser sends the real request.

---

# ✅ allowedOrigins

`allowedOrigins` in CORS configuration specifies which origins (e.g., `http://localhost:5173`) are permitted to call the API.

Wildcards (`*`) allow any origin — dangerous in production, acceptable in development.

---

# 🔑 Credentials

`allowCredentials(true)` in CORS configuration tells the browser that cookies or HTTP authentication headers are allowed to be sent with requests.

Needed when the frontend must send session cookies or Bearer tokens to the backend.

---

# ⏱️ maxAge (CORS)

`maxAge(3600)` tells the browser to cache the preflight response for 3600 seconds (1 hour).

Without caching, the browser would send a preflight for every single request, doubling network traffic.

---

# ⚔️ Spring Security

Spring Security is a framework that handles authentication (who are you?) and authorization (what can you do?).

If on the classpath without configuration, it blocks all requests by default — hence Chapter 18 will add it properly, with JWT and role-based access control.

---

# 🔌 Maven Wrapper

Maven Wrapper is a script (`mvnw` / `mvnw.cmd`) that downloads and runs Maven automatically, so the project doesn't require Maven to be globally installed.

Users can run `./mvnw clean verify` and Maven will be fetched if needed.

---

# 📦 JAR

A JAR (Java Archive) is a ZIP file containing compiled Java classes, resources, and metadata.

`mvn package` creates a JAR that can be run on any machine with a JVM installed.

---

# 🚀 Maven Goals

Maven Goals are tasks that Maven can perform: `compile`, `test`, `package`, `clean`, `install`.

`mvn spring-boot:run` is a goal that compiles and runs the application.

---

# 🔍 Port

A Port is a network endpoint on a machine where a server listens for connections.

CartWise's frontend runs on port 5173 (or 5174), backend on port 8080. These are different ports on the same machine (`localhost`), but they're different origins in the browser's view.

---

# 📍 Origin

An Origin is a unique combination of protocol, hostname, and port.

`http://localhost:5173` and `http://localhost:8080` are different origins. The browser restricts cross-origin requests.

---

# 🛡️ GlobalExceptionHandler

A Global Exception Handler is a centralized place to catch exceptions from anywhere in the application and return a consistent error response.

Prevents each controller from needing its own error handling logic.

---

# 💬 JSON

JSON (JavaScript Object Notation) is a text format for representing structured data.

```json
{"status":"UP","timestamp":"2025-08-10T14:32:18Z","message":"..."}
```

REST APIs use JSON to send and receive data.

---

# 📝 Logging

Logging is writing informational, warning, and error messages to a log file or console.

CartWise's backend uses `logback-spring.xml` to configure logging levels per package, so you can see what's happening during development and diagnose problems in production.

---

# 🧪 Unit Test

A Unit Test is a test that verifies a single class or method works correctly in isolation.

Chapter 15's backend includes a basic test that verifies the health endpoint returns a 200 status code.

---

# 🌍 localhost

`localhost` is a hostname that refers to the current machine.

`localhost:8080` means "port 8080 on this machine." In a browser, `http://localhost:8080` connects to a server running on your own computer.

---

# 🔐 Environment Variable

An Environment Variable is a named value set outside the application, used for configuration that should not be in code.

Production databases credentials are passed via environment variables like `DB_URL`, `DB_USER`, `DB_PASSWORD` — not hardcoded in `application-prod.yml`.

---

# 📊 Database (Deferred)

A Database is a persistent store for application data — tables, rows, queries.

CartWise's backend will use PostgreSQL (Chapter 16), but the database is not yet connected in Chapter 15.

---

# 🎯 Deferred (To Chapter X)

"Deferred to Chapter X" means a feature is deliberately not built now; it belongs to a later chapter.

Authentication is deferred to Chapter 18. Entities are deferred to Chapter 16. This keeps each chapter focused.
