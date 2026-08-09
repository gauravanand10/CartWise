/**
 * Wishlist domain model.
 *
 * The wishlist stores **product identity only** — a list of slugs, the same
 * identity Product Details and Compare use. Product data is never copied in:
 * prices and ratings change, and a wishlist holding its own stale copy would
 * quietly disagree with the product page it links to.
 */

/** What the Wishlist page should render right now. */
export type WishlistStatus = "empty" | "loading" | "error" | "ready";

/** How the saved products are ordered. */
export type WishlistSort =
    | "recent"
    | "price-low-high"
    | "price-high-low"
    | "rating";

/** Outcome of a toggle, so callers can announce what happened. */
export type WishlistToggleResult = "added" | "removed";
