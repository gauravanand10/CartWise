# 🎯 CH19 — Interview Questions

> **Project:** CartWise  
> **Chapter:** Authorization & Roles
>
> This chapter covers role-based access control, JWT role claims, Spring Security authorization, admin endpoints, and the difference between authentication and authorization.

---

# 📚 Beginner Level

## Q1. What is the difference between authentication and authorization?

### Answer

```text
Authentication:   who are you?
                  Proved with a password → JWT token
                  "I am alice@example.com"

Authorization:    what can you do?
                  Determined by your role
                  "I am ADMIN, I can list all users"
```

Chapter 18 was authentication. Chapter 19 is authorization.

---

## Q2. What is a role, and how is it different from a permission?

### Answer

A role is a label for a category of users.

```text
Role: ADMIN
  → permissions: list_users, change_user_roles, delete_products, ...

Role: USER
  → permissions: read_own_wishlist, create_wishlist_entry, ...
```

A role groups many permissions. A permission is a single action.

CartWise Chapter 19 uses roles. Chapter 20+ will use fine-grained permissions.

---

## Q3. How many roles does CartWise have in Chapter 19?

### Answer

Two roles:
- USER (default, regular users)
- ADMIN (system administrators)

---

## Q4. What is the USER role allowed to do?

### Answer

A USER can:
- Manage their own wishlist (add, remove items)
- View their own wishlist
- Browse products

A USER cannot:
- See other users' wishlists
- Access admin endpoints
- Change another user's role

---

## Q5. What is the ADMIN role allowed to do?

### Answer

An ADMIN can:
- Do everything a USER can do
- List all users
- Change any user's role

In future chapters, ADMIN will also manage products, delete wishlists, etc.

---

## Q6. How is a user's role stored in the database?

### Answer

The `role` column in the `users` table stores the role as a string: "USER" or "ADMIN".

Java maps this to the Role enum via `@Enumerated(EnumType.STRING)`.

---

## Q7. How does the user's role travel from the database to the frontend?

### Answer

```text
Database: role = "ADMIN"
    ↓
User entity loaded
    ↓
JWT token generated: claim "role": "ADMIN"
    ↓
Token sent to frontend in signup/login response
    ↓
Frontend stores token in localStorage
    ↓
Frontend includes token in every API request
    ↓
Backend extracts role from token claim
    ↓
Backend checks: does this role have permission for this endpoint?
```

---

## Q8. What does `hasRole("ADMIN")` do in Spring Security?

### Answer

It checks if the authenticated user has the ADMIN role.

```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```

This tells Spring Security: "for /api/admin/**, the user must have the ADMIN role. If not, return 403 Forbidden."

---

## Q9. When a user signs up, what role are they assigned?

### Answer

User role. Every new user is assigned the USER role by default in the `signup()` method.

An admin can later promote them to ADMIN via the role change endpoint.

---

## Q10. What are the two admin endpoints in Chapter 19?

### Answer

GET /api/admin/users — lists all users (admin only)
PUT /api/admin/users/{userId}/role — changes a user's role (admin only)

Both require the ADMIN role.

---

# 📚 Intermediate Level

## Q11. Walk through what happens when a non-admin tries to access GET /api/admin/users.

### Answer

```text
1. Request: GET /api/admin/users
           Authorization: Bearer <user-token>

2. Spring Security filter checks:
   .requestMatchers("/api/admin/**").hasRole("ADMIN")

3. Extracts role from token: "USER"

4. Checks: is "USER" == "ADMIN"? No.

5. Spring Security returns: 403 Forbidden
   (never reaches the controller)

6. Client receives: HTTP 403
                    { "code": "FORBIDDEN", "message": "Access denied" }
```

The AdminUserController never runs.

---

## Q12. What is the difference between filter-level and controller-level authorization?

### Answer

**Filter-level (Spring Security):**
```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```
Checked before the request reaches the controller. If it fails, the controller never runs.

**Controller-level:**
```java
@GetMapping
public ResponseEntity<Void> admin(
    @AuthenticationPrincipal AuthenticatedUser user
) {
    if (!user.role().equals(Role.ADMIN)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    // ...
}
```
Checked inside the controller. The controller has to implement the check.

Filter-level is simpler and safer. Controller-level is redundant if filter-level already passed.

---

## Q13. Why does the JWT token include the role claim?

### Answer

So the backend doesn't have to query the database to decide if a user is an admin.

With the role in the token, the backend can check it immediately without a database lookup:

```text
Without role in token: extract userId → query database → check role → allow/deny
With role in token:    extract role from token → allow/deny
```

Stateless, fast, scalable.

---

## Q14. What happens if an admin's role is changed from ADMIN to USER?

### Answer

The change is applied to the database immediately. But the admin's existing JWT token still has the ADMIN role claim.

The token remains valid until it expires (24 hours later). After expiration, the next login gets a new token with the USER role, and they lose admin access.

This is a limitation. Chapter 20+ will add token revocation to immediately invalidate old tokens on role change.

---

