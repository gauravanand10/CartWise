import { vi } from "vitest";

/**
 * An in-memory stand-in for the wishlist and comparison endpoints.
 *
 * <h3>Why this had to exist</h3>
 *
 * Chapter 23.5 moved both selections off localStorage and onto the API. That
 * turned every toggle from a synchronous write into a request, and it turned a
 * large part of the existing suite into an integration test whether it wanted to
 * be one or not: `ProductCard`'s wishlist and compare tests assert that clicking
 * a control leaves it `aria-pressed="true"`, and with optimistic updates that
 * now means "pressed, then a request, then *still* pressed because the request
 * succeeded". Against an unstubbed `fetch` the request fails, the provider rolls
 * back exactly as designed, and the assertion sees `false`.
 *
 * The rollback is the feature. Deleting those assertions to make them pass would
 * have deleted the only coverage of it, so the tests keep asserting the same
 * things and the network below them is made to behave instead.
 *
 * <h3>Why a fake and not `vi.mock("../services/api")`</h3>
 *
 * Same reasoning `mockApi.ts` gives for stubbing at `fetch`: mocking the module
 * would stop `api.ts` running, and `api.ts` is where the URL is built, the
 * bearer token attached, `res.ok` checked, the 204 empty body handled and the
 * 401 session-clearing done. Those are the parts most likely to be wrong. This
 * fake sits under all of it, so a request that never reaches the right URL with
 * the right method fails here rather than passing silently.
 *
 * <h3>What it is not</h3>
 *
 * Not a general HTTP mock and not a second implementation of the backend. It
 * knows four routes per resource and enough state to answer them consistently
 * within one test. Anything else 404s, which is deliberate — a request this fake
 * does not recognise is a request the application should not be making.
 */

/** Per-user selections, keyed by user id. Reset between tests. */
interface State {
    wishlist: Map<number, string[]>;
    comparison: Map<number, string[]>;
}

const state: State = { wishlist: new Map(), comparison: new Map() };

/** Mirrors `ComparisonService.MAX_COMPARISON_PRODUCTS`, so the 409 path is reachable. */
const MAX_COMPARISON = 4;

/** Empties every user's selections. Called from `setup.ts` before each test. */
export function resetFakeBackend(): void {
    state.wishlist.clear();
    state.comparison.clear();
}

/** Seeds a user's saved products, for a test that needs a non-empty starting point. */
export function seedWishlist(userId: number, slugs: string[]): void {
    state.wishlist.set(userId, [...slugs]);
}

/** Seeds a user's comparison columns. */
export function seedComparison(userId: number, slugs: string[]): void {
    state.comparison.set(userId, [...slugs]);
}

/** Reads a user's saved products, so a test can assert the request actually landed. */
export function wishlistOf(userId: number): string[] {
    return [...(state.wishlist.get(userId) ?? [])];
}

/** Reads a user's comparison columns. */
export function comparisonOf(userId: number): string[] {
    return [...(state.comparison.get(userId) ?? [])];
}

/**
 * A Response-shaped object, hand-rolled rather than `new Response(...)`.
 *
 * `mockApi.ts` does the same thing and for the same reason: the constructor is
 * not dependable in this environment, and a fake that throws while building its
 * reply is indistinguishable — from the provider's `catch` — from a server that
 * refused the request. That produced eleven failures reading "nothing happened
 * on click", none of which pointed anywhere near this function.
 *
 * Only the four members `api.ts` actually touches are implemented: `ok`,
 * `status`, `headers.get` and `json()`.
 */
function reply(status: number, body?: unknown): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText: String(status),
        /*
         * `content-length: 0` on a bodiless reply is load-bearing, not tidiness.
         *
         * `api.ts` decides whether to parse by checking `status === 204 ||
         * content-length === "0"`. A 201 without that header falls through to
         * `response.json()`, which throws on an empty body — and the throw
         * surfaces to the provider as a failed write, which dutifully rolls the
         * optimistic update back. The product appeared, the request succeeded,
         * the row was created, and the heart emptied anyway.
         *
         * That cost eleven failing tests and a long hunt, because every visible
         * symptom said "the click did nothing" while the fake's own state showed
         * the write had landed. A real server sets this header; the fake has to
         * as well, or it is not reproducing the contract `api.ts` was written
         * against.
         */
        headers: new Headers(
            body === undefined
                ? { "content-length": "0" }
                : { "content-type": "application/json" },
        ),
        json: async () => {
            if (body === undefined) throw new Error("no body");
            return body;
        },
    } as unknown as Response;
}

function json(body: unknown, status = 200): Response {
    return reply(status, body);
}

/** 204, which `api.ts` short-circuits before trying to parse a body. */
function noContent(): Response {
    return reply(204);
}

function apiError(status: number, code: string, message: string): Response {
    return json({ code, message, timestamp: new Date().toISOString() }, status);
}

