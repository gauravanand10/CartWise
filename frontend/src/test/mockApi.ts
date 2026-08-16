import { vi } from "vitest";

import { fakeSelectionFetch } from "./fakeBackend";
import type { ApiCategory, ApiPage, ApiProduct } from "../services/api";

/**
 * Stubs the network at the real boundary: `fetch`.
 *
 * <h3>Why here and not one layer up</h3>
 *
 * The tempting alternative is `vi.mock("../services/api")`. It is less code and it tests less: with
 * `api.ts` mocked, everything that file actually does stops running — the query string it builds,
 * the `res.ok` check that turns a 500 into an `ApiRequestError`, the 401 handling that clears the
 * session, the 204/empty-body special case. Those are the parts most likely to be wrong, and a test
 * suite that mocks them can never see it.
 *
 * Stubbing `fetch` leaves all of it running. The tests below therefore assert on the URL the
 * application really produced, which is the same string the server would receive — so a filter that
 * silently fails to reach the query string is a failing test rather than a passing one.
 *
 * The stub is installed with `vi.stubGlobal`, and `src/test/setup.ts` unstubs after every test, so
 * no route table survives into the next file.
 */

/** A product as the API returns it, with sensible values for anything a test does not care about. */
export function apiProduct(overrides: Partial<ApiProduct> = {}): ApiProduct {
    return {
        id: 1,
        slug: "test-product",
        name: "Test Product",
        brand: "TestBrand",
        category: "Smartphone",
        price: 9990,
        originalPrice: null,
        rating: 4.5,
        reviewCount: 10,
        inStock: true,
        imageUrl: null,
        ...overrides,
    };
}

/** One page of products, with the envelope fields consistent with the content unless overridden. */
export function apiPage(
    content: ApiProduct[],
    overrides: Partial<ApiPage<ApiProduct>> = {},
): ApiPage<ApiProduct> {
    return {
        content,
        page: 0,
        size: 12,
        totalElements: content.length,
        totalPages: content.length === 0 ? 0 : 1,
        ...overrides,
    };
}

export function apiCategory(overrides: Partial<ApiCategory> = {}): ApiCategory {
    return { name: "Smartphone", slug: "smartphone", productCount: 1, ...overrides };
}

/** What a handler may return: a JSON body, or an explicit status for the error paths. */
type Handler =
    | { json: unknown; status?: number }
    | { status: number; body?: unknown }
    | (() => { json?: unknown; status?: number; body?: unknown });

export interface MockApi {
    /** Every request URL the application issued, in order, as full strings. */
    readonly calls: string[];
    /** The query string of the most recent `/products` request. */
    lastProductQuery(): URLSearchParams;
    /** How many times `/products` was requested — the refetch count. */
    productRequestCount(): number;
}

/**
 * Installs a `fetch` that answers by path.
 *
 * Keys are matched as substrings of the request path, longest first, so `"/products"` and
 * `"/products/iphone-16-pro"` can both be registered and the more specific one wins. An unmatched
 * request rejects loudly rather than hanging or returning undefined — a test that forgot to register
 * a route should say so, not time out.
 */
export function mockApi(routes: Record<string, Handler>): MockApi {
    const calls: string[] = [];
    const keys = Object.keys(routes).sort((a, b) => b.length - a.length);

    const fetchStub = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        calls.push(url);

        const path = url.split("?")[0];
        const key = keys.find((candidate) => path.endsWith(candidate));

        if (!key) {
            /*
             * Chapter 23.5: the wishlist and comparison routes fall through to
             * the in-memory fake rather than failing.
             *
             * Any page rendering a ProductCard now has providers that fetch
             * user-scoped selections. Those requests are not what an integration
             * test about the catalogue is asserting, and making each such test
             * register four routes it does not care about would be noise that
             * obscures the routes it does.
             *
             * The "fail loudly for an unregistered route" rule is kept for
             * everything else, which is where it earns its place — a `/products`
             * request that silently returned nothing is exactly the bug this
             * stub exists to catch.
             */
            if (/\/users\/\d+\/(wishlist|comparison)/.test(path)) {
                return fakeSelectionFetch(input, init);
            }

            throw new Error(
                `mockApi: no route registered for ${url}. Registered: ${keys.join(", ") || "(none)"}`,
            );
        }

        const raw = routes[key];
        const result = typeof raw === "function" ? raw() : raw;
        const status = result.status ?? 200;
        const body = "json" in result ? result.json : (result as { body?: unknown }).body;

        return {
            ok: status >= 200 && status < 300,
            status,
            statusText: String(status),
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => {
                if (body === undefined) throw new Error("no body");
                return body;
            },
        } as unknown as Response;
    });

    vi.stubGlobal("fetch", fetchStub);

    return {
        get calls() {
            return calls;
        },
        lastProductQuery() {
            const productCalls = calls.filter((url) => url.includes("/products"));
            const last = productCalls[productCalls.length - 1] ?? "";
            return new URLSearchParams(last.split("?")[1] ?? "");
        },
        productRequestCount() {
            return calls.filter((url) => url.includes("/products")).length;
        },
    };
}
