/**
 * Rupee formatting, shared across features.
 *
 * Lives here rather than inside a feature because Search, Product Details and
 * Compare all render the same prices — a second `Intl.NumberFormat` per feature
 * would be both duplicated code and a duplicated (surprisingly expensive)
 * formatter instance.
 */

const rupees = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

/** 129999 → "₹1,29,999". Indian digit grouping, no decimals. */
export function formatPrice(value: number): string {
    return rupees.format(value);
}

const compact = new Intl.NumberFormat("en-IN");

/** 19412 → "19,412". For review counts and similar plain integers. */
export function formatCount(value: number): string {
    return compact.format(value);
}

/**
 * Percentage saved against the original price, rounded.
 *
 * Returns 0 when there is no genuine drop, so callers can treat 0 as "no
 * discount badge" without a second null check.
 */
export function discountPercent(
    price: number,
    originalPrice?: number,
): number {
    if (!originalPrice || originalPrice <= price) return 0;

    return Math.round(((originalPrice - price) / originalPrice) * 100);
}
