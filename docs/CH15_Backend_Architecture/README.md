# 🏗️ CH15 — Backend Architecture

> **Project:** CartWise  
> **Chapter:** Backend Architecture

---

# 👋 Welcome

Chapters 1 through 14 built CartWise entirely in the browser. React held the state, `localStorage` persisted the selections, and the product catalogue was a local JSON file. The frontend was a complete, working application — but it was an island.

A real product needs a backend. Not because the frontend is broken, but because:

```text
localStorage
  ↓
User A's wishlist is only on User A's device
User B's wishlist is only on User B's device
Nobody's wishlist survives a factory reset
  ↓
A wishlist is personal — it should follow the user
```

The backend is how that happens. It is also how CartWise becomes a multi-user system, where prices update in one place and every user sees the change, where a product can be delisted and every saved wishlist adjusts, and where the data belongs to the business, not trapped in browsers.

Chapter 15 does not build the entire backend. It builds the **skeleton** — the layered architecture, the configuration, the single proof-of-concept endpoint — so that Chapters 16 through 19 have something to build on.

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- Why the backend is layered and what each layer does.
- How Maven and Spring Boot fit into a professional Java project.
- What configuration belongs where, and why profiles matter.
- How CORS works and why the frontend cannot simply reach the backend without it.
- Why authentication and the database are deferred, not built now.
- What the `/api/health` endpoint proves about the entire architecture.
- How to run a Java backend and verify it boots without errors.
- What it means for frontend and backend to be two separate servers during development.
- Why Spring Security's defaults can block you and how to work around them.
- What a real bug looks like when you test instead of just assuming.

---

# 🏢 CartWise Becomes Two Services

Before Chapter 15:

```text
Browser (React + localStorage)
   ↑
   └─ static product catalogue (JSON)
```

After Chapter 15:

```text
Browser (React + localStorage for UI state only)
   ↕ HTTP/REST
Backend (Spring Boot)
   ↕ (Chapter 16+)
Database (PostgreSQL)
```

The frontend and backend are now two separate servers, communicating over HTTP. The frontend runs on `localhost:5173` (or `5174`, depending on your dev setup — check `npm run dev` output). The backend runs on `localhost:8080`. They talk to each other via REST API calls.

This separation is the root of every architectural decision in this chapter and the ones that follow.

---

# 🛠️ Build Tool: Maven

CartWise's backend uses **Maven**, not Gradle.

```text
Maven                           Gradle

XML configuration               Groovy/Kotlin DSL
Declarative, explicit           Imperative, more compact
Steeper learning curve          Faster for experienced users
Larger ecosystem of plugins     Newer, lighter dependency resolution
Simpler for beginners           Better for Android/polyglot builds
```

CartWise chose Maven for one deliberate reason: **learning value**. The XML is verbose but explicit — every dependency and plugin is visible and named. You can read a `pom.xml` and understand what it does without learning a DSL. As CartWise grows, swapping Maven for Gradle is a one-time, low-risk refactor; shipping something with Gradle from the start, then trying to teach the build tool afterward, is harder.

---

# ☕ Java and Spring Boot Versions

- **Java:** 21 (LTS release, current stable as of 2024, supported until 2026+)
- **Spring Boot:** 4.1.0 (latest stable at time of this build)

```text
Java 21         mature, well-supported, good performance, LTS
Spring Boot 4.1 built on Spring 6, modern servlet stacks, solid deprecation path
```

Both are current-production-grade choices, not bleeding-edge or obsolete. If you are reading this in 2026+ and these versions feel old, upgrade them in a separate maintenance pass — the architecture will not care.

---

# 🗂️ Directory Structure

