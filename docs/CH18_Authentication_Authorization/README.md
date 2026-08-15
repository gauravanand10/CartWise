# 🔐 CH18 — Authentication & Authorization

> **Project:** CartWise  
> **Chapter:** Authentication & Authorization

---

# 👋 Welcome

Chapter 17 built five open endpoints. Anyone could call them. No passwords, no login, no concept of "user."

That works for a prototype. It does not work for a product where users save personal wishlists, and the wishlist must remain private to them.

Chapter 18 is where CartWise becomes a multi-user system. Users sign up with an email and password. The backend hashes the password (never stores it in plaintext). On login, the backend issues a JWT token. The frontend stores the token and includes it in every API request. The backend validates the token and enforces that users can only access their own data.

By the end of this chapter, a user's wishlist is private — only they can see it, even if they know another user's ID.

---

# 🎯 Learning Objectives

By the end of this chapter, you will understand:

- Why passwords are hashed and never stored in plaintext.
- What a JWT (JSON Web Token) is and how it works.
- How a token travels from the backend to the frontend and back.
- How the backend validates a token on every request.
- The difference between authentication (who are you?) and authorization (what can you do?).
- Why a 403 Forbidden is different from a 404 Not Found (enumeration attacks).
- How to protect endpoints so only the right user can access them.
- Why login and signup don't require a token, but everything else does.
- What refresh tokens are and why Chapter 18 defers them.
- How to test authentication and authorization with curl and from the browser.

---

# 👤 Authentication vs. Authorization

Two different concepts that often get confused:

```text
Authentication:   who are you?
                  You prove your identity with a password.
                  The backend issues a token to prove you logged in.

Authorization:    what can you do?
                  You have a token. What resources can you access?
                  You can access your own wishlist, not anyone else's.
```

Chapter 18 focuses on authentication (password hashing, JWT tokens, login/signup). Chapter 19 will add authorization (roles, permissions, who can do what).

---

# 🔑 The Journey of a JWT Token

```text
User's browser
      ↓
[clicks signup]
      ↓
POST /api/auth/signup { email, password }
      ↓
Backend:
  1. Hash password with BCrypt
  2. Save User(email, passwordHash) to database
  3. Generate JWT token with userId + email
      ↓
Response: 201 + { userId, email, token }
      ↓
Frontend stores token in localStorage
      ↓
User clicks "add to wishlist"
      ↓
POST /api/users/1/wishlist
  Header: Authorization: Bearer <token>
  Body: { productSlug }
      ↓
Backend:
  1. Extract token from Authorization header
  2. Validate token signature and expiry
  3. Extract userId from token
  4. Check: does userId match the URL path?
  5. If yes: proceed. If no: return 403 Forbidden
      ↓
Response: 201 Created (wishlist item added)
```

The token is the proof of identity. It travels with every request. The backend never has to ask "who are you?" again until it expires.

---

# 🔒 Password Hashing — BCrypt

CartWise never stores passwords in plaintext. Instead, it stores the result of hashing the password with BCrypt.

```text
Raw password:     "cartwise-dev-password"
                  ↓ BCrypt hash (cost 10)
Stored hash:      "$2a$10$<22-char salt><31-char hash>"
```

The hash is one-way — you cannot reverse it to get the password back. When the user logs in and types a password, CartWise hashes it with the same algorithm and compares the hashes.

```java
@Component
public class PasswordHasher {
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);

    public String hash(String password) {
        return encoder.encode(password);
    }

    public boolean matches(String rawPassword, String hashedPassword) {
        return encoder.matches(rawPassword, hashedPassword);
    }
}
```

BCrypt's cost parameter (10) controls how slow the hashing is. Higher costs take longer, which makes brute-force attacks (trying millions of passwords) impractical. Cost 10 takes ~100ms per hash — slow enough to be secure, fast enough to not annoy users.

**Important:** BCrypt silently ignores input past 72 bytes. CartWise validates password length (8–72 bytes) and rejects anything longer with a 400 error, preventing a user from relying on security in a password that only exists partially.

---

# 📡 JWT — JSON Web Token

A JWT is a compact, stateless token. The server doesn't store tokens in a database — it just validates them cryptographically.

