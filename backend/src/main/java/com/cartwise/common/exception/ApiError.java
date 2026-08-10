package com.cartwise.common.exception;

import java.time.Instant;

/**
 * The single error shape every failed API call returns.
 *
 * <p>Agreeing on this now — before there are endpoints to fail — means the frontend can write
 * one error branch instead of one per resource.
 *
 * @param code      stable, machine-readable identifier the frontend can branch on
 * @param message   human-readable summary, safe to show or log; never carries internals
 * @param timestamp when the failure was handled
 */
public record ApiError(String code, String message, Instant timestamp) {
}
