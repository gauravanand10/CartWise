/**
 * The HTTP client for the CartWise backend.
 *
 * Chapter 17's five endpoints, plus Chapter 18's two auth endpoints and the
 * token handling they require. This file is deliberately the only place in the
 * frontend that knows the API's URLs, status codes and wire shapes — everything
 * above it works in domain terms, so a route change or a renamed field is a
 * change here alone.
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

/**
 * Where the signed-in session is kept between page loads.
 *
 * Namespaced like the wishlist and compare keys so one application's storage is
 * recognisable in a browser that holds several.
 */
const SESSION_STORAGE_KEY = "cartwise.auth.session";

/** Who is signed in, and the token that proves it. Mirrors the API's AuthResponse. */
export interface AuthSession {
    userId: number;
    email: string;
    token: string;
}

/**
 * The in-memory copy of the session, and the one every request reads.
 *
 * Held in a module variable rather than read from storage per request: a request
 * should not depend on `localStorage` being readable, and this way a browser
 * that blocks storage still gets a working session for as long as the tab lives.
 * Storage is the durable copy; this is the authoritative one.
 */
let session: AuthSession | null = readStoredSession();

function isSession(value: unknown): value is AuthSession {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as AuthSession).userId === "number" &&
        typeof (value as AuthSession).email === "string" &&
        typeof (value as AuthSession).token === "string"
    );
}

/**
 * Reads the persisted session, tolerating every way that can fail.
 *
 * Guarded for the same reasons as `lib/persistedList`: `localStorage` throws
 * outright in private-mode Safari and is absent during server rendering, and a
 * session that will not load must degrade to signed-out rather than take the
 * page down.
 */