```text
JWT structure:    header.payload.signature
                  ↑      ↑       ↑
                  |      |       ← HMAC-SHA512(secret, header.payload)
                  |      ← JSON: { sub: "2", email: "grace@example.com", exp: ... }
                  ← JSON: { alg: "HS512", typ: "JWT" }
```

The entire token is Base64-encoded and looks like:

```text
eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZW1haWwiOiJncmFjZUBleGFtcGxlLmNvbSIsImlhdCI6MTY5Mjk0MDAwMCwiZXhwIjoxNjkyOTQwMzYwMH0.signature
```

To validate it:

1. Split on `.` to get header.payload.signature
2. Re-compute the signature using the server's secret: `HMAC-SHA512(secret, header.payload)`
3. Compare the computed signature to the one in the token
4. If they match, the token is authentic (came from this server, wasn't tampered with)
5. Check the `exp` (expiration) claim — if current time > exp, token is expired

If any step fails (bad signature, expired, malformed), the token is invalid.

```java
@Component
public class JwtTokenProvider {
    @Value("${cartwise.jwt.secret}")
    private String jwtSecret;

    @Value("${cartwise.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    private final Clock clock;

    public JwtTokenProvider(Clock clock) {
        this.clock = clock;
    }

    public String generateToken(Long userId, String email) {
        Instant now = Instant.now(clock);
        Instant expiresAt = now.plusMillis(jwtExpirationMs);

        return Jwts.builder()
            .subject(String.valueOf(userId))
            .claim("email", email)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS512)
            .compact();
    }

    public Optional<AuthenticatedUser> authenticate(String token) {
        try {
            JwtParser parser = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                .setClock(() -> new Date(System.currentTimeMillis(clock)))
                .build();

            Claims claims = parser.parseClaimsJws(token).getBody();
            Long userId = Long.valueOf(claims.getSubject());
            String email = (String) claims.get("email");

            return Optional.of(new AuthenticatedUser(userId, email));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
```

---

# 👥 User Entity — Complete the Stub

Chapter 16 created a User stub with `id` and `email`. Chapter 18 adds authentication fields:

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

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    // Constructor, getters, setters
}
```

**What was NOT added (deferred to Chapter 19+):**
- Roles or permissions
- Email verification flag
- Account status (active, suspended, deleted)
- Last login timestamp
- Refresh token storage

Keeping Chapter 18 focused on authentication (password + JWT) makes it digestible. Authorization (who can do what) is a separate concern.

---

# 🔐 Two New Endpoints — Signup and Login

**POST /api/auth/signup**

Request:
```json
{
  "email": "grace@example.com",
  "password": "cartwise-secure-password"
}
```

Response (201 Created):
```json
{
  "userId": 2,
  "email": "grace@example.com",
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIi..."
}
```

The token is a JWT. The frontend stores it (typically in localStorage) and includes it in all future requests.

Error cases:
- Missing email or password → 400 Bad Request
- Email already exists → 409 Conflict (with normalized email, so "grace@example.com", "Grace@Example.COM", and "  grace@example.com  " all match)
- Password too short (< 8 chars) or too long (> 72 bytes) → 400 Bad Request
- Invalid email format → 400 Bad Request

**POST /api/auth/login**

Request:
```json
{
  "email": "grace@example.com",
  "password": "cartwise-secure-password"
}
```

Response (200 OK):
```json
{
  "userId": 2,
  "email": "grace@example.com",
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIi..."
}
```

Same response shape as signup.

Error cases:
- Missing email or password → 400 Bad Request
- Unknown email or wrong password → 401 Unauthorized (exact same message for both, to prevent enumeration attacks — an attacker can't learn which registered users exist by trying different emails)
- Malformed JSON → 400 Bad Request

---

# 🎟️ The JWT Filter

On every request, a filter intercepts the request, extracts the token from the `Authorization` header, validates it, and stores the authenticated user in Spring Security's context.

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = extractTokenFromHeader(request);

        if (token != null) {
            jwtTokenProvider.authenticate(token)
                .ifPresent(user -> {
                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    UsernamePasswordAuthenticationToken auth = 
                        new UsernamePasswordAuthenticationToken(user, null, List.of());
                    context.setAuthentication(auth);
                    SecurityContextHolder.setContext(context);
                });
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromHeader(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

If the token is valid, the user is authenticated and stored in the security context. If the token is invalid or missing, the security context remains empty.

Later, authorization rules decide: if a context is empty, return 401. If a context exists but the user is not authorized for this resource, return 403.

---

# 🛡️ Security Configuration

Spring Security is configured to permit certain paths and require authentication for everything else:

```java
@Configuration
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ApiErrorSecurityHandler apiErrorSecurityHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()         // login, signup
                .requestMatchers("GET", "/api/products").permitAll()
                .requestMatchers("GET", "/api/products/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("OPTIONS", "/**").permitAll()       // CORS preflight
                .anyRequest().authenticated()                        // everything else needs a token
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling()
                .authenticationEntryPoint(apiErrorSecurityHandler)   // 401 responses
                .accessDeniedHandler(apiErrorSecurityHandler)        // 403 responses
            .and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        return http.build();
    }
}
```

Open endpoints:
- POST /api/auth/signup and POST /api/auth/login (no token required)
- GET /api/products and GET /api/products/{slug} (everyone can browse)
- GET /api/health (for monitoring)
- OPTIONS /** (CORS preflight requests have no Authorization header)

Protected endpoints:
- GET /api/users/{userId}/wishlist (requires token matching userId)
- POST /api/users/{userId}/wishlist (requires token matching userId)
- DELETE /api/users/{userId}/wishlist/{slug} (requires token matching userId)

---

# 🔒 Per-User Authorization — The Wishlist Endpoints

The three wishlist endpoints now check that the token's userId matches the URL's userId:

```java
@GetMapping
public ResponseEntity<List<WishlistItemDto>> getUserWishlist(
    @PathVariable Long userId,
    @AuthenticationPrincipal AuthenticatedUser user
) {
    if (user == null || !user.userId().equals(userId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    return ResponseEntity.ok(wishlistService.getUserWishlist(userId));
}
```

Three scenarios:

**Scenario 1: No token**
```bash
GET /api/users/1/wishlist
```
No Authorization header → Spring Security sees empty context → 401 Unauthorized

**Scenario 2: Token for a different user**
```bash
GET /api/users/1/wishlist
Authorization: Bearer <token-for-user-2>
```
Token is valid, user 2 is authenticated. But the URL says userId=1. The endpoint checks `user.userId() (2) != userId (1)` → 403 Forbidden

**Scenario 3: Token matches the URL**
```bash
GET /api/users/2/wishlist
Authorization: Bearer <token-for-user-2>
```
Token is valid, user 2 is authenticated, URL says userId=2. Check passes → 200 OK, return wishlist

Notice: scenario 2 returns 403, not 404. A 404 would reveal "this user doesn't exist or doesn't have a wishlist" — information an attacker could use to enumerate valid user IDs. A 403 just says "not yours" without revealing whether the ID is valid.

---

# 🎯 Enumeration Attacks — Why 403, Not 404

An enumeration attack is when an attacker probes endpoints to learn what data exists:

```bash
GET /api/users/1/wishlist  → 404 = user 1 might not exist
GET /api/users/2/wishlist  → 404 = user 2 might not exist
GET /api/users/100/wishlist → 200 = user 100 exists!
```

CartWise prevents this by always returning 403 for "not yours," whether the user exists or not:

```bash
GET /api/users/999/wishlist (no such user) → 403 (not yours)
GET /api/users/1/wishlist (user exists, not yours) → 403 (not yours)
GET /api/users/2/wishlist (user exists, yours) → 200 (here's the data)
```

An attacker cannot tell the difference between 403s, so they cannot learn which user IDs are real.

---

# 🚀 Frontend Integration

The frontend needs to:

1. On signup/login, extract the token from the response and store it:
```javascript
   const response = await fetch('/api/auth/signup', { ... });
   const { token } = await response.json();
   localStorage.setItem('authToken', token);
```

2. On every API request, include the token:
```javascript
   const token = localStorage.getItem('authToken');
   fetch('/api/users/2/wishlist', {
       headers: {
           'Authorization': `Bearer ${token}`
       }
   });
```

3. On logout, clear the token:
```javascript
   localStorage.removeItem('authToken');
```

If a request returns 401, the token is invalid or expired — the frontend should redirect to login.

---

# ⏱️ Token Expiration

The JWT includes an `exp` (expiration) claim. By default, CartWise tokens expire after 24 hours.

```yaml
cartwise:
  jwt:
    expiration-ms: 86400000  # 24 hours in milliseconds
```

After 24 hours, the token is invalid. The user must log in again to get a new token.

**Why no refresh tokens yet?** Refresh tokens let you exchange an expired token for a new one without re-entering the password. Chapter 18 doesn't have them because they add complexity (storing refresh tokens, rotation, revocation) that doesn't fit the chapter's scope. A 24-hour session is reasonable for CartWise at this stage.

---

# 🧪 Testing Authentication

**Signup with valid input:**

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Secure1234!"}'
```

Response (201 Created):
```json
{"userId":5,"email":"alice@example.com","token":"eyJ..."}
```

**Signup with duplicate email:**

```bash
curl -i -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Different!"}'
```

Response (409 Conflict):
```json
{"code":"EMAIL_ALREADY_REGISTERED","message":"Email already registered"}
```

**Login with correct password:**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Secure1234!"}'
```

Response (200 OK):
```json
{"userId":5,"email":"alice@example.com","token":"eyJ..."}
```

**Login with wrong password:**

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"WrongPassword"}'
```

Response (401 Unauthorized):
```json
{"code":"INVALID_CREDENTIALS","message":"Invalid email or password."}
```

Notice the message is the same for "wrong password" and "unknown email" — this prevents enumeration.

**Access wishlist without token:**

```bash
curl http://localhost:8080/api/users/5/wishlist
```

Response (401 Unauthorized):
```json
{"code":"UNAUTHORIZED","message":"Authentication required"}
```

**Access wishlist with token:**

```bash
curl http://localhost:8080/api/users/5/wishlist \
  -H "Authorization: Bearer eyJ..."
```

Response (200 OK):
```json
[]
```

**Access another user's wishlist with your token:**

```bash
curl http://localhost:8080/api/users/1/wishlist \
  -H "Authorization: Bearer <token-for-user-5>"
```

Response (403 Forbidden):
```json
{"code":"FORBIDDEN","message":"Access denied"}
```

---

# 📭 What Is Deliberately Not Here

**No refresh tokens.** You can't refresh an expired token without logging in again.

**No roles or permissions.** Everyone who logs in can do everything. Chapter 19 adds roles (admin, user, guest).

**No OAuth or social login.** No "sign in with Google." Chapter 20+.

**No email verification.** Anyone can sign up with any email. Chapter 20+.

**No password reset.** If you forget your password, you're locked out. Chapter 20+.

**No rate limiting on signup/login.** An attacker can try as many passwords as they want (though BCrypt is slow). Chapter 21.

**No two-factor authentication.** No SMS, authenticator app, or security keys. Chapter 21+.

---

# 📌 Key Takeaways

After Chapter 18:

- Users sign up with email and password; the password is hashed with BCrypt and never stored in plaintext.
- Login returns a JWT token that proves the user's identity.
- The token travels in the Authorization header on every request.
- The backend validates the token's signature and expiration on every request.
- Authorization checks ensure users can only access their own data.
- 403 Forbidden (not 404) is returned when a user tries to access someone else's data, preventing enumeration attacks.
- Open endpoints (signup, login, product list, health check) don't require a token.
- Protected endpoints (wishlist) require a valid token matching the requested userId.
- The frontend stores the token in localStorage and includes it in API requests.

---

# 🎯 Chapter Outcome

CartWise is now a multi-user, authenticated system:

```text
Before CH18                     After CH18

Anyone can call any endpoint    Only authenticated users can access their data
No concept of "user"            Each user has a private wishlist
Data is shared globally         Data is private to each user
```

By the end of Chapter 18, CartWise is production-ready in terms of authentication. Users are safe from each other's data.

# 👥 Chapter 19 — Authorization & Roles