/**
 * The product each stored slug is echoed back as.
 *
 * The providers only read `item.product.slug`, so the rest is filler that keeps
 * the shape honest rather than data any assertion depends on. If a provider ever
 * starts reading another field, this is where it will be obviously absent.
 */
function itemFor(slug: string, index: number) {
    return {
        id: index + 1,
        product: {
            id: index + 1,
            slug,
            name: slug,
            brand: "TestBrand",
            category: "Smartphone",
            price: 9990,
            originalPrice: null,
            rating: 4.5,
            reviewCount: 10,
            inStock: true,
            imageUrl: null,
        },
    };
}

/**
 * Installs the fake as the global `fetch`.
 *
 * Registered as the *default* in `setup.ts` rather than opted into per test, so
 * that any component rendering a `ProductCard` gets a working selection API
 * without every test file having to know that. Tests with their own routing
 * needs call `stubFetch` from `mockApi.ts` afterwards, which replaces this
 * wholesale — those tests render signed out, so the selection routes are never
 * requested and there is nothing to lose.
 */
export function installFakeBackend(): void {
    vi.stubGlobal("fetch", fakeSelectionFetch);
}

/**
 * Answers a wishlist or comparison request from in-memory state.
 *
 * Exported separately from {@link installFakeBackend} so `mockApi`'s own stub
 * can delegate to it for the selection routes while keeping its fail-loudly rule
 * for everything else. Anything it does not recognise 404s.
 */
export async function fakeSelectionFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
): Promise<Response> {
    {
        const url = typeof input === "string" ? input : input.toString();
        const method = (init?.method ?? "GET").toUpperCase();
        const path = url.replace(/^https?:\/\/[^/]+/, "");

        const wishlistMatch = /^\/api\/users\/(\d+)\/wishlist(?:\/(.+))?$/.exec(path);
        if (wishlistMatch) {
            const userId = Number(wishlistMatch[1]);
            const slug = wishlistMatch[2]
                ? decodeURIComponent(wishlistMatch[2])
                : undefined;
            const saved = state.wishlist.get(userId) ?? [];

            if (method === "GET") {
                return json(saved.map(itemFor));
            }

            if (method === "POST") {
                const body = JSON.parse(String(init?.body ?? "{}")) as {
                    productSlug?: string;
                };
                const target = body.productSlug;
                if (!target) return apiError(400, "BAD_REQUEST", "productSlug is required");

                if (saved.includes(target)) return noContent();

                // Prepended, matching the provider's recency ordering so a
                // refetch does not reorder what the optimistic update showed.
                state.wishlist.set(userId, [target, ...saved]);
                return reply(201);
            }

            if (method === "DELETE" && slug) {
                if (!saved.includes(slug)) {
                    return apiError(404, "NOT_FOUND", "Not saved");
                }
                state.wishlist.set(userId, saved.filter((item) => item !== slug));
                return noContent();
            }
        }

        const comparisonMatch = /^\/api\/users\/(\d+)\/comparison(?:\/(.+))?$/.exec(path);
        if (comparisonMatch) {
            const userId = Number(comparisonMatch[1]);
            const slug = comparisonMatch[2]
                ? decodeURIComponent(comparisonMatch[2])
                : undefined;
            const columns = state.comparison.get(userId) ?? [];

            if (method === "GET") {
                return json(
                    columns.map((item, index) => ({
                        ...itemFor(item, index),
                        position: index,
                        addedAt: new Date().toISOString(),
                    })),
                );
            }

            if (method === "POST") {
                const body = JSON.parse(String(init?.body ?? "{}")) as {
                    productSlug?: string;
                };
                const target = body.productSlug;
                if (!target) return apiError(400, "BAD_REQUEST", "productSlug is required");

                if (columns.includes(target)) return noContent();

                // The duplicate check runs first, exactly as the real service
                // does, so re-adding into a full comparison is a no-op and not a
                // 409. Getting this order wrong here would let a test pass
                // against behaviour the server does not have.
                if (columns.length >= MAX_COMPARISON) {
                    return apiError(
                        409,
                        "COMPARISON_FULL",
                        `A comparison holds at most ${MAX_COMPARISON} products.`,
                    );
                }

                state.comparison.set(userId, [...columns, target]);
                return reply(201);
            }

            if (method === "DELETE" && slug) {
                if (!columns.includes(slug)) {
                    return apiError(404, "NOT_FOUND", "Not compared");
                }
                state.comparison.set(userId, columns.filter((item) => item !== slug));
                return noContent();
            }

            if (method === "DELETE") {
                state.comparison.set(userId, []);
                return noContent();
            }
        }

        return apiError(404, "NOT_FOUND", `No fake route for ${method} ${path}`);
    }
}

/** The wishlist/comparison items a fresh signed-in test user starts with. */
export const TEST_USER_ID = 1;
