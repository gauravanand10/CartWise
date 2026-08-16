# 👥 CH19 — Authorization & Roles

> **Project:** CartWise  
> **Chapter:** Authorization & Roles

---

# 👋 Welcome

Chapter 18 answered "who are you?" with authentication. Users log in, get a token, prove their identity on every request.

But that's only half the story. Once you know who someone is, you have to decide what they're allowed to do.

In Chapter 17, anyone who logged in could access their own wishlist. That's fine — users own their own data. But what about an admin who needs to manage products, change user roles, or view all wishlists? That requires different permissions.

Chapter 19 is where roles and authorization come in. Users are assigned roles (USER or ADMIN). The role travels in their JWT token. Endpoints check the role and decide: "you can do this" or "you cannot."

By the end of this chapter, CartWise has two tiers of users: regular users managing their wishlists, and admins managing the system.

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- The difference between authentication (who are you?) and authorization (what can you do?).
- What a role is and how it differs from permissions.
- How roles are stored in the database and included in JWT tokens.
- How Spring Security enforces role-based access control.
- Why admin endpoints return 403 (not 404) when a non-admin tries to access them.
- How to test authorization with curl and verify role claims in decoded tokens.
- Why role claims must be validated on every request (no trusting the client).
- What fine-grained permissions are and why Chapter 19 defers them.

---

# 🔑 Authentication vs. Authorization

```text
Authentication:  "Who are you?"
                 Proved with a password → JWT token

Authorization:   "What can you do?"
                 Determined by your role in the token
                 USER can access their own data
                 ADMIN can access and modify system data
```

Chapter 18 focused on authentication. Chapter 19 focuses on authorization.

---

# 👤 Roles — The Basic Model

CartWise has two roles:

```text
USER   the default role for anyone who signs up
       can manage their own wishlist
       cannot see other users' wishlists
       cannot manage products or users

ADMIN  manually assigned by the system (no self-signup)
       can list all users
       can change user roles
       can see everything a USER can see (superuser model)
       in future chapters: can manage products, delete wishlists, etc.
```

A role is a label that groups related permissions. Instead of granting 50 individual permissions per user, you grant a role that has those 50 permissions built in.

---

# 📦 User Entity — Role Field

Chapter 18 created the User entity with email and passwordHash. Chapter 19 adds a role:

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    // Constructor, getters, setters
}
```

The database stores the role as a string (`"USER"` or `"ADMIN"`). Java uses an enum for type safety:

```java
public enum Role {
    USER("USER"),
    ADMIN("ADMIN");

