# 📖 CH18 — Glossary

> **Project:** CartWise  
> **Chapter:** Authentication & Authorization

This glossary explains the important terms and concepts introduced while adding authentication and authorization to CartWise.

---

# 🔐 Authentication

Authentication is proving who you are.

You prove your identity by providing a password. The backend verifies the password, and if correct, issues a token (JWT) that proves you logged in without needing to re-enter the password.

---

# 🔒 Authorization

Authorization is what you're allowed to do once authenticated.

Once you've proven who you are, authorization rules decide what you can access. "You can see your own wishlist, but not another user's wishlist."

---

# 🔑 Password

A password is a secret string the user chooses and only they know.

CartWise never stores passwords in plaintext — it stores a one-way hash of the password instead.

---

# 🔗 Password Hash

A password hash is the result of running a password through a one-way hashing function (BCrypt).

```text
password: "cartwise-dev-password"
hash:     "$2a$10$<22-char salt><31-char hash>"
```

The hash is one-way — you cannot reverse it to get the password back. When the user logs in, their entered password is hashed and compared to the stored hash.

---

# 🔪 BCrypt

BCrypt is an industry-standard password hashing algorithm.

It is intentionally slow (cost parameter controls slowness) to make brute-force attacks (trying millions of passwords) impractical. Cost 10 takes ~100ms per hash — slow enough to be secure, fast enough to not annoy users.

---

# 📦 Salt

A salt is random data mixed into the password before hashing, ensuring two users with the same password have different hashes.

BCrypt generates and encodes the salt into the hash automatically, so you don't manage it separately.

---

# 🎟️ JWT (JSON Web Token)

A JWT is a compact, self-contained token that proves authentication.

Structure: `header.payload.signature`

The frontend stores it and includes it in API requests. The backend validates the signature to ensure it wasn't tampered with, and checks the expiration to ensure it hasn't expired.

---

# 📋 JWT Payload

The payload is the middle part of a JWT, containing claims (data):

```json
{
  "sub": "5",                    // subject (user ID)
  "email": "alice@example.com",
  "iat": 1692940000,             // issued at
  "exp": 1693026400              // expiration time
}
```

The payload is Base64-encoded but NOT encrypted — anyone can read it by decoding Base64. Do not put secrets (passwords, API keys) in the payload.

---

# ✍️ JWT Signature

The signature is HMAC-SHA512(secret, header.payload) — a cryptographic proof that the backend issued this token.

If anyone tampers with the payload, the signature becomes invalid. The backend detects the tampering and rejects the token.

---

# 🔐 JWT Secret

The JWT secret is a private key stored on the backend that signs and validates tokens.

Only the backend knows the secret. The frontend never sees it. If an attacker steals the secret, they can forge tokens.

---

# ⏱️ JWT Expiration

A JWT includes an `exp` (expiration time) claim. After that time, the token is invalid.

CartWise tokens expire after 24 hours by default. The user must log in again to get a new token.

---

# 📡 Bearer Token

A Bearer Token is a credential that is sent in the HTTP `Authorization` header as:

```
Authorization: Bearer <token>
```

The term "Bearer" means "this token authenticates the bearer (the person holding it)." The backend extracts the token and validates it.

---

# 🎯 Claims

Claims are statements in a JWT payload about the authenticated user.

```json
{
  "sub": "5",              // claim: subject is user 5
  "email": "alice@example.com"  // claim: email is this
}
```

---

# 🔍 Token Validation

Token validation is checking that a JWT is authentic and not expired.

Steps:
1. Extract the token from the Authorization header
2. Split the token on `.` to get header.payload.signature
3. Re-compute the signature using the server's secret
4. Compare computed vs. provided signature — if they don't match, reject
5. Extract the `exp` claim and check if current time < exp — if not, reject
6. Extract user data from the payload

---

# 📝 Stateless Authentication

Stateless authentication means the server doesn't store session data — it just validates tokens.