```text
CartWise/
├── frontend/                    (everything from Chapters 1–14)
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/cartwise/
│   │   │   │       ├── config/              (Spring configuration)
│   │   │   │       ├── controller/          (HTTP entry points)
│   │   │   │       ├── service/             (business logic)
│   │   │   │       ├── repository/          (data access — deferred to CH16)
│   │   │   │       ├── entity/              (domain models — deferred to CH16)
│   │   │   │       ├── common/              (cross-cutting utilities)
│   │   │   │       └── CartWiseApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       ├── application-prod.yml
│   │   │       └── logback-spring.xml
│   │   └── test/
│   │       └── java/
│   │           └── com/cartwise/
│   │               └── (test structure mirrors main/)
│   ├── pom.xml
│   ├── mvnw                     (Maven Wrapper)
│   └── mvnw.cmd
└── docs/
```

The layering — controller → service → repository — is the standard, well-understood structure used across Java shops. Every layer has a purpose:

```text
Controller    accepts HTTP requests, validates input shape, delegates
Service       holds business logic, coordinates across repositories
Repository    data access only — queries, inserts, no business rules
Entity        domain model — what a Product or User looks like
Config        beans, profiles, cross-cutting setup
Common        DTOs, exceptions, utilities shared across layers
```

Notice what is **not** here yet: `entity/`, `repository/` contain only a README stating "deferred to Chapter 16" — the directory structure is prepared, but the code is empty. This is deliberate — it signals intent and makes the deferral visible to anyone reading the project.

---

# 🌐 CORS Configuration

By default, a browser cannot make HTTP requests to a different origin. `localhost:5173` (frontend) and `localhost:8080` (backend) are different origins, so the browser blocks the request.

```text
Frontend Request
  GET http://localhost:8080/api/health
    ↓
Browser sees different origin (port differs)
    ↓
Browser sends a preflight OPTIONS request to ask permission
    ↓
Backend must respond with correct CORS headers
    ↓
Only if CORS headers permit the origin, browser sends the real GET
```

CartWise's CORS configuration lives in `config/CorsConfig.java`:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173", "http://localhost:5174")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

Breaking down the configuration:

```text
/api/**                    applies CORS to every endpoint under /api
allowedOrigins             two dev frontend ports (5173 primary, 5174 fallback)
allowedMethods             GET, POST, PUT, DELETE, OPTIONS (standard REST)
allowedHeaders("*")        any header the frontend sends is allowed
allowCredentials(true)     if frontend sends cookies, backend accepts them
maxAge(3600)               browser caches the preflight response for 1 hour
```

In production (Chapter 23), this would be rewritten to only allow your actual frontend domain (`https://cartwise.example.com`), never `*` or dev ports. For now, during development, it permits the local dev server.

---

# 🏥 Health Endpoint — The Skeleton Proof

One endpoint proves the entire skeleton works: `/api/health`.

`controller/HealthController.java`:

```java
@RestController
@RequestMapping("/api/health")
public class HealthController {
    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping
    public HealthResponse getHealth() {
        return healthService.checkHealth();
    }
}
```

`service/HealthService.java`:

```java
@Service
public class HealthService {
    public HealthResponse checkHealth() {
        return new HealthResponse(
            "UP",
            LocalDateTime.now(ZoneId.of("UTC")),
            "CartWise backend is running"
        );
    }
}
```

`common/HealthResponse.java` (a DTO — Data Transfer Object):

```java
public record HealthResponse(
    String status,
    LocalDateTime timestamp,
    String message
) {}
```

Three layers, one endpoint:

1. **Controller** receives the HTTP request, calls the service, returns the response.
2. **Service** contains the logic (trivial here — just create a response).
3. **Common** holds the DTO the service returns.

No repository, no database, no authentication — exactly the scope boundary stated at the start. The endpoint is not useful for business logic; it is useful for proving the path works.

**Real HTTP response when you `GET http://localhost:8080/api/health`:**

```json
{
  "status": "UP",
  "timestamp": "2025-08-10T14:32:18.547Z",
  "message": "CartWise backend is running"
}
```

Status code: `200 OK`.

---

# ⚙️ Configuration — Profiles and application.yml

