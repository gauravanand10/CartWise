package com.cartwise.common.dto;

import com.cartwise.entity.Role;

/**
 * The body of {@code PUT /api/admin/users/{userId}/role}: {@code {"role": "ADMIN"}}.
 *
 * <p>A one-field record rather than a bare {@code String} parameter, so the request has a shape
 * that can grow. The next thing this operation plausibly needs is a reason for the change, and
 * adding a field to a JSON object is backward-compatible in a way that changing a plain-text body
 * is not.
 *
 * <p>Typed as {@link Role}, not {@code String}, which decides where an invalid value is caught.
 * Jackson refuses to deserialise a name that is not an enum constant, so {@code {"role":"SUPERUSER"}}
 * fails at the message-conversion boundary and never reaches a controller — and Spring MVC's own
 * handling turns that into a 400, re-bodied into CartWise's {@link
 * com.cartwise.common.exception.ApiError} shape by {@code GlobalExceptionHandler}. A {@code String}
 * field would push the same check into hand-written parsing in the service, which is more code for
 * a worse error.
 *
 * <p>It cannot catch {@code {"role": null}} or an absent field, though — both leave a valid record
 * with a null component. That check is the controller's, and it is written there.
 *
 * @param role the role to assign. Required; must be one of {@link Role}'s constants
 */
public record ChangeRoleRequest(Role role) {
}