function readStoredSession(): AuthSession | null {
    try {
        const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return null;

        const parsed: unknown = JSON.parse(raw);
        return isSession(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

/**
 * Stores the session, or clears it when passed null.
 *
 * A token in `localStorage` is readable by any script running on this page,
 * which makes any cross-site-scripting flaw a credential theft — the trade-off
 * the backend's `AuthResponse` documents from the other side. It is the price of
 * a bearer token the app must attach itself; the alternative, an HttpOnly
 * cookie, is unreadable by script but brings CSRF and its own defences.
 */
export function setSession(next: AuthSession | null): void {
    session = next;

    try {
        if (next) {
            window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
        } else {
            window.localStorage.removeItem(SESSION_STORAGE_KEY);
        }
    } catch {
        // Storage full or blocked. The session still works for this tab; it just
        // will not survive a reload, which is not worth failing a login over.
    }
}

/** The current session, or null when signed out. */
export function getSession(): AuthSession | null {
    return session;
}

/**
 * Signs out locally.
 *
 * There is no server call to make. The token is stateless — the backend keeps no
 * record of it and has no way to revoke it — so signing out means forgetting it
 * here, and the token remains technically valid until it expires. That is the
 * honest consequence of stateless authentication, and the reason the lifetime is
 * short. A real revocation endpoint needs server-side token state, which the
 * backend deliberately does not have yet.
 */
export function logout(): void {
    setSession(null);
}

/**
 * One page of results, as every list endpoint now returns them.
 *
 * Chapter 20 changed `GET /api/products` from a bare array to this envelope, and
 * that is a breaking change rather than an addition — `(await fetchProducts())
 * .map(...)` no longer compiles, which is the point. There is deliberately no
 * legacy array endpoint to fall back to.
 */
export interface ApiPage<T> {
    content: T[];
    /** Zero-indexed, echoed back by the server after any clamping. */
    page: number;
    /** The size actually applied — may be lower than requested; the server caps it at 100. */
    size: number;
    totalElements: number;
    totalPages: number;
}

/** One catalogue category with its product count, from `GET /api/categories`. */
export interface ApiCategory {
    /** Display form, e.g. `"Smartphone"`. */
    name: string;
    /** URL form, e.g. `"smartphone"`. This is what `?category=` expects. */
    slug: string;
    productCount: number;
}

/**
 * The catalogue query, mirroring the server's parameters one-for-one.
 *
 * Every field optional, because every parameter is. Deliberately not a
 * `Record<string, string>`: naming them here means a typo is a compile error
 * rather than a filter that silently does nothing, which is the failure mode
 * that makes query-string bugs hard to see.
 */
export interface ProductQueryParams {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    /** Only `true` filters; `false` and `undefined` both mean "no filter". */
    inStock?: boolean;
    sort?: ProductSortValue;
    page?: number;
    size?: number;
}

/**
 * The orderings the API accepts. Anything else is a 400.
 *
 * A union rather than `string`, so an invalid sort is caught at compile time
 * instead of arriving as a runtime error the user sees.
 */
export type ProductSortValue =
    | "price-asc"
    | "price-desc"
    | "rating-desc"
    | "name-asc";

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

    /*
     * Chapter 24 — image provenance. Openverse serves openly-licensed photography, and the CC
     * licences it indexes require attribution as a condition of use, so these arrive attached to
     * the product rather than being fetched separately. A client that renders `imageUrl` without
     * `imageAttribution` is using the work outside its licence.
     */

    /** Credit line to display beside the image. Null when `imageUrl` is a placeholder. */
    imageAttribution: string | null;
    /** Licence code, e.g. `"by-sa"`. */
    imageLicense: string | null;
    /** Licence deed URL. */
    imageLicenseUrl: string | null;
    /** The provider's page for the original work. */
    imageSourceUrl: string | null;
    /**
     * True when `imageUrl` is the seeded placehold.co stand-in rather than a real photograph.
     *
     * Sent by the server rather than inferred from a null here, so "no photo was found for this
     * product" stays distinguishable from "this field has not been populated yet".
     */
    imagePlaceholder: boolean;
}

/** One saved product, with the product embedded. */
export interface ApiWishlistItem {
    /** The wishlist entry's id — the saving, not the product. */
    id: number;
    product: ApiProduct;
    /** ISO-8601 UTC instant. */
    savedAt: string;
}

/**
 * One column of a comparison, with the product embedded.
 *
 * Shaped like `ApiWishlistItem` because the backend's `ComparisonItemDto` is
 * shaped like its `WishlistItemDto` — same "the id is the entry, not the
 * product" rule, same embedded product, same ISO-8601 instant. The one addition
 * is `position`, and it is the reason a comparison is not a wishlist with a
 * smaller cap: the grid renders columns left to right, and which column a
 * product occupies survives a removal in the middle. Remove the second of four
 * and the rest keep positions 0, 2 and 3 rather than shuffling left.
 */
export interface ApiComparisonItem {
    /** The comparison entry's id — the selection, not the product. */
    id: number;
    product: ApiProduct;
    /** Zero-based column, 0 to 3. Constrained by a check constraint server-side. */
    position: number;
    /** ISO-8601 UTC instant. */
    addedAt: string;
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
    // A 401 from /auth/* is a rejected *submission* — the password just typed was
    // wrong. A 401 from anywhere else is a rejected *token*. Only the second says
    // anything about the stored session, and conflating them had a visible
    // consequence: signing in as someone else and mistyping the password logged
    // the current user out, because their perfectly good token was discarded on
    // the strength of an unrelated failure.
    const isAuthEndpoint = path.startsWith("/auth/");

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        // Spread first, then set headers, so a caller's `init` cannot drop the
        // Authorization header by supplying headers of its own.
        headers: {
            "Content-Type": "application/json",
            // Attached to every request, including the ones that do not need it.
            // The alternative — each call site deciding whether this endpoint is
            // protected — duplicates the backend's access rules in the client,
            // where they would drift out of step the first time one changed.
            ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
            ...(init?.headers as Record<string, string> | undefined),
        },
    });

    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
            | ApiErrorBody
            | null;

        // A 401 on a normal endpoint means the token is no longer usable —
        // expired, or signed with a key the server has since rotated. Discarding
        // it here means the app learns it is signed out at the moment the server
        // says so, instead of retrying with a credential that cannot start
        // working again.
        //
        // Deliberately not done for 403: that response means the token is fine
        // and the request was not. Clearing the session there would sign a user
        // out for asking about someone else's data.
        if (response.status === 401 && !isAuthEndpoint) {
            setSession(null);
        }

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

/**
 * `POST /api/auth/signup` — register, and sign in as the new account.
 *
 * Stores the session on success, so the caller does not have to remember to.
 * Forgetting that step would leave the app holding a token it never sends, which
 * looks exactly like a broken login.
 *
 * Throws `ApiRequestError` with status 400 (invalid email, password shorter than
 * 8 characters or longer than 72 bytes) or 409 (email already registered).
 */
export async function signup(
    email: string,
    password: string,
): Promise<AuthSession> {
    const created = await request<AuthSession>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

    setSession(created);
    return created;
}

/**
 * `POST /api/auth/login` — exchange credentials for a token.
 *
 * Throws `ApiRequestError` with status 401 for any credential failure. The
 * server does not distinguish an unknown email from a wrong password, so neither
 * can this — and a UI built on it must not claim to either, however tempting
 * "no account with that email" is as a message.
 */
export async function login(
    email: string,
    password: string,
): Promise<AuthSession> {
    const authenticated = await request<AuthSession>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

    setSession(authenticated);
    return authenticated;
}

/**
 * `GET /api/products` — one page of the catalogue, filtered and sorted.
 *
 * **The return type changed in Chapter 20** from `ApiProduct[]` to
 * `ApiPage<ApiProduct>`. Callers read `.content` for the rows and the remaining
 * fields for pagination.
 *
 * Throws `ApiRequestError` with status 400 for an incoherent query — a negative
 * page, an inverted price range, an unknown sort. An unknown *category* is not
 * an error: it comes back 200 with an empty `content`, because a filter that
 * matches nothing has succeeded at matching nothing.
 *
 * Undefined parameters are omitted from the query string entirely rather than
 * sent as empty values. `?category=` would otherwise reach the server as a
 * present-but-blank filter, and the two are only equivalent because the server
 * happens to treat blank as absent — relying on that would make this client
 * depend on a detail it should not know.
 */
export function fetchProducts(
    params: ProductQueryParams = {},
): Promise<ApiPage<ApiProduct>> {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
            search.set(key, String(value));
        }
    }

    const query = search.toString();
    return request<ApiPage<ApiProduct>>(`/products${query ? `?${query}` : ""}`);
}