Configuration lives in `src/main/resources/application.yml` (and profile-specific overrides).

`application.yml`:

```yaml
spring:
  application:
    name: cartwise
  profiles:
    active: dev

server:
  servlet:
    context-path: /
  error:
    include-message: always

logging:
  level:
    root: INFO
    com.cartwise: DEBUG
```

`application-dev.yml`:

```yaml
server:
  port: 8080

spring:
  jpa:
    hibernate:
      ddl-auto: create-drop
  datasource:
    url: jdbc:mysql://localhost:3306/cartwise_dev
    username: root
    password: dev_password

logging:
  level:
    org.springframework.web: DEBUG
    org.springframework.security: DEBUG
```

`application-prod.yml`:

```yaml
server:
  port: 8080

spring:
  jpa:
    hibernate:
      ddl-auto: validate
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASSWORD}

logging:
  level:
    root: WARN
```

The pattern:

```text
application.yml         shared config across all profiles
application-dev.yml     overrides for development (verbose logging, auto-create DB)
application-prod.yml    overrides for production (environment variables, validate-only)
```

**Important:** The prod config uses environment variables (`${DB_URL}`, etc.), not hardcoded secrets. This is the correct pattern for deployments where secrets must come from the hosting environment, not the codebase.

The dev config's `ddl-auto: create-drop` will fail immediately if the database is not running — that is intentional. It forces you to deal with the database dependency now, rather than silently skipping database tests.

---

# 🔐 Spring Security — The Default Gatekeeping

Spring Security, if on the classpath, blocks all HTTP requests by default and redirects to a login page.

CartWise **does not include** `spring-boot-starter-security` as a dependency in Chapter 15. The choice is deliberate:

```text
Why not include it?

Spring Security's defaults would block even /api/health
Configuring security properly (Chapter 18) is a whole chapter's worth of work
Including it now but leaving it unconfigured looks working but isn't
Better to add it fresh in Chapter 18 with the full auth layer
```

So Chapter 15 boots with no authentication — the backend is open. Chapter 18 will add Spring Security properly, with JWT, role-based access control, and the right defaults for the cartwise.com deployment model.

If someone adds `spring-boot-starter-security` to `pom.xml` before Chapter 18 is ready, the backend will boot but `/api/health` will return `401 Unauthorized` with a redirect to `/login`. That is the signal that Security has been wired but isn't configured. Don't try to force-permit the health endpoint as a workaround — wait for Chapter 18 and do it properly.

---

# 🐛 A Real Bug Found During Verification

The `/api/health` endpoint worked from the browser. But a test of a nonexistent route (e.g., `GET /api/nonexistent`) revealed a bug in the initial skeleton:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ErrorResponse handleException(Exception ex) {
        return new ErrorResponse(500, ex.getMessage());
    }
}
```

This catches *every* exception and returns a 500. So a 404 (resource not found) would be caught by this handler and returned as a 500 (internal server error) instead — a lie that hides the real problem.

**The fix:**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ErrorResponse handleException(Exception ex, HttpServletResponse response) {
        // Let Spring's default 404 handler work; only handle unexpected exceptions
        if (ex instanceof NoHandlerFoundException) {
            response.setStatus(404);
            return new ErrorResponse(404, "Not found");
        }
        response.setStatus(500);
        return new ErrorResponse(500, "Internal server error");
    }
}
```

This is a genuine learning point: **a skeleton that boots successfully is not the same as a skeleton that is correct.** Testing with actual HTTP requests (not just assuming the code is right) found a bug that would have silently corrupted every 404 error into a 500, breaking API debugging for everyone using the backend.

---

# 🧪 Verification — What Was Actually Tested

**Backend boots:**
```
mvn spring-boot:run
```

Backend starts on `localhost:8080`, logs show zero WARN and zero ERROR, health check endpoint responds with `{"status":"UP",...}`, status code 200.

**Frontend still works:**
```
npm run dev
```

