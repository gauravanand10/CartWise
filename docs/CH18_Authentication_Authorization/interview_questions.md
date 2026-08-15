# 🎯 CH18 — Interview Questions

> **Project:** CartWise  
> **Chapter:** Authentication & Authorization
>
> This chapter covers password hashing, JWT tokens, signup/login endpoints, token validation, per-user authorization, and the difference between authentication and authorization.

---

# 📚 Beginner Level

## Q1. What is the difference between authentication and authorization?

### Answer

```text
Authentication:   who are you?
                  You prove your identity with a password.
                  CartWise issues a JWT token to confirm.

Authorization:    what can you do?
                  You have a token. What resources can you access?
                  You can access your own wishlist, not anyone else's.
```

Chapter 18 focuses on authentication (password + JWT). Chapter 19 adds authorization (roles, permissions).

---

## Q2. Why doesn't CartWise store passwords in plaintext?

### Answer

If a database is breached, attackers steal the plaintext passwords and can log into every user's account on CartWise and every other service where that user reused the password.

If passwords are hashed, attackers get the hash, which is useless — they can't reverse it to get the password. A user's security depends on password strength, not database security.

---

## Q3. What is BCrypt, and why is it used instead of a faster hashing algorithm?

### Answer

BCrypt is a password hashing algorithm that is intentionally slow.

A faster algorithm (like MD5) would let an attacker try millions of passwords per second. BCrypt with cost 10 takes ~100ms per hash, making brute-force attacks impractical. Speed matters for security here — slower is better.

---

## Q4. What is a JWT, and how does it prove authentication?

### Answer

A JWT (JSON Web Token) is a compact token with three parts: header.payload.signature.

The signature is computed with the server's secret: `HMAC-SHA512(secret, header.payload)`.

When the client sends a token, the server re-computes the signature and compares. If they match, the token is authentic (came from this server, not forged).

---

## Q5. What does a JWT token contain?

### Answer

The payload contains claims about the user:

```json
{
  "sub": "5",                    // subject: user ID
  "email": "alice@example.com",
  "iat": 1692940000,             // issued at (Unix timestamp)
  "exp": 1693026400              // expiration time (Unix timestamp)
}
```

The payload is Base64-encoded but NOT encrypted — anyone can read it by decoding. Do not put secrets in it.

---

## Q6. How does the frontend use a JWT token?

### Answer

1. After signup/login, the backend returns a token
2. Frontend stores it in localStorage: `localStorage.setItem('authToken', token)`
3. On every API request, frontend includes it in the Authorization header: `Authorization: Bearer <token>`
4. Backend extracts and validates the token
5. If valid, the request proceeds. If invalid, the backend returns 401 or 403

---

## Q7. What does the JWT filter do?

### Answer

The JWT filter runs before every request to extract and validate the token:

1. Looks for `Authorization: Bearer <token>` header
2. If found, validates the signature and expiration
3. If valid, stores the user in the security context
4. Allows the request to proceed with the authenticated user
5. If invalid or missing, stores nothing (request proceeds unauthenticated)

Later, authorization rules decide if unauthenticated requests are allowed.

---

## Q8. What is the difference between 401 and 403?

### Answer

```text
401 Unauthorized    the request lacks valid authentication credentials
                    (no token, invalid token, expired token)
                    "Who are you?"

403 Forbidden       the request is authenticated but not authorized
                    (you're user 2, but trying to access user 1's data)
                    "I know who you are, but you can't do that"
```

---

## Q9. What happens when a user signs up?

### Answer

1. User sends email and password to POST /api/auth/signup
2. Backend validates input (email format, password length)
3. Backend checks if email already exists (409 if yes)
4. Backend hashes password with BCrypt
5. Backend saves User(email, passwordHash) to database
6. Backend generates JWT token
7. Response: 201 Created + `{userId, email, token}`

The user is immediately logged in (token is returned).

---

## Q10. What happens when a user logs in?

### Answer

1. User sends email and password to POST /api/auth/login
2. Backend finds user by email (or not found)
3. Backend compares entered password to stored hash
4. If match: generate JWT token, return 200 OK + token
5. If no match: return 401 Unauthorized

Importantly: if email not found, still return 401 with the same message ("Invalid email or password"). This prevents enumeration attacks.

