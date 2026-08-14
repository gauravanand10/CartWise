package com.cartwise.common.dto;

import com.cartwise.entity.Role;
import java.time.Instant;

/**
 * An account as the admin endpoints return it.
 *
 * <p>The field list is as short as it is for one reason: {@code passwordHash} is not on it, and a
 * DTO is what guarantees that. Returning {@link com.cartwise.entity.User} directly would serialise
 * every getter it has, so the hash would reach the client the moment someone added a getter without
 * thinking about this endpoint — and a hash in a response body is an offline cracking target handed
 * over for free. The exclusion here is structural rather than a rule someone has to remember.
 *
 * <p>{@code updatedAt} is also absent, though {@code createdAt} is present. When an account was
 * registered is a fact about the account and useful in a list of them; when its row was last
 * written is bookkeeping about the row, and after this chapter it mostly records role changes —
 * which is the beginning of an audit trail, and audit logging is deliberately a later chapter. Half
 * an audit trail, unlabelled, is worse than none.
 *
 * @param id        numeric primary key. It is what {@code PUT /api/admin/users/{userId}/role}
 *                  addresses, so a client that lists users can act on them without a second lookup
 * @param email     the account's address. Note this is the one place in CartWise that discloses
 *                  which addresses are registered — see {@code AdminController} for why that is
 *                  intentional here and refused everywhere else
 * @param role      {@code USER} or {@code ADMIN}, serialised as its name
 * @param createdAt when the account was registered, as an ISO-8601 UTC instant
 */
public record UserDto(Long id, String email, Role role, Instant createdAt) {
}