/**
 * `GET /api/categories` — every category that has at least one product.
 *
 * Public, like the catalogue. The counts sum to the catalogue's
 * `totalElements`, since every product carries exactly one category — which
 * makes the two endpoints checkable against each other.
 *
 * A category with no products cannot appear here; the server derives this list
 * by grouping the products table and has no categories table to read from.
 */
export function fetchCategories(): Promise<ApiCategory[]> {
    return request<ApiCategory[]>("/categories");
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

/**
 * `GET /api/users/:userId/wishlist` — saved products, newest first.
 *
 * The three wishlist calls still take `userId` explicitly, though the session
 * already knows it. Keeping the parameter means these signatures are unchanged
 * from Chapter 17 and the URL still says whose wishlist is meant — but note that
 * passing anyone other than the signed-in user now returns 403, and no token at
 * all returns 401.
 */
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

/*
 * ---------------------------------------------------------------------------
 * COMPARISON  (Chapter 23.5)
 *
 * The backend gained these endpoints in Chapter 23 and nothing on this side
 * ever called them — the controller, service and tests shipped with no client.
 * The comparison lived entirely in localStorage while an empty `comparisons`
 * table sat beside the wishlist.
 *
 * Deliberately shaped like the three wishlist calls above: same `userId`-first
 * signature, same slug identity, same "returns nothing because the API returns
 * nothing" on the writes. The two resources are independent by design and share
 * no state, but they are the same *kind* of thing, and a caller that has learned
 * one should not have to learn a second convention for the other.
 * ---------------------------------------------------------------------------
 */

/**
 * `GET /api/users/:userId/comparison` — compared products, in column order.
 *
 * Ordered by the server's stored `position`, not by when each was added, so the
 * array index is the column the user sees.
 */
export function fetchComparison(userId: number): Promise<ApiComparisonItem[]> {
    return request<ApiComparisonItem[]>(`/users/${userId}/comparison`);
}

/**
 * `POST /api/users/:userId/comparison` — add a product to the comparison.
 *
 * Returns nothing: the endpoint answers 201 when a column was created and 200
 * when the product was already there, and both are successes the UI treats
 * identically.
 *
 * Throws `ApiRequestError` with **status 409 and code `COMPARISON_FULL`** when
 * the comparison already holds four products. That is the one failure a caller
 * is expected to branch on rather than merely report — it is the server's
 * version of the disabled fifth toggle, and it is why the code is checked rather
 * than the status alone: 409 is also what a concurrent duplicate insert
 * produces, and those two conflicts want different messages.
 */
export function addToComparison(
    userId: number,
    productSlug: string,
): Promise<void> {
    return request<void>(`/users/${userId}/comparison`, {
        method: "POST",
        body: JSON.stringify({ productSlug }),
    });
}

/**
 * `DELETE /api/users/:userId/comparison/:slug` — remove one product.
 *
 * Throws `ApiRequestError` with status 404 if the product was not being
 * compared. Not swallowed here: it means the caller's view is stale, which is
 * worth knowing even though the caller may well decide to ignore it.
 */
export function removeFromComparison(
    userId: number,
    productSlug: string,
): Promise<void> {
    return request<void>(
        `/users/${userId}/comparison/${encodeURIComponent(productSlug)}`,
        { method: "DELETE" },
    );
}

/**
 * `DELETE /api/users/:userId/comparison` — empty the comparison.
 *
 * One request rather than four, because "start over" is one intention and the UI
 * offers it as one button; expressing it as N deletes would make a partial
 * failure a state the user never asked for. Idempotent — clearing an already
 * empty comparison succeeds.
 */
export function clearComparison(userId: number): Promise<void> {
    return request<void>(`/users/${userId}/comparison`, { method: "DELETE" });
}
