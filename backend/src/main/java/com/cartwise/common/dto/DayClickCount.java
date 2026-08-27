package com.cartwise.common.dto;

import java.time.LocalDate;

/**
 * How many outbound clicks happened on one calendar day. Chapter 26.
 *
 * <p><strong>Which calendar.</strong> Clicks are stored as instants in UTC, and this groups them by
 * the date part of that UTC instant — not by the viewer's local date. For an India-facing catalogue
 * that means a day here runs 05:30 to 05:30 IST, so an evening click lands on the day a reader
 * expects and an after-midnight one does not. Stated rather than hidden because a per-day count is
 * exactly the kind of number people assume is in their own timezone. Making it local would require
 * knowing whose local, which a server-side aggregate does not.
 *
 * @param day    the UTC calendar date
 * @param clicks how many clicks fell on it
 */
public record DayClickCount(LocalDate day, long clicks) {
}