---

# 📚 Intermediate Level

## Q11. Why does CartWise return the same error message for "wrong password" and "unknown email"?

### Answer

If the error messages differed:

```bash
POST /api/auth/login { email: "alice@example.com", password: "wrong" }
→ "Password incorrect" (user 1 exists!)

POST /api/auth/login { email: "bob@example.com", password: "any" }
→ "User not found" (user 2 doesn't exist)
```

An attacker could use this to enumerate valid emails. CartWise prevents this:

```bash
Both cases → 401 "Invalid email or password"
```

No way to tell the difference — the attacker can't learn which emails are real.

---

## Q12. Walk through a request to access a protected endpoint with a valid token.

### Answer

```text
1. Frontend: GET /api/users/2/wishlist
             Header: Authorization: Bearer eyJ...

2. Spring routes to JWT filter:
   - Extracts token from Authorization header
   - Validates signature (recomputes and compares)
   - Checks expiration (current time < exp)
   - Both valid: extracts userId=2, stores in security context

3. Spring routes to WishlistController.getUserWishlist()
   - @AuthenticationPrincipal user = AuthenticatedUser(2)
   - @PathVariable userId = 2
   - Checks: user.userId (2) == userId (2) ✓
   - Calls wishlistService.getUserWishlist(2)

4. Service queries database, returns list of products

5. Controller returns 200 OK + wishlist JSON
```

---

## Q13. Walk through a request to access another user's wishlist with your token.

### Answer

```text
1. Frontend: GET /api/users/1/wishlist
             Header: Authorization: Bearer <token-for-user-2>

2. JWT filter:
   - Extracts and validates token
   - Token is valid, userId=2
   - Stores user 2 in security context

3. WishlistController.getUserWishlist():
   - @AuthenticationPrincipal user = AuthenticatedUser(2)
   - @PathVariable userId = 1
   - Checks: user.userId (2) == userId (1) ✗
   - Returns 403 Forbidden

4. Client receives: HTTP 403
   (no information about whether user 1 exists or has a wishlist)
```

---

## Q14. Why does the JWT filter return 403 instead of 404 when a user tries to access another user's wishlist?

### Answer

A 404 would signal "user 1 doesn't exist." An attacker could use this to enumerate valid user IDs:

```bash
GET /api/users/1/wishlist → 403 = user exists but not yours
GET /api/users/2/wishlist → 403 = user exists but not yours
GET /api/users/999/wishlist → 403 = user exists but not yours (same message!)
```

No way to tell if user 999 is real. This is called "not leaking information via error codes."

---

## Q15. What does BCrypt cost parameter 10 mean, and what would happen if it were 5?

### Answer

Cost 10 means BCrypt applies the hashing function 2^10 = 1024 times. It takes ~100ms per hash.

Cost 5 means 2^5 = 32 times. It would take ~3ms per hash.

With cost 5, an attacker could try millions of passwords in seconds. Cost 10 is slow enough to make brute-force impractical. The trade-off: legitimate logins take 100ms instead of 3ms — worth it for security.

---

## Q16. Why must password length be validated (8–72 bytes) even though BCrypt will reject longer passwords?

### Answer

BCrypt silently ignores input past 72 bytes:

```bash
password: "short" → hashed
password: "short" + "a" * 1000 → silently truncated to 72 bytes, hashed the same as "short" + "a" * 72
```

A user might believe their 200-character password is secure, but only the first 72 bytes matter. CartWise rejects passwords > 72 bytes with a 400 error, forcing the user to choose a password they can actually use (not accidentally weakened).

---

## Q17. How does the frontend know if the user is logged in?

### Answer

The frontend checks for the presence of the JWT token in localStorage:

```javascript
const token = localStorage.getItem('authToken');
if (token) {
    // User is logged in, can show "logged in as" UI
} else {
    // User is not logged in, show login/signup buttons
}
```

This is client-side only. The server doesn't maintain a "logged in users" list (stateless authentication).

---

## Q18. What happens if a JWT token expires while a user is using the app?

### Answer

The user makes a request with an expired token. The backend's JWT validation fails (current time > exp). The filter returns 401 Unauthorized.

The frontend catches the 401 and redirects to login. The user logs in again, gets a new token, and continues.

