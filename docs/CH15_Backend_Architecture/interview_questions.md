# 🎯 CH15 — Interview Questions

> **Project:** CartWise  
> **Chapter:** Backend Architecture
>
> This chapter covers the Spring Boot skeleton, layered architecture, Maven configuration, CORS, HTTP fundamentals, and the reasoning behind deferring database, authentication, and complex API logic to later chapters.

---

# 📚 Beginner Level

## Q1. Why does CartWise need a backend at all? Isn't the React app enough?

### Answer

The React app works fine for one user on one device. But `localStorage` data is local — User A's wishlist lives only on User A's laptop. A real product needs a backend so:

```text
User A saves iPhone → backend stores it in a database
User B opens CartWise → backend sends User B the current price (not stale)
Admin delists a phone → backend removes it from every wishlist that saved it
```

A backend is how CartWise becomes a multi-user system where data is shared and up-to-date.

---

## Q2. What ports are the frontend and backend running on, and why are they different?

### Answer

Frontend: `http://localhost:5173` (or `5174` if 5173 is busy — check `npm run dev` output)
Backend: `http://localhost:8080`

They are different ports because each port can host only one server. If you tried to run both on port 8080, the second one would fail ("address already in use"). Different ports also simulate production, where the frontend and backend are on completely different machines.

---

## Q3. What is CORS, and why does the browser block frontend-to-backend requests without it?

### Answer

CORS (Cross-Origin Resource Sharing) is a browser security feature. By default, a website loaded from `localhost:5173` cannot make HTTP requests to `localhost:8080` because they are different origins (different ports count as different origins).

CartWise's backend sends CORS headers saying "yes, requests from localhost:5173 are allowed," and then the browser allows it.

---

## Q4. What does the `/api/health` endpoint do?

### Answer

It returns `{"status":"UP","timestamp":"...","message":"CartWise backend is running"}` with a 200 status code.

It is not a business endpoint — it does not fetch products or save wishlists. It exists to prove the entire backend skeleton works: the server boots, HTTP routing works, CORS is configured, and the frontend can reach it.

---

## Q5. What is Maven, and why did CartWise choose it over Gradle?

### Answer

Maven is a Java build tool that uses XML for configuration. It compiles code, manages dependencies, and packages applications.

CartWise chose Maven because:
- XML configuration is explicit and visible (good for learning)
- Larger ecosystem of plugins
- Simpler for beginners than Gradle's DSL

Later, swapping Maven for Gradle is a one-time refactor; getting lost in Gradle early would be worse.

---

## Q6. What Java version and Spring Boot version does CartWise use?

### Answer

Java 21 (LTS — Long Term Support, stable until 2026+)
Spring Boot 4.1.0 (latest stable, built on Spring 6)

Both are production-ready, not experimental. If you are reading this in 2026+, they may be old — upgrade them in a maintenance pass.

---

## Q7. What does layered architecture mean?

### Answer

Layered architecture organizes code into separate layers:

```text
Controller → Service → Repository
```

Each layer has one job: Controller handles HTTP, Service contains logic, Repository handles database access. Code only depends on layers below it, not above.

---

## Q8. What is the `/api` path prefix, and why do all CartWise endpoints start with it?

### Answer

`/api` is a convention meaning "this is an Application Programming Interface endpoint."

CartWise could have endpoints at `/products`, `/api/products`, `/v1/api/products` — the choice is arbitrary. Using `/api` signals "this is meant for programmatic access (from JavaScript), not for humans typing URLs in a browser."

---

## Q9. What does `@RestController` do?

### Answer

`@RestController` is a Spring annotation marking a class as an HTTP endpoint handler. Methods in it respond to HTTP requests and return data (usually JSON), not HTML.

Without `@RestController`, the class would be a normal Java class with no special meaning to Spring.

---

## Q10. What is a DTO, and why is `HealthResponse` one?

### Answer

A DTO (Data Transfer Object) is a small object that carries data being sent over HTTP.

```java
public record HealthResponse(String status, LocalDateTime timestamp, String message) {}
```

DTOs are separate from domain entities to avoid exposing internal database structure. The `/api/health` response is JSON-serialized from a `HealthResponse` DTO, which the controller creates.

---

# 📚 Intermediate Level

## Q11. Walk through the exact path a `GET /api/health` request takes from the browser to the response.

### Answer