```text
Stateful (traditional sessions):    Backend stores session in database
                                    Frontend sends session ID
                                    Backend looks up session

Stateless (JWT):                    Backend signs a token
                                    Frontend stores and sends token
                                    Backend validates signature (no database lookup)
```

JWT is stateless — no database lookup needed to validate a token.

---

# 🚪 Access Control

Access control is the mechanism that decides whether a request is allowed.

```text
User tries: GET /api/users/1/wishlist
with token for: user 2

Checks:
  1. Is the token valid? Yes
  2. Does it belong to a real user? Yes
  3. Is this user authorized for this resource? No (user 2 != user 1)
  
Result: 403 Forbidden
```

---

# 👮 401 Unauthorized

HTTP 401 means the request lacks valid authentication credentials.

```bash
GET /api/users/1/wishlist (no Authorization header)
```

The request was never authenticated — the backend doesn't know who you are.

---

# 🚫 403 Forbidden

HTTP 403 means the request is authenticated but not authorized.

```bash
GET /api/users/1/wishlist
Authorization: Bearer <token-for-user-2>
```

The backend knows you're user 2, but user 2 is not allowed to access user 1's data.

---

# 🔑 Principal

A Principal is the authenticated identity — the user who is making the request.

In Spring Security, `@AuthenticationPrincipal` injects the authenticated user into a controller method.

```java
public ResponseEntity<List<WishlistItemDto>> getUserWishlist(
    @AuthenticationPrincipal AuthenticatedUser user
) {
    // user is the authenticated principal
}
```

---

# 🛡️ Security Context

The Security Context is where Spring Security stores the authenticated user during a request.

After the JWT filter validates a token, it stores the user in the security context. Controllers and services can retrieve it via `@AuthenticationPrincipal` or `SecurityContextHolder`.

---

# 🔄 JWT Filter

A JWT Filter is a Spring Filter that runs before every request to extract and validate the JWT token.

```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest request, ...) {
        // Extract token from Authorization header
        // Validate token
        // Store user in security context
        // Let request proceed
    }
}
```

---

# ⚙️ Security Filter Chain

The Security Filter Chain is a series of filters that process a request before it reaches the controller.

```
Request
  ↓
CORS Filter
  ↓
JWT Authentication Filter
  ↓
Security Authorization Filter
  ↓
Controller
```

The JWT filter runs early, extracting and validating the token.

---

# 📜 Signup

Signup is the process of creating a new user account.

1. User provides email and password
2. Backend validates input
3. Backend checks if email already exists
4. Backend hashes password with BCrypt
5. Backend saves User(email, passwordHash) to database
6. Backend generates JWT token
7. Response: 201 Created + token

The user is immediately logged in after signup (token is returned).

---

# 🔑 Login

Login is the process of proving your identity to get a token.