    private final String authority;
    Role(String authority) { this.authority = authority; }
    public String getAuthority() { return authority; }
}
```

---

# 🎟️ JWT Token — Role Claim

The JWT token now includes the user's role:

```java
@Component
public class JwtTokenProvider {
    public String generateToken(Long userId, String email, Role role) {
        Instant now = Instant.now(clock);
        Instant expiresAt = now.plusMillis(jwtExpirationMs);

        return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("email", email)
            .claim("role", role.name())
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS512)
            .compact();
    }

    public Optional<AuthenticatedUser> authenticate(String token) {
        try {
            JwtParser parser = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                .build();

            Claims claims = parser.parseClaimsJws(token).getBody();
            Long userId = Long.valueOf(claims.getSubject());
            String email = (String) claims.get("email");
            String roleName = (String) claims.get("role");
            Role role = Role.valueOf(roleName);

            return Optional.of(new AuthenticatedUser(userId, email, role));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
```

When a user logs in or signs up, their JWT includes their role. Every request carries their authorization level.

```json
{
  "sub": "1",
  "email": "alice@example.com",
  "role": "ADMIN",
  "iat": 1692940000,
  "exp": 1693026400
}
```

---

# 🛡️ Spring Security — Role-Based Access Control

Spring Security's filter chain enforces roles at the endpoint level:

```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("GET", "/api/products").permitAll()
                .requestMatchers("GET", "/api/products/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("OPTIONS", "/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")     // NEW
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling()
                .authenticationEntryPoint(apiErrorSecurityHandler)
                .accessDeniedHandler(apiErrorSecurityHandler)
            .and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        return http.build();
    }
}
```

The rule `.requestMatchers("/api/admin/**").hasRole("ADMIN")` tells Spring Security:
- Before the request reaches the controller, check if the authenticated user has the ADMIN role
- If yes: proceed to the controller
- If no: return 403 Forbidden (never reaches the controller)

This early rejection prevents information leakage — an attacker cannot learn that a resource exists by seeing different error messages.

---

# 👨‍💼 Two New Admin Endpoints

**GET /api/admin/users**

Lists all users in the system (admin only).

Request:
```bash
GET http://localhost:8080/api/admin/users
Authorization: Bearer <admin-token>
```

Response (200 OK):
```json
[
  {
    "id": 1,
    "email": "alice@example.com",
    "role": "ADMIN",
    "createdAt": "2025-08-10T14:32:18Z"
  },
  {
    "id": 2,
    "email": "bob@example.com",
    "role": "USER",
    "createdAt": "2025-08-10T14:35:00Z"
  }
]
```

Error cases:
- No token → 401 Unauthorized
- Token for USER role → 403 Forbidden (Spring Security rejects before controller)

**PUT /api/admin/users/{userId}/role**

Changes a user's role (admin only).

Request:
```bash
PUT http://localhost:8080/api/admin/users/2/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{ "role": "ADMIN" }
```

Response (200 OK):
```json
{
  "id": 2,
  "email": "bob@example.com",
  "role": "ADMIN",
  "createdAt": "2025-08-10T14:35:00Z"
}
```

The user is immediately updated. Their next login will get a new JWT with the updated role.

Error cases:
- No token → 401 Unauthorized
- Token for USER role → 403 Forbidden
- Invalid role value (e.g., `"SUPERUSER"`) → 400 Bad Request
- User not found → 404 Not Found

---

# 🌱 Signup — Assign USER Role

When a user signs up, they are automatically assigned the USER role:

```java
@Service
public class UserService {
    public AuthResponse signup(String email, String password) {
        // ... validate input ...
        
        String passwordHash = passwordHasher.hash(password);
        Instant now = Instant.now();
        User user = new User(email, passwordHash, Role.USER, now, now);  // USER role by default
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(user.getId(), user.getEmail(), token);
    }
}
```

No user can self-assign the ADMIN role. Only an existing admin can promote someone via PUT /api/admin/users/{userId}/role.

---

# 🔍 Authorization Check — Controller Level

While Spring Security enforces roles at the filter level, controllers can also check explicitly:

```java
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDto>> listUsers(
        @AuthenticationPrincipal AuthenticatedUser user
    ) {
        // Spring Security already checked hasRole("ADMIN") before this method runs
        // But we can double-check if needed:
        if (user == null || !user.role().equals(Role.ADMIN)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(userService.getAllUsers());
    }
}
```

In practice, if Spring Security's filter checks pass, the role is guaranteed to be ADMIN. Double-checking is redundant but not wrong.

---

# 🧬 AuthenticatedUser — Role Included

The AuthenticatedUser record (returned from JWT validation) now includes the role:

```java
public record AuthenticatedUser(Long userId, String email, Role role) {}
```

Every controller can access the authenticated user's role via `@AuthenticationPrincipal`.

---

# 📊 Seeded ADMIN User

For testing and development, the database is seeded with one ADMIN user:

```sql
INSERT INTO users (email, password_hash, role, created_at, updated_at)
VALUES (
  'admin@example.com',
  '$2a$10$<bcrypt-hash-of-admin-password>',
  'ADMIN',
  NOW(),
  NOW()
);
```

Credentials for testing:
- Email: `admin@example.com`
- Password: `admin-password`

Log in via POST /api/auth/login to get an ADMIN token.

---

# 🎯 Authorization in Action

**Scenario 1: USER tries to list all users**

```bash
GET /api/admin/users
Authorization: Bearer <user-token>
```

1. Request arrives at Spring Security filter
2. Filter checks: `.requestMatchers("/api/admin/**").hasRole("ADMIN")`
3. Authenticated user's role is USER, not ADMIN
4. Spring Security returns 403 Forbidden (never reaches controller)

Response (403 Forbidden):
```json
{
  "code": "FORBIDDEN",
  "message": "Access denied"
}
```

**Scenario 2: ADMIN lists all users**

```bash
GET /api/admin/users
Authorization: Bearer <admin-token>
```

1. Request arrives at Spring Security filter
2. Filter checks: `.requestMatchers("/api/admin/**").hasRole("ADMIN")`
3. Authenticated user's role is ADMIN ✓
4. Request proceeds to AdminUserController.listUsers()
5. Controller returns 200 + list of all users

Response (200 OK):
```json
[
  { "id": 1, "email": "alice@example.com", "role": "ADMIN", "createdAt": "..." },
  { "id": 2, "email": "bob@example.com", "role": "USER", "createdAt": "..." }
]
```

---

# 🔄 Changing Roles

An ADMIN can promote a USER to ADMIN:

```bash
PUT /api/admin/users/2/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{ "role": "ADMIN" }
```

The user's row is updated in the database. Their next login (or if they get a new token) will include the ADMIN role.

Existing tokens don't change — they were signed with the old role. Once they expire (24 hours), the new role takes effect on re-login.

---

# 📭 What Is Deliberately Not Here

**No fine-grained permissions.** CartWise has roles (USER, ADMIN), not permissions (read_wishlist, delete_product). Chapter 20+ will add this if needed.

**No permission inheritance or hierarchy.** ADMIN doesn't inherit from USER — it's a separate category. Chapter 20+ might introduce this.

**No audit logging.** We don't log "admin@example.com changed bob's role to ADMIN on 2025-08-10." Chapter 20+.

**No admin UI.** The admin endpoints exist; the frontend hasn't been updated to use them. That's a frontend chapter.

**No role-scoped queries.** An ADMIN sees all users; a USER sees no one but themselves. No middle ground. Chapter 20+ might add company-scoped access.

---

# 📌 Key Takeaways

After Chapter 19:

- Roles are stored in the database and included in JWT tokens.
- Spring Security enforces role requirements at the filter level, rejecting unauthorized requests before they reach controllers.
- Two admin endpoints allow viewing and modifying user roles.
- Regular users cannot access admin endpoints (403 Forbidden).
- Roles are assigned at signup (USER by default) and can be changed by admins.
- Authorization is checked on every request — tokens cannot be reused if the user's role changes.

---

# 🎯 Chapter Outcome

CartWise now has role-based access control:

```text
Before CH19                     After CH19

Anyone who logs in can do      Users can manage their own data
everything they can access      Admins can manage users and system
                                Two tiers of authorization
```

CartWise is now genuinely multi-tenant in terms of permissions.

# 📋 Chapter 20 — Admin Features & Audit Logging
