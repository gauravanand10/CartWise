/**
 * HTTP boundary — the only layer that knows CartWise is reached over the web.
 *
 * <p>Controllers translate requests into service calls and service results into responses:
 * routing, status codes, serialisation. They hold no business rules, so the same logic could be
 * driven by a scheduled job or a message consumer without being rewritten.
 *
 * <p>Depends on {@code service} and {@code common.dto}. Nothing depends on this package.
 */
package com.cartwise.controller;
