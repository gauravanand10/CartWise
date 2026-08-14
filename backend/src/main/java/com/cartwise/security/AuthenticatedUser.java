package com.cartwise.security;

import com.cartwise.entity.Role;

/**
 * Who the current request is from, as established by a verified token.
 *
 * <p>This is the Spring Security {@code Authentication} principal, so it is what
 * {@code @AuthenticationPrincipal} injects into a controller. Keeping it a small record rather than
 * the {@link com.cartwise.entity.User} entity is deliberate: a controller asking "is this the user
 * whose wishlist was requested?" needs an id, and handing it a managed entity would put a password
 * hash and a database identity into the request scope of every authenticated call.
 *
 * <p>Every field comes from the token's own claims — nothing here has been read from the database.
 * That is what makes verification stateless, and also the limit of what this type can be trusted
 * for: it proves the bearer held a validly signed token that had not expired, not that the account
 * still exists or is still permitted to do anything. Any operation that needs the current row must
 * load it by {@link #id()}.
 *
 * <p><strong>{@link #role} is the token's claim about the role, not necessarily the row's current
 * value.</strong> Chapter 19 makes that gap real: an admin can demote someone whose token, already
 * issued and already in their browser, still says {@code ADMIN}. That token keeps working until it
 * expires, because nothing consults the database to check. This is the standing cost of stateless
 * authentication rather than a defect in the role change, and it is the reason the token lifetime
 * is short and revocation is listed as deferred rather than pretended at. A role change that had to
 * take effect immediately would need either database-backed authorization on every request or a
 * revocation store, and both are deliberately out of this chapter.
 *
 * @param id    the user's numeric id, taken from the token's subject
 * @param email the user's email, taken from the {@code email} claim; carried for convenience in
 *              logs and responses, never used to look the account up
 * @param role  the user's role as at the moment the token was issued. Never null — a token whose
 *              {@code role} claim is missing or unrecognised is rejected outright by
 *              {@link JwtTokenProvider#authenticate}, so code reading this never has to ask what an
 *              absent role would mean
 */
public record AuthenticatedUser(Long id, String email, Role role) {
}
