package com.cartwise.common.dto;

/**
 * How many outbound clicks one retailer has received. Chapter 26.
 *
 * <p>The retailer is the configured id ({@code amazon}, {@code reliance-digital}) rather than a
 * display name, because that is what the clicks table stores and translating it here would mean
 * this report could disagree with the database it came from. A retailer removed from configuration
 * still appears with its historic clicks, which is the correct answer to a question about the past.
 *
 * @param retailer the retailer id as recorded on the click
 * @param clicks   how many clicks
 */
public record RetailerClickCount(String retailer, long clicks) {
}