This is a user experience problem that refresh tokens (Chapter 19) would solve — get a new access token without re-entering the password.

---

## Q19. Why is the JWT secret never sent to the frontend?

### Answer

Only the backend has the secret. The frontend never sees it. If an attacker had the secret, they could forge any token (create a token for any user ID).

```text
Without secret: attacker can read tokens (Base64 decode payload)
                but cannot forge (signature would be wrong)

With secret:    attacker can forge any token
```

---

## Q20. How does CartWise prevent timing attacks on the login endpoint?

### Answer

A timing attack would measure response time to guess whether an email is registered:

```bash
Unknown email:    100ms (email lookup + early exit)
Wrong password:   150ms (email lookup + password hash)
```

CartWise prevents this by hashing the password even if the email isn't found, and using the same message for both cases. Response time is consistent regardless of whether the email exists.

---

# ⚛️ JWT/Spring Security-Specific Questions

## Q21. What does `@AuthenticationPrincipal` do?

### Answer

It injects the authenticated user into a controller method:

```java
public ResponseEntity<Void> addToWishlist(
    @AuthenticationPrincipal AuthenticatedUser user,
    @PathVariable Long userId
) {
    // user is the authenticated principal from the security context
    // null if not authenticated
}
```

Spring extracts the user from SecurityContextHolder and passes it.

---

## Q22. What is the SecurityContextHolder, and who sets it?

### Answer

SecurityContextHolder is a thread-local storage of the authenticated user during a request.

The JWT filter sets it:

```java
SecurityContext context = SecurityContextHolder.createEmptyContext();
UsernamePasswordAuthenticationToken auth = 
    new UsernamePasswordAuthenticationToken(user, null, List.of());
context.setAuthentication(auth);
SecurityContextHolder.setContext(context);
```

Controllers retrieve it via `@AuthenticationPrincipal` or manually via `SecurityContextHolder.getContext().getAuthentication()`.

---

## Q23. Why is `SessionCreationPolicy.STATELESS` used in SecurityConfig?

### Answer

```java
.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
```

This tells Spring Security not to create or manage HTTP sessions (cookies). CartWise uses JWT tokens instead, which are stateless (no server-side session storage).

Stateless means the backend can scale horizontally — any server can validate a token without looking in a shared session database.

---

## Q24. What does `OncePerRequestFilter` do?

### Answer

`OncePerRequestFilter` is a Spring filter that runs exactly once per request, even if the request is forwarded or included multiple times (via `RequestDispatcher`).

```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    protected void doFilterInternal(...) { ... }
}
```

It guarantees the JWT is extracted and validated exactly once, not multiple times.

---

## Q25. Why does the JWT filter return void and call `filterChain.doFilter()` at the end?

### Answer

The filter chain pattern requires each filter to explicitly call the next filter:

```java
doFilterInternal(...) {
    // extract and validate token
    // set security context
    filterChain.doFilter(request, response);  // call next filter/controller
}
```

If the filter doesn't call `doFilter()`, the request stops and never reaches the controller.

---

# 🏗️ Architecture Questions

## Q26. Why is the UserService needed if UserRepository can save users?

### Answer

The service encapsulates business logic:

```java
// Wrong: controller calls repository directly
userRepository.save(new User(email, password));

// Right: service hashes password
userService.signup(email, password);
  → hash password
  → check email not duplicate
  → save user
  → generate token
  → return response
```

If multiple controllers needed signup logic, it would be duplicated. The service centralizes it.

---

## Q27. Why store AuthenticatedUser (userId, email) in the token instead of storing the entire User object?

### Answer

The token is sent on every request. A large payload increases bandwidth.

```text
Small: { "sub": "5", "email": "alice@example.com" }
       - fits in HTTP header
       - fast to transmit

Large: { "id": 5, "email": "alice@example.com", "createdAt": ..., "passwordHash": "..." }
       - wastes bandwidth on every request
       - risks leaking sensitive data
```

The token should be minimal. If the controller needs full User data, it queries the database.

---

## Q28. If the JWT secret is compromised, what should CartWise do?

### Answer

Change the secret and invalidate all existing tokens.

```yaml
# application-prod.yml
app:
  jwt:
    secret: ${NEW_SECRET}
```