```text
1. Browser makes GET request to http://localhost:8080/api/health
2. Browser sees different origin (port 8080 vs 5173), sends preflight OPTIONS request
3. Backend's CORS config responds with "yes, localhost:5173 is allowed"
4. Browser sends the real GET request
5. Spring routing finds HealthController.getHealth() via @GetMapping("/api/health")
6. HealthController calls HealthService.checkHealth()
7. HealthService creates a HealthResponse object
8. Spring's serializer converts it to JSON
9. Backend returns JSON + 200 OK status
10. Browser deserializes JSON and passes it to the fetch promise
```

---

## Q12. What does the CORS configuration's `allowedOrigins` parameter do, and what would happen if it were wrong?

### Answer

```java
.allowedOrigins("http://localhost:5173", "http://localhost:5174")
```

This tells the browser "requests from these origins are allowed." If it were set incorrectly:

```text
.allowedOrigins("http://evil.example.com")
  → frontend on localhost:5173 gets a CORS error
  → request is blocked by the browser before reaching backend

.allowedOrigins("*")
  → any origin can call the API
  → security risk in production (but acceptable in dev)
```

---

## Q13. Why does the CORS configuration include both `localhost:5173` and `localhost:5174`?

### Answer

Port 5173 is Vite's default dev port. If that port is already in use, Vite automatically tries 5174, 5175, etc. Listing both ensures CORS works regardless of which port Vite actually chooses.

In production, only the real frontend domain (e.g., `https://cartwise.example.com`) would be listed.

---

## Q14. What does `allowCredentials(true)` in the CORS config mean, and when is it needed?

### Answer

```java
.allowCredentials(true)
```

This tells the browser "cookies and HTTP authentication headers can be sent with requests to this API."

It is needed when the frontend must send a session cookie or a Bearer token (JWT, Chapter 18) to authenticate itself to the backend. Without it, the browser would strip the credentials from the request.

---

## Q15. Why does Maven use XML for configuration instead of a language like Gradle's Groovy?

### Answer

XML is declarative — you describe *what* dependencies and plugins you need, and Maven figures out how to wire them. Groovy is imperative — you write code describing the build process.

For beginners, declarative is easier to read — there are fewer things to learn before you can understand a `pom.xml`. The trade-off is verbosity: Gradle's DSL is more compact for experienced developers.

---

## Q16. What is a Maven dependency, and how does Maven know which version to download?

### Answer

A dependency is an external library your project needs. In `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>4.1.0</version>
</dependency>
```

Maven downloads from Maven Central Repository using the coordinates (group ID, artifact ID, version). If no version is specified, Maven uses the one declared in the parent POM or in a `<dependencyManagement>` section.

---

## Q17. Why is the `/api/health` endpoint "not a real endpoint" according to the chapter, even though it returns real data?

### Answer

Because it is not business logic — it does not fetch products, save wishlists, or do anything the user asked for. It exists solely to prove the skeleton works.

Real endpoints (Product endpoints, Wishlist endpoints, etc.) belong to Chapters 16–18 and will follow the same `/api` pattern but with actual business logic in the service layer.

---

## Q18. Spring Security is deliberately not included in Chapter 15. What would happen if you added it to `pom.xml` now without configuring it?

### Answer

The backend would boot, but every endpoint — including `/api/health` — would return `401 Unauthorized` and redirect to a login page. This is because Spring Security's default is to block everything and require authentication.

Chapter 18 will add Spring Security properly, with JWT, role-based access control, and explicit configuration. Until then, Chapter 15 intentionally leaves it out.

---

## Q19. Why is the database configuration in `application-dev.yml` stubbed but not actually connected?

### Answer

Chapter 16 will define the database schema and entities. Connecting to a database now, without entities to map to tables, would either fail (no tables exist) or sit idle (wired but unused).

Including the configuration structure now means a developer sees where it goes; actually wiring a database will be a straightforward addition in Chapter 16, not a surprise.

---

## Q20. Explain the bug found during verification where a 404 error was being returned as a 500 error.

### Answer

The initial `GlobalExceptionHandler` caught *all* exceptions with `@ExceptionHandler(Exception.class)` and returned a 500 status. When Spring could not find a route (a 404 scenario), it would throw an exception, which the handler caught and turned into a 500.

The fix was to check if the exception is a `NoHandlerFoundException` and return 404 for that specific case, leaving all other exceptions as 500.

This is the kind of bug that doesn't show up in happy-path testing but breaks in production when users request endpoints that don't exist.

---

# ⚛️ Spring/Java-Specific Questions

## Q21. What does `@Service` do, and why is `HealthService` annotated with it?

### Answer

`@Service` tells Spring "this class is a business logic bean — create one instance and manage it."

Spring then injects it into any class that requests it (like `HealthController`), so the controller doesn't have to manually create a `new HealthService()`.

