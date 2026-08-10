/**
 * Shared concerns that belong to no single layer or feature.
 *
 * <p>{@code common.dto} holds the transfer objects layers exchange; {@code common.exception}
 * holds the global error contract. The rule that keeps this package from decaying into a
 * dumping ground: something belongs here only if more than one feature genuinely needs it, not
 * merely because it has no obvious home yet.
 */
package com.cartwise.common;