1. User provides email and password
2. Backend finds user by email
3. Backend compares entered password to stored hash
4. If match: generate JWT token, return 200 + token
5. If no match: return 401 (generic message, don't reveal password is wrong vs. email unknown)

---

# 📧 Email Normalization

Email normalization is converting email to a canonical form for comparison.

```text
"alice@example.com"    → alice@example.com
"Alice@Example.COM"    → alice@example.com
"  alice@example.com " → alice@example.com
```

CartWise normalizes emails (lowercase, trim whitespace) before storing and comparing, so the same user can't sign up twice with different cases or spaces.

---

# 🔐 Enumeration Attack

An enumeration attack is when an attacker probes an API to learn what data exists.

```bash
GET /api/users/1/wishlist → 404 = user doesn't exist?
GET /api/users/2/wishlist → 404 = user doesn't exist?
GET /api/users/100/wishlist → 200 = user exists!
```

CartWise prevents this by returning 403 (not yours) instead of 404 (not found), so attackers can't tell if a user ID is real.

---

# 🔒 Rate Limiting

Rate Limiting is restricting how many requests a user can make in a time window.

CartWise doesn't have rate limiting in Chapter 18. An attacker could try millions of passwords on the login endpoint. Chapter 21 will add this.

---

# 🧂 Credential Stuffing

Credential Stuffing is using stolen credentials (from another service) to attack CartWise.

If a user reuses the same password on multiple services, and one service is breached, an attacker can try that password on CartWise. BCrypt makes each attempt slow, but doesn't prevent this attack entirely. Rate limiting (Chapter 21) will help.

---

# 🔄 Refresh Token

A Refresh Token is a long-lived token that can be exchanged for a new access token without re-entering the password.

CartWise doesn't have refresh tokens in Chapter 18. Access tokens expire after 24 hours; the user logs in again. Chapter 19+ will consider refresh tokens.

---

# 🎭 Role

A Role is a label for a category of users (admin, user, guest).

CartWise doesn't have roles in Chapter 18. Everyone who logs in has the same permissions. Chapter 19 adds roles and role-based access control.

---

# 🔑 Permission

A Permission is an action a user is allowed to perform (read_wishlist, delete_wishlist, admin_delete_user).

CartWise doesn't have permissions in Chapter 18 — authorization is only "is this your data?" Chapter 19 adds fine-grained permissions.

---

# 🚪 Logout

Logout is clearing the user's authentication credentials.

On the frontend, logout removes the JWT token from localStorage. The backend doesn't explicitly "logout" users (stateless), but once the token expires, the user is logged out automatically.

---

# 🔄 Session

A Session is a period of time a user is logged in.

Stateless (JWT) sessions last until the token expires (24 hours). Stateful (database) sessions can be revoked by the backend anytime.

---

# 🧬 Hashing Function

A Hashing Function is a one-way function that converts input to a fixed-size output.

```text
hash("password") → "$2a$10$abcdefgh..."
hash("password") → "$2a$10$abcdefgh..."  (same input, same hash)
hash("passwor") → "$2a$10$zyxwvut..."   (slightly different input, completely different hash)

Cannot reverse: you can't get "password" back from "$2a$10$..."
```

Used for passwords (BCrypt), data integrity (SHA256), and many other purposes.

---

# 🔀 Timing Attack

A Timing Attack is when an attacker measures how long a request takes to guess secrets.

```bash
Login with wrong password:     50ms (password check completes)
Login with nonexistent email:  100ms (email lookup completes, then password check)
```

An attacker can tell by response time whether the email exists. CartWise prevents this by using the same message ("Invalid email or password") and timing both checks the same way (checking password even if email not found).

---

# 🛡️ HTTPS (in Production)

HTTPS is encryption in transit. All communication between browser and server is encrypted.

CartWise development uses HTTP (unencrypted). Production (Chapter 23) must use HTTPS, or anyone on the network could intercept the JWT token and impersonate the user.

---

# 🔐 Secure Flag (Cookie)

The Secure flag tells the browser to only send a cookie over HTTPS.

CartWise stores JWT in localStorage (not cookies) in development, so this doesn't apply yet. If production used cookies for tokens, Secure flag would be essential.

---

# 🍪 HttpOnly Flag (Cookie)

The HttpOnly flag tells the browser to not expose a cookie to JavaScript, preventing XSS attacks from stealing it.

CartWise stores JWT in localStorage, which JavaScript can access. This is a known XSS risk, mitigated in production by HTTPS, CSP, and input sanitization.

---

# 🎯 Spring Security

Spring Security is a framework that handles authentication and authorization.

CartWise uses Spring Security's filter chain to intercept requests, validate JWT tokens, and enforce authorization rules.

---

# 📋 @AuthenticationPrincipal

`@AuthenticationPrincipal` is a Spring annotation that injects the authenticated user into a controller method.

```java
public ResponseEntity<Void> addToWishlist(
    @AuthenticationPrincipal AuthenticatedUser user
) {
    // user is the authenticated principal (null if not authenticated)
}
```

If no user is authenticated, user is null. The method can check for null to detect unauthenticated requests.