```java
@Service
public class HealthService { ... }

// Later, in HealthController:
public HealthController(HealthService healthService) { ... }
// Spring automatically injects the one HealthService instance
```

---

## Q22. What is constructor injection, and why is it used instead of `@Autowired` on fields?

### Answer

Constructor Injection passes dependencies through the constructor:

```java
@RestController
public class HealthController {
    private final HealthService healthService;
    
    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }
}
```

Field injection would look like:

```java
@RestController
public class HealthController {
    @Autowired
    private HealthService healthService;
}
```

Constructor injection is better because:
- Dependencies are explicit (visible in the constructor)
- Fields can be `final` (immutable, thread-safe)
- Easier to test (pass a mock to the constructor)
- Works without Spring's annotation processor

---

## Q23. What does `public record HealthResponse(...)` do, and how is it different from a traditional class?

### Answer

A `record` (introduced in Java 16) is a compact way to define an immutable data holder:

```java
public record HealthResponse(String status, LocalDateTime timestamp, String message) {}
```

Automatically generates:
- A constructor taking those three parameters
- Getters (`status()`, `timestamp()`, `message()`)
- `equals()`, `hashCode()`, and `toString()`
- No need to write boilerplate

A traditional class would require 20+ lines for the same thing. Records are perfect for DTOs.

---

## Q24. Why is `maxAge(3600)` set in the CORS configuration?

### Answer

The browser caches the preflight response for 3600 seconds (1 hour). Without caching:

```text
Every request to /api/health would be preceded by a preflight OPTIONS request
→ doubles the number of network calls
→ slower user experience
```

With caching:

```text
First request → preflight → cache for 1 hour
Next 100 requests → use cached preflight response, no preflight needed
```

For development, 3600 is fine. For production, this can be tuned based on how often CORS rules change.

---

## Q25. What does `spring.profiles.active: dev` in `application.yml` do?

### Answer

It tells Spring "use the dev profile by default." Spring then loads:

1. `application.yml` (shared defaults)
2. `application-dev.yml` (overrides for dev)

If you wanted to run in production, you would either:
- Change `spring.profiles.active` to `prod`, or
- Pass a JVM argument: `java -jar app.jar --spring.profiles.active=prod`

---

# 🏗️ Architecture Questions

## Q26. Draw the full request path from frontend to backend and back, including CORS and the layered architecture.

### Answer

```text
Frontend (localhost:5173)
      ↓
Browser sees different origin
      ↓
Sends OPTIONS preflight → Backend CORS config → "yes, allowed" → Browser caches
      ↓
Sends GET /api/health → Spring routing
      ↓
HealthController.getHealth()
      ↓
HealthService.checkHealth()
      ↓
return new HealthResponse(...)
      ↓
Spring serializes to JSON
      ↓
HTTP 200 + JSON body → Browser
      ↓
JavaScript fetch receives {"status":"UP",...}
```

---

## Q27. If the database were connected today and a new `ProductService` existed, how would you add a `/api/products` endpoint without changing the skeleton?

### Answer

Create a new controller following the exact same pattern:

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    
    public ProductController(ProductService productService) {
        this.productService = productService;
    }
    
    @GetMapping
    public List<ProductDto> getProducts() {
        return productService.getAllProducts();
    }
}
```

The skeleton's layering (controller → service) would not change. You are just adding to it, not restructuring it.

---

## Q28. Why are both `application-dev.yml` and `application-prod.yml` necessary if `application.yml` already has configuration?

### Answer

`application.yml` holds shared defaults for all environments. `application-dev.yml` and `application-prod.yml` override only the values that differ:

```text
Shared (application.yml)
  spring.application.name: cartwise
  logging.level.root: INFO

Dev (application-dev.yml) overrides
  server.port: 8080
  spring.datasource.url: jdbc:mysql://localhost:3306/cartwise_dev
  logging.level.com.cartwise: DEBUG

Prod (application-prod.yml) overrides
  server.port: 8080
  spring.datasource.url: ${DB_URL}        ← from environment variable
  logging.level.root: WARN