## Q15. Why does CartWise return 403 (not 404) when a non-admin tries to access GET /api/admin/users?

### Answer

A 404 response would signal "the resource doesn't exist." An attacker could use this to enumerate endpoints:

```bash
GET /api/admin/users → 404 = endpoint might not exist?
GET /api/admin/products → 404 = endpoint might not exist?
GET /api/admin/audit-logs → 403 = endpoint exists but denied?
```

A 403 (not 404) tells the attacker "you're not authorized" without revealing whether the endpoint is real.

This prevents information leakage via status codes.

---

## Q16. How does Spring Security know which role a user has?

### Answer

From the JWT token's role claim, which is extracted by the JwtAuthenticationFilter and stored in the SecurityContextHolder.

When an endpoint requires a role, Spring Security checks the authenticated user in the security context.

```text
JWT token → JwtAuthenticationFilter extracts role
  ↓
Stores in SecurityContextHolder
  ↓
Spring Security checks: does authenticated user have ADMIN role?
```

---

## Q17. Can a USER promote themselves to ADMIN?

### Answer

No. The PUT endpoint to change roles requires the ADMIN role:

```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
```

A USER calling this endpoint gets a 403 Forbidden from Spring Security.

Only an existing ADMIN can promote users.

---

## Q18. What does the seeded ADMIN user represent?

### Answer

A bootstrap user for development and testing.

Without it, there would be no way to test admin endpoints (you'd need a way to self-promote, which you've deliberately blocked). The seeded admin allows the first admin to exist so they can promote others.

Credentials: admin@example.com / admin-password

---

## Q19. If two users log in at the exact same time and one gets promoted to ADMIN while the other is still logged in, what happens?

### Answer

User 1's token still has the old role (USER) until it expires. They are not immediately an admin.

User 2's token has the updated role (ADMIN). They are an admin immediately.

This is a consistency trade-off for stateless authentication. Chapter 20+ will add token revocation to solve this.

---

## Q20. Why doesn't CartWise have fine-grained permissions in Chapter 19?

### Answer

Roles are simpler to reason about and implement. A role is "ADMIN or USER." A permission would be "can read own wishlist, can create wishlist entry, can list products, ..."

CartWise starts simple (roles) and can add complexity (permissions) later if needed.

Chapter 20+ will introduce permissions if the authorization requirements grow.

---

# ⚛️ Spring Security-Specific Questions

## Q21. What does `.requestMatchers("/api/admin/**").hasRole("ADMIN")` mean exactly?

### Answer

It's a Spring Security authorization rule that says:
- For any URL matching `/api/admin/**` (e.g., `/api/admin/users`, `/api/admin/audit`)
- Require the authenticated user to have a role named "ADMIN"
- If they don't have it, return 403 Forbidden before the request reaches the controller

Spring Security prepends "ROLE_" internally, so the Role enum's "ADMIN" becomes "ROLE_ADMIN" for the check.

---

## Q22. What happens if a user makes a request without a token to an endpoint that requires `.authenticated()`?

### Answer

The JWT filter doesn't find a token, so it doesn't set a user in the security context.

Spring Security sees an unauthenticated request to a protected endpoint and returns 401 Unauthorized.

---

## Q23. How does Spring Security distinguish between 401 (authentication required) and 403 (authorization denied)?

### Answer

**401 Unauthorized:**
```
User has no authentication credentials (no token, invalid token)
Spring Security doesn't know who they are
```

**403 Forbidden:**
```
User is authenticated (has valid token)
But they don't have the required role/permission
Spring Security knows who they are, but won't let them proceed
```

The two are handled by different Spring Security components: `AuthenticationEntryPoint` (401) and `AccessDeniedHandler` (403).

---

## Q24. Why is the Role enum stored as a string in the database, not as an integer ordinal?

### Answer

String is safer. If roles are stored as ordinals (0=USER, 1=ADMIN) and someone later inserts a new role (0=GUEST, 1=USER, 2=ADMIN), all the ordinals shift and data is corrupted.

String ("USER", "ADMIN") is self-documenting and won't break if roles are reordered.

---

## Q25. What does `@AuthenticationPrincipal AuthenticatedUser user` do in a controller method?

### Answer

Spring Security injects the authenticated user from the security context into the method parameter.

```java
@GetMapping
public ResponseEntity<List<UserDto>> listUsers(
    @AuthenticationPrincipal AuthenticatedUser user
) {
    // user is the authenticated principal (null if not authenticated)
}
```

The controller can access `user.role()`, `user.email()`, etc.

---

# 🏗️ Architecture Questions

## Q26. Why is role-based authorization simpler than permission-based authorization?

### Answer

```text
Role-based:         User → Role → Permissions (fixed set)
                    Two tiers: USER, ADMIN
                    Simple to reason about

Permission-based:   User → Permissions (individual)
                    Thousands of combinations possible
                    Complex to manage
```

CartWise starts with roles because the authorization requirements are simple (users vs. admins). As requirements grow, permissions might become necessary.

---

