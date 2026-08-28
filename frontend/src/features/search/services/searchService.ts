import { fetchProducts, type ApiProduct } from "../../../services/api";
import type { SearchProduct, SortOption } from "../types/search";
import type { SearchFilter } from "../types/filter";
import { applyFilters, sortProducts } from "../utils/searchUtils";

/**
 * The single boundary between the search UI and its data source.
 *
 * ===========================================================================
 * CHAPTER 30 — THIS NOW READS THE REAL CATALOGUE.
 *
 * Chapter 29 measured what it used to be: a 20-product static array in
 * `data/products.ts` while the database held 100, so 80 real products were
 * findable on /browse and invisible to search. Two routes over one catalogue
 * disagreed about whether a product existed.
 *
 * That was not laziness, it was a genuine blocker: `GET /api/products` had no
 * free-text parameter, and the alternative — fetching everything and filtering
 * in the browser — is the architecture Chapter 20 explicitly rejected for
 * /browse. This chapter added `?q=` to the endpoint (see
 * ProductSpecifications.matchesText), so the migration finally had somewhere
 * to go. The mock file is deleted.
 *
 * WHAT RUNS WHERE, STATED PLAINLY
 *
 *   server  the text match, and the category / brand / price / stock filters.
 *           All of it becomes a WHERE clause; nothing is scanned in the
 *           browser to produce the result set.
 *   client  the RATING filter and the sort.
 *
 * The two client-side pieces are deliberate rather than unfinished:
 *
 *   - The API has no rating filter. Adding one is a backend change this
 *     chapter did not need, because the server has already narrowed the set
 *     before it gets here.
 *   - "Relevance" is a real score computed from where and how the query
 *     matches each product (see `relevanceScore`), and the server has no
 *     equivalent. Ranking it client-side over the matched set is the only
 *     place it can happen.
 *
 * Both operate on at most one page of 100 — the API's own ceiling and the size
 * of the whole catalogue — so this is not the unbounded client-side filtering
 * Chapter 20 rejected. It is the server doing the selection and the client
 * doing the ordering.
 * ===========================================================================
 */

/** One page big enough to hold the entire catalogue; also the API's ceiling. */
const MAX_RESULTS = 100;

/**
 * Maps the API's product shape onto the search UI's.
 *
 * `addedAt` is gone from `SearchProduct` and so is the "Newest First" sort that
 * read it. The database records no creation date for a product, and the mock
 * file's `addedAt` values were invented — exactly the class of fabrication
 * Chapters 26 to 29 spent their time removing. Chapter 26.5 removed "New
 * arrivals" from the footer for the same reason; this is the last place that
 * claim survived.
 */
function toSearchProduct(product: ApiProduct): SearchProduct {
    return {
        id: product.id,
        slug: product.slug,
        title: product.name,
        brand: product.brand,
        category: product.category,
        price: Number(product.price),
        originalPrice:
            product.originalPrice == null ? undefined : Number(product.originalPrice),
        rating: product.rating,
        reviews: product.reviewCount,
        inStock: product.inStock,
        image: product.imageUrl ?? "",
    };
}

/** The category facet's "All" sentinel, which must not reach the API. */
const ALL = "All";

/**
 * Runs a search.
 *
 * The debounce lives in `useSearch`; by the time this is called the query is
 * the one the user stopped typing.
 */
export async function searchProducts(
    query: string,
    sort: SortOption,
    filter: SearchFilter,
): Promise<SearchProduct[]> {
    const page = await fetchProducts({
        // Blank is sent as undefined rather than "": the backend treats a blank
        // `q` as absent anyway, but not sending it keeps the request URL honest
        // about what was actually asked for.
        q: query.trim() || undefined,
        category:
            filter.category && filter.category !== ALL
                ? filter.category.toLowerCase()
                : undefined,
        // `brands` is deliberately NOT sent. It is multi-select and the API
        // takes a single brand, so pushing it server-side would silently drop
        // every brand after the first. It stays in `applyFilters` below, over
        // a set the server has already narrowed.
        minPrice: filter.price?.min,
        maxPrice: filter.price?.max,
        // Only ever sent when it actually filters — `inStock=false` means "no
        // filter", matching the backend's own reading of the parameter.
        inStock: filter.inStockOnly ? true : undefined,
        size: MAX_RESULTS,
    });

    const products = page.content.map(toSearchProduct);

    // Rating filter and ordering, over the set the server already narrowed.
    return sortProducts(applyFilters(products, filter), sort, query);
}

/**
 * The unfiltered catalogue — used to build facet lists and price bounds.
 *
 * Asynchronous as of Chapter 30, because it is a request now. Facets are built
 * from the WHOLE catalogue rather than from the current results on purpose:
 * deriving them from filtered data makes every other option vanish the moment
 * one is picked, leaving no way back without clearing the filter first.
 *
 * A failure resolves to an empty list rather than rejecting. The facets are a
 * refinement affordance; the search itself has its own error path, and a failed
 * facet request should not take the page down with it.
 */
export async function getCatalogue(): Promise<SearchProduct[]> {
    try {
        const page = await fetchProducts({ size: MAX_RESULTS });
        return page.content.map(toSearchProduct);
    } catch {
        return [];
    }
}