```

Without profiles, you would either have multiple copies of `application.yml` (fragile) or hardcode production secrets into the code (insecure).

---

## Q29. The chapter says Spring Security blocks all requests by default if included. Why include the dependency at all, then, if Chapter 18 handles it?

### Answer

The chapter deliberately does **not** include Spring Security (`spring-boot-starter-security`) as a dependency in Chapter 15. It is listed as a "known limitation" for Chapter 18.

If someone adds it to `pom.xml` before Chapter 18, the backend will boot but `/api/health` will return 401. That is a signal to wait for Chapter 18 and configure it properly, not to force-permit endpoints as a workaround.

---

## Q30. Why is the repository layer stubbed (empty) instead of actually persisting the health check status?

### Answer

The health check is not a real business operation — it doesn't fetch or store data. Adding a repository would be architecture theater: a real repository would be empty, and writing to a database just to record "I am alive" is wasteful.

The skeleton proves the repository layer exists and where it goes; actually using it waits for Chapter 16, when there are real entities (Product, User, etc.) to persist.

---

# 🧪 Scenario-Based Questions

## Q31. A teammate wants to add a `/api/products` endpoint that returns a hardcoded list, without a database yet. Is this a good idea, or should they wait for Chapter 16?

### Answer

It's a boundary decision:

**Wait for Chapter 16 (conservative):**
- Forces proper architecture: ProductService fetches from ProductRepository, which fetches from database
- Prevents hardcoding data into the codebase
- Chapter 16 then just swaps the hardcoded list for a real database query

**Add it now as a demo (pragmatic):**
- Proves the endpoint pattern works
- Gives frontend developers something to call
- Chapter 16 refactors it to use the database

The chapter's answer is the conservative one — wait for Chapter 16 — because introducing a `/api/products` without a repository would require either hardcoding data or hand-waving a data source, both of which become technical debt. Better to wait a chapter and do it right.

---

## Q32. CORS is failing — the browser is rejecting requests from `localhost:5173` to `localhost:8080`. Walk through how you would debug this.

### Answer

1. Open the browser's Network tab, look at a failed request
2. Check the OPTIONS preflight response headers — does it include `Access-Control-Allow-Origin: http://localhost:5173`?
   - If no: CORS is not configured correctly, or the origin is not listed in `allowedOrigins`
   - If yes: CORS is working; the issue is elsewhere
3. Check the backend logs for any errors during the preflight
4. Confirm both servers are actually running (`mvn spring-boot:run` for backend, `npm run dev` for frontend)
5. Verify the frontend URL in the browser matches what `allowedOrigins` expects — if frontend is on 5174 but `allowedOrigins` only lists 5173, it will fail

---

## Q33. The backend boots but logs show `WARN: No mapping found for HTTP request to /api/health`. How did this happen and how would you fix it?

### Answer

This means the `@GetMapping("/api/health")` annotation didn't register the route. Possible causes:

1. The class is not annotated with `@RestController` — fix by adding the annotation
2. The class is inside a package Spring doesn't scan — Spring by default scans the main application package and its subpackages, so `HealthController` must be in `com.cartwise.controller` or deeper, not in a separate top-level package
3. The class was annotated with `@Controller` instead of `@RestController` — fix by changing to `@RestController`

The fix: add `@RestController` to the class definition, and ensure it's in the right package.

---

## Q34. The frontend successfully calls `/api/health` and receives data, but the data is wrapped in an extra object: `{"data":{"status":"UP",...}}`. Where did the extra wrapping come from?

### Answer

Either:

1. The controller is manually wrapping the response:
```java
return new ApiResponse(healthService.checkHealth()); // Wrong
```
Should be:
```java
return healthService.checkHealth(); // Correct
```

2. Or a `ResponseEntity` wrapper was added:
```java
return ResponseEntity.ok(new ApiResponse(...)); // Wrong for this use case
```

The health service should return `HealthResponse` directly, and Spring's serializer converts it to JSON without extra wrapping.

---

## Q35. You want to add a second endpoint, `/api/version`, that returns `{"version":"1.0.0"}`. Write the minimal code to add it without changing existing code.

### Answer

```java
@RestController
@RequestMapping("/api")
public class InfoController {
    @GetMapping("/version")
    public VersionResponse getVersion() {
        return new VersionResponse("1.0.0");
    }
}

public record VersionResponse(String version) {}
```

Or add it to the existing `HealthController`:

```java
@RestController
@RequestMapping("/api")
public class HealthController {
    // existing getHealth() ...
    
    @GetMapping("/version")
    public VersionResponse getVersion() {
        return new VersionResponse("1.0.0");
    }
}

public record VersionResponse(String version) {}
```

Both work. The first is cleaner if endpoints are thematically grouped; the second is simpler if there are only a few endpoints.

---

# 📌 Summary

These questions cover:

- Why a backend is necessary and what problems it solves
- How frontend and backend communicate via HTTP and CORS
- The layered architecture: controller → service → repository
- Maven, Java versions, and build tool philosophy
- Spring Boot beans, dependency injection, and annotations
- DTOs and how data moves between layers
- Configuration profiles for different environments
- Deliberate deferrals: database, authentication, business logic
- Real bugs and how testing finds them
- Common mistakes in REST API design