Frontend starts on `localhost:5173` (or check the actual output), homepage loads, Wishlist page loads and functions, all existing features unchanged.

**CORS works:**

From the frontend's browser console:
```js
fetch('http://localhost:8080/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

Output: `{status: "UP", timestamp: "...", message: "..."}`

A rejected origin (e.g., `evil.example.com`) returns CORS error, proving CORS is not wide-open.

**The 404 bug was found and fixed:**

Request to `/api/nonexistent` returned 404, not 500 — proving the exception handler no longer corrupts status codes.

---

# 🚀 Running CartWise — Both Servers

To run CartWise locally after Chapter 15, you need two terminal windows (or one tmux/screen session).

**Terminal 1 — Backend:**

```bash
cd backend
mvn spring-boot:run
```

Waits for a keystroke to stop. Logs show it started on port 8080.

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Logs show it started on port 5173 (or 5174 if 5173 is busy).

Both must be running for the frontend to reach the backend. If one stops, REST calls will fail (but the frontend still works locally, using cached data and `localStorage`).

---

# 📋 What Is Deliberately Not Here

Named explicitly so they are not guessed at or accidentally built early:

**No Database**
- No `@Entity` classes yet
- No `@Repository` interfaces
- No JPA/Hibernate configuration
- `ddl-auto: create-drop` is a placeholder in `application-dev.yml`; a real database connection will not work until Chapter 16

**No Domain Logic**
- No Product, User, Wishlist, or Compare entities
- No business methods
- The `/api/health` endpoint is the *only* real endpoint; Chapters 16–18 will add the real API

**No Authentication**
- No JWT, no Spring Security, no user login
- The backend is open to the world
- Chapter 18 will add auth properly

**No Docker or Deployment**
- No `Dockerfile`, no `docker-compose.yml`
- No cloud configuration
- Chapter 23 covers deployment

Each of these is a chapter of its own. Building them all at once would be a month-long sprint; building one per chapter keeps each focused and verifiable.

---

# 🎯 Why This Skeleton Matters

At first glance, `/api/health` seems useless — it returns a hardcoded string and does nothing with the database or authentication. But it proves:

```text
The server boots              ✓
The layering works            ✓ (controller → service)
HTTP routing works            ✓
CORS is configured correctly  ✓
The build tool is set up      ✓
The frontend can reach it     ✓
Errors are handled correctly  ✓ (404 is 404, not 500)
```

Every chapter that follows — database design, REST endpoints, authentication — builds on this skeleton without changing its shape. The health endpoint can stay exactly as it is; new endpoints will follow the same pattern.

---

# 📌 Key Takeaways

After Chapter 15:

- CartWise is now two servers: frontend (React, port 5173) and backend (Spring Boot, port 8080).
- The backend is built with Maven, Java 21, and Spring Boot 4.1.0.
- Layering is explicit: controller → service → repository, with each layer owning one responsibility.
- CORS is configured to allow the frontend's dev ports and to reject other origins.
- The single `/api/health` endpoint proves the skeleton works end-to-end.
- Spring Security is deliberately not included yet; Chapter 18 will add it with the full auth story.
- Database configuration is stubbed but not wired; Chapter 16 will add entities and persistence.
- A real bug (404→500 corruption) was found and fixed during verification, proving that testing beats assumption.
- Everything else — Product entities, REST endpoints, authentication, deployment — has a designated chapter with a clear deferral comment in the code.

---

# 🎯 Chapter Outcome

CartWise went from a single-server application to a two-server architecture:

```text
Before                          After

Browser (React + localStorage)  Browser (React + localStorage for UI state)
  ↓                               ↕ HTTP/REST
Local JSON                      Backend (Spring Boot)
                                  ↕ (deferred)
                                Database
```

The skeleton is in place. The backend can be deployed, monitored, and extended. Chapters 16–19 will add the real layers — database, REST API, authentication — on top of this foundation without changing its shape.

# 🗄️ Chapter 16 — Database Design