## Q27. If CartWise had 50 roles with different permission sets, how would you structure the database?

### Answer

Instead of storing the role directly on users, you'd have a many-to-many relationship:

```sql
users (id, email, password_hash)
roles (id, name, description)
user_roles (user_id, role_id)
role_permissions (role_id, permission_id)
permissions (id, name, description)
```

A user can have multiple roles, a role can have multiple permissions. This is Chapter 20+ complexity.

CartWise keeps it simple in Chapter 19: one role per user, two role options.

---

## Q28. Why does the JWT token need to include the role claim if Spring Security can check the role anyway?

### Answer

Because the JWT is stateless. The backend doesn't store sessions or user data.

Without the role in the token, the backend would need to:
1. Extract userId from token
2. Query the database for the user's current role
3. Check if the role is authorized

With the role in the token, the backend can:
1. Extract role from token
2. Check if the role is authorized

No database lookup needed (stateless). Faster, more scalable.

---

## Q29. What's the security risk of storing the role claim in the JWT if the client can decode it?

### Answer

The client can read the role claim (it's just Base64-encoded, not encrypted), but they can't forge it. The signature proves authenticity.

```text
Client decodes token: role=ADMIN (can see this)
Client modifies token: role=ADMIN → role=SUPERUSER
Client re-encodes token
Client sends to backend

Backend validates signature:
  Backend knows the secret
  Re-computes: HMAC-SHA512(secret, header.payload)
  Compares to provided signature
  Signatures don't match (payload was modified)
  Token is rejected
```

The client can't forge a valid signature without the server's secret.

---

## Q30. How would you implement "USER can see their own data, ADMIN can see all data" authorization?

### Answer

At the controller level, after Spring Security confirms authentication:

```java
@GetMapping
public ResponseEntity<List<UserDto>> getUserWishlists(
    @AuthenticationPrincipal AuthenticatedUser user,
    @RequestParam(required = false) Long userId
) {
    Long targetUserId = userId != null ? userId : user.userId();
    
    // Check authorization
    if (targetUserId != user.userId() && !user.role().equals(Role.ADMIN)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    
    return ResponseEntity.ok(wishlistService.getUserWishlists(targetUserId));
}
```

- A USER can only see their own data (userId must match)
- An ADMIN can see any user's data (no check)

---

# 🧪 Scenario-Based Questions

## Q31. An ADMIN is demoted to USER while they have an active session. What happens to their token?

### Answer

The token doesn't change. It still has the ADMIN role claim.

They can continue calling admin endpoints for up to 24 hours (until the token expires). After 24 hours, re-login gets them a USER token, and they lose admin access.

This is a gap. Chapter 20+ should add token revocation so the demotion takes effect immediately.

---

## Q32. A USER tries to call PUT /api/admin/users/2/role with their token. What does Spring Security do?

### Answer

1. Spring Security filter checks `.requestMatchers("/api/admin/**").hasRole("ADMIN")`
2. User's token has role=USER
3. USER != ADMIN
4. Spring Security returns 403 Forbidden (calls AccessDeniedHandler)
5. Client receives: HTTP 403 with error message
6. The controller never runs

---

## Q33. An ADMIN's password is compromised (attacker knows it). What prevents the attacker from calling admin endpoints?

### Answer

The attacker would need to know the JWT secret to forge a token. Without the secret, they can only log in with the admin's credentials, which gets them a valid token.

Once they have the valid token, they can call admin endpoints as if they were the admin. The JWT signature doesn't prevent this — only authentication (password) does.

This is why strong passwords and password security (no reuse, change if compromised) matter.

---

## Q34. A new role, MODERATOR, is added to the Role enum. How would the existing database schema handle this?

### Answer

The Role enum would become:

```java
public enum Role {
    USER("USER"),
    MODERATOR("MODERATOR"),
    ADMIN("ADMIN");
}
```

The database schema doesn't change — the `role` column can store any string. Existing data (USER, ADMIN) continues to work.

New users can be assigned MODERATOR. Spring Security rules can require `.hasRole("MODERATOR")` for new endpoints.

---

## Q35. Why is the seeded ADMIN user necessary, and what would happen without it?

### Answer

Without the seeded ADMIN, there would be no way to bootstrap the first admin.

You can't self-promote (the endpoint checks if you're already ADMIN). You can't create an ADMIN via signup (the code assigns USER by default).

So the only way to get an admin is to:
1. Either seed the database with one admin, or
2. Have an endpoint that doesn't check authorization for the first role assignment (dangerous)

CartWise chooses option 1: seed one ADMIN for development/testing. In production, an initial ADMIN would be created during deployment or setup.

---

# 📌 Summary

These questions cover:

- Authentication vs. authorization
- Roles vs. permissions
- JWT role claims and stateless authorization
- Spring Security filter-level vs. controller-level checks
- Role assignment and role changes
- 403 vs. 404 for authorization decisions
- Admin endpoints and their requirements
- Token validity after role changes
- Seeded data and bootstrap users
- Spring Security configuration and role checking
- Scalability and stateless authorization
