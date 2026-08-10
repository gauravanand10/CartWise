/**
 * Business logic — what CartWise actually decides, independent of how it was asked.
 *
 * <p>Services own rules, orchestration, and transaction boundaries. Keeping them free of
 * {@code HttpServletRequest} and of persistence types is what lets the layers above and below
 * change independently.
 *
 * <p>Depends on {@code repository} and {@code common.dto}. Called by {@code controller}.
 */
package com.cartwise.service;
