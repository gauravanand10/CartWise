import { EMI_MONTHS, FREE_DELIVERY_ABOVE } from "../constants";
import { formatPrice } from "../../../lib/currency";

/** Monthly instalment over the standard no-cost EMI tenure, rounded up. */
export function monthlyEmi(price: number): number {
    return Math.ceil(price / EMI_MONTHS);
}

/** "₹10,834/month for 12 months" — the line shown under the price. */
export function emiLabel(price: number): string {
    return `${formatPrice(monthlyEmi(price))}/month for ${EMI_MONTHS} months`;
}

/** Whether the order qualifies for free delivery. */
export function hasFreeDelivery(price: number): boolean {
    return price >= FREE_DELIVERY_ABOVE;
}

/**
 * Human delivery estimate.
 *
 * Dates are computed from "today" rather than hard-coded so the page never
 * promises a delivery date that has already passed.
 */
export function deliveryEstimate(inStock: boolean): string {
    if (!inStock) return "Notify me when back in stock";

    const arrival = new Date();
    arrival.setDate(arrival.getDate() + 2);

    return arrival.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
    });
}

/** Short stock line, e.g. "Only 4 left". */
export function stockLabel(stockCount: number): string {
    if (stockCount === 0) return "Out of stock";
    if (stockCount <= 5) return `Only ${stockCount} left`;
    if (stockCount <= 20) return "In stock";

    return "In stock";
}
