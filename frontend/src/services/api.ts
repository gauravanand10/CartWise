/**
 * The HTTP client for the CartWise backend.
 *
 * Chapter 17's five endpoints and nothing else. This file is deliberately the
 * only place in the frontend that knows the API's URLs, status codes and wire
 * shapes — everything above it works in domain terms, so a route change or a
 * renamed field is a change here alone.
 *
 * Nothing renders from this yet. The feature services still read their mock
 * data, and swapping them over is Chapter 19's job, done screen by screen with
 * loading and error states designed rather than improvised. What exists today is
 * the boundary and the proof it works.
 */

/**
 * Where the API lives.
 *
 * Overridable through Vite's env so a deployed build can point somewhere else,
 * with the dev backend as the fallback. Hardcoding it outright would mean the
 * frontend could only ever talk to a laptop.
 */
const API_BASE_URL =
    import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

/** A product as the API returns it. */
export interface ApiProduct {
    id: number;
    slug: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    /** Null, not absent, when the product is not discounted. */
    originalPrice: number | null;
    rating: number;
    /** `ProductCardModel` calls this `reviews`. */
    reviewCount: number;
    inStock: boolean;
    /** `ProductCardModel` calls this `image`. Null when there is no image. */
    imageUrl: string | null;
}

/** One saved product, with the product embedded. */
export interface ApiWishlistItem {
    /** The wishlist entry's id — the saving, not the product. */
    id: number;
    product: ApiProduct;
    /** ISO-8601 UTC instant. */
    savedAt: string;
}

/** The body every failed call returns. Matches the backend's `ApiError`. */
export interface ApiErrorBody {
    code: string;
    message: string;
    timestamp: string;
}

/**
 * A non-2xx response, carrying the status so callers can branch on it.
 *
 * Thrown rather than returned because a failed call has no result to return,
 * and a `null` would collapse "not found" and "server is down" into one value
 * the UI cannot tell apart.
 */
export class ApiRequestError extends Error {
    /** HTTP status of the response. */
    readonly status: number;

    /** The API's machine-readable code, or `"UNKNOWN"` when there was no body. */
    readonly code: string;

    // Fields are declared and assigned rather than written as constructor
    // parameter properties: this project compiles with `erasableSyntaxOnly`,
    // which rejects any TypeScript syntax that emits runtime code.
    constructor(status: number, code: string, message: string) {
        super(message);
        this.name = "ApiRequestError";
        this.status = status;
        this.code = code;
    }
}

/**
 * Issues a request and turns a non-2xx into an `ApiRequestError`.
 *
 * `fetch` only rejects on network failure — a 500 resolves normally — so
 * without this check every caller would have to remember to test `res.ok`, and
 * one that forgot would parse an error body as data.
 *
 * The error body is parsed defensively: a 404 from this API has no body at all,
 * and a proxy or a dead server can return HTML.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...init,
    });

    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
            | ApiErrorBody
            | null;

        throw new ApiRequestError(
            response.status,
            body?.code ?? "UNKNOWN",
            body?.message ?? response.statusText,
        );
    }

    // 204 and the empty 404 body have nothing to parse; asking JSON to read
    // zero bytes throws.
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return undefined as T;
    }

    return (await response.json()) as T;
}

/** `GET /api/products` — the whole catalogue. */
export function fetchProducts(): Promise<ApiProduct[]> {
    return request<ApiProduct[]>("/products");
}

/**
 * `GET /api/products/:slug` — one product, or `null` when there is none.
 *
 * The 404 becomes `null` rather than an exception, matching the mock
 * `getProductBySlug` the UI already handles: an unknown slug is a routing
 * outcome with its own screen, not an error with a retry button.
 */
export async function fetchProductBySlug(
    slug: string,
): Promise<ApiProduct | null> {
    try {
        return await request<ApiProduct>(`/products/${encodeURIComponent(slug)}`);
    } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) return null;
        throw error;
    }
}

/** `GET /api/users/:userId/wishlist` — saved products, newest first. */
export function fetchWishlist(userId: number): Promise<ApiWishlistItem[]> {
    return request<ApiWishlistItem[]>(`/users/${userId}/wishlist`);
}

/**
 * `POST /api/users/:userId/wishlist` — save a product.
 *
 * Returns nothing, because the API returns nothing: the endpoint is idempotent
 * and answers 201 or 200 depending on whether a row was created. Neither is a
 * failure and the UI treats them identically, so the distinction is not worth
 * surfacing here.
 */
export function addToWishlist(userId: number, productSlug: string): Promise<void> {
    return request<void>(`/users/${userId}/wishlist`, {
        method: "POST",
        body: JSON.stringify({ productSlug }),
    });
}

/**
 * `DELETE /api/users/:userId/wishlist/:slug` — unsave a product.
 *
 * Throws `ApiRequestError` with status 404 if the product was not saved. Not
 * swallowed: that means the caller's view of the wishlist is stale, which is
 * worth knowing.
 */
export function removeFromWishlist(
    userId: number,
    productSlug: string,
): Promise<void> {
    return request<void>(
        `/users/${userId}/wishlist/${encodeURIComponent(productSlug)}`,
        { method: "DELETE" },
    );
}