All tokens signed with the old secret would fail validation. Users would have to log in again.

This is why the secret must never be committed to the repository or logged.

---

## Q29. Why does JwtTokenProvider.authenticate() return Optional<AuthenticatedUser> instead of throwing an exception?

### Answer

Returning Optional is safer and more explicit:

```java
// With Optional
jwtTokenProvider.authenticate(token)
    .ifPresent(user -> { /* store in security context */ });

// With exception
try {
    AuthenticatedUser user = jwtTokenProvider.authenticate(token);
    // store
} catch (InvalidTokenException e) {
    // handle
}
```

Optional makes it clear the token might be invalid. Exceptions are for unexpected errors, not for expected failures (invalid token is common).

---

## Q30. How would you implement a logout endpoint in Chapter 18?

### Answer

In stateless (JWT) authentication, logout is:

```java
@PostMapping("/logout")
public ResponseEntity<Void> logout() {
    // Nothing to do on the backend
    // Token is valid until it expires
    return ResponseEntity.ok().build();
}
```

The backend has no session to destroy. Logout happens on the frontend:

```javascript
localStorage.removeItem('authToken');
// User is now logged out (no token to send)
```

When the token expires (24 hours later), the backend automatically denies requests.

---

# 🧪 Scenario-Based Questions

## Q31. A user signs up with email "alice@example.com" and password "Secure1234!". Later, they try to sign up again with "ALICE@EXAMPLE.COM" and a different password. What happens?

### Answer

The endpoint normalizes emails (lowercase, trim):

```
"alice@example.com" → alice@example.com
"ALICE@EXAMPLE.COM" → alice@example.com
```

Both normalize to the same value. The second signup attempt finds the email already exists and returns 409 Conflict.

The user cannot have two accounts with different cases of the same email.

---

## Q32. A user's token is about to expire (1 minute left). They make a request to GET /api/users/1/wishlist. What happens?

### Answer

The JWT filter validates the token:
- Signature check: valid ✓
- Expiration check: current time (1 minute before exp) < exp ✓
- Token is still valid

The request succeeds. The user continues using the app. After the 1 minute passes, the next request will return 401 Unauthorized.

---

## Q33. A malicious user modifies the JWT token in their browser (changes `"sub": "2"` to `"sub": "1"`), then makes a request. What happens?

### Answer

1. Frontend sends the modified token
2. JWT filter extracts it
3. Attempts to validate the signature
4. Re-computes: HMAC-SHA512(secret, modifiedHeader.modifiedPayload)
5. Compares to the signature in the token
6. They don't match (signature was computed with the original payload)
7. Token is rejected, 401 Unauthorized

The attacker can't forge a valid signature without the server's secret.

---

## Q34. A developer accidentally logs the JWT token in the application logs, and those logs are stored in a plain-text file. What's the security impact?

### Answer

Anyone with access to the logs can extract the token and impersonate that user until the token expires (24 hours later).

This is a data breach. The team should:
1. Rotate the JWT secret (invalidate all existing tokens)
2. Force all users to re-login
3. Secure the log files (encryption, access control)
4. Never log sensitive data (tokens, passwords, secrets)

This is why the JWT secret must never be logged.

---

## Q35. A user's device is stolen. The attacker finds the JWT token in localStorage and makes requests. How is this mitigated?

### Answer

Short-term: the token is valid for 24 hours, so the attacker has 24 hours to access the user's data.

Long-term mitigations (Chapter 20+):
- Email verification: notify the user if a new device logs in
- Device fingerprinting: detect unusual access patterns
- User can manually revoke sessions (logout from other devices)
- HTTPS only: prevent network-level interception

For now (Chapter 18), the best the user can do is change their password, which invalidates the old token... wait, Chapter 18 doesn't have password change. They'd have to wait 24 hours.

This is a gap that Chapter 20+ will address.

---

# 📌 Summary

These questions cover:

- Authentication vs. authorization
- Password hashing and BCrypt
- JWT structure, signing, and validation
- Signup and login flows
- Token expiration and validation
- 401 vs. 403 status codes
- Enumeration attack prevention
- Frontend token storage and usage
- Spring Security filters and contexts
- Stateless vs. stateful authentication
- Timing attack prevention
- Email normalization
- Security implications of token theft
