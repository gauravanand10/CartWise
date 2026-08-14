/**
 * Authentication mechanics — how a request proves who it is from.
 *
 * <p>A package of its own because these classes cut across the layers rather than sitting in one.
 * The filter runs before any controller, the token provider is called by both the filter (verifying)
 * and the auth service (issuing), and the principal is read by controllers. Filing them under
 * {@code config} would hide real logic among wiring, and under {@code service} would suggest they
 * are business rules, which they are not: <em>who</em> the caller is belongs here, <em>what</em>
 * they may do belongs to the code that owns the resource.
 *
 * <p>Present as of Chapter 18: {@link com.cartwise.security.JwtTokenProvider} (sign and verify),
 * {@link com.cartwise.security.JwtAuthenticationFilter} (read the header, populate the security
 * context) and {@link com.cartwise.security.AuthenticatedUser} (the principal those two exchange).
 *
 * <p>Chapter 19 adds roles, and they cross this boundary in a specific direction worth stating
 * once. {@link com.cartwise.entity.Role} is a fact about the account and lives with the entity;
 * this package's job is only to carry it — the provider writes it into a token claim, the filter
 * turns that claim into a {@code GrantedAuthority}, and the principal exposes it. Every decision
 * made <em>with</em> a role is elsewhere: {@code SecurityConfig} for whole route prefixes,
 * {@code WishlistController} for ownership.
 *
 * <p>Deliberately absent: refresh tokens, a token blacklist or revocation store, fine-grained
 * permissions and groups, OAuth2 clients, and any notion of a session. The missing revocation store
 * is the one with a visible consequence — a role changed in the database does not reach a token
 * already issued, so a demoted user keeps their old privileges until it expires. That is documented
 * on {@link com.cartwise.security.AuthenticatedUser} rather than worked around.
 */
package com.cartwise.security;
