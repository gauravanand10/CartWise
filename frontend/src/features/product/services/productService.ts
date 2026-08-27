import { RELATED_LIMIT } from "../constants";
import { buildSpecGroups } from "../data/specs";
import { buildStoreOffers, lowestOffer } from "../data/offers";
import { buildGallery, cardImage } from "../utils/media";
import {
    fetchAffiliateRetailers,
    fetchProductBySlug,
    fetchProducts,
    type AffiliateRetailer,
    type ApiProduct,
} from "../../../services/api";
import type {
    ProductBase,
    ProductCardModel,
    ProductCategory,
    ProductDetail,
    RelatedProducts,
} from "../types/product";

/**
 * The single boundary between the Product Details UI and its data source.
 *
 * ===========================================================================
 * CHAPTER 26.5 — THIS FILE STOPPED LYING ABOUT WHERE PRODUCTS COME FROM
 *
 * Its own header used to say: "replacing the mock catalogue with a real
 * endpoint later is a change to this file alone." That was true, and the
 * change had never been made. Every function below read `data/catalogue.ts`,
 * a hand-written array of 23 records, while `/browse` and `/search` read
 * `GET /api/products` from the live database.
 *
 * The consequence was measured rather than assumed, and it was not small:
 *
 *     products in the database        100
 *     records in data/catalogue.ts     23
 *     resolving at /product/:slug      22   (one record was orphaned when
 *     answering "not found"            78    V6 renamed its product)
 *
 * Seventy-eight of a hundred products could be browsed, filtered, sorted,
 * wishlisted and compared — and could not be opened. The catalogue page linked
 * to a dead end for four cards out of five.
 *
 * This is not damage from Chapter 26.5. It predates Chapter 24. V3's own
 * header records the direction the copy went: "Rows 1-23 — mirrored from the
 * frontend catalogue", i.e. Chapter 22 seeded the database FROM this file and
 * left both copies live. Chapter 24 then grew the database to 50 without
 * growing the file, which is when the first 27 dead links appeared. Expanding
 * to 100 widened an existing hole; it did not dig one.
 *
 * ---------------------------------------------------------------------------
 * WHAT THE API ACTUALLY GIVES US, AND WHAT HAPPENED TO THE REST
 *
 * `GET /api/products/:slug` returns sixteen fields:
 *
 *     id, slug, name, brand, category, price, originalPrice, rating,
 *     reviewCount, inStock, imageUrl, imageAttribution, imageLicense,
 *     imageLicenseUrl, imageSourceUrl, imagePlaceholder
 *
 * That is the whole `products` table. The detail page previously rendered nine
 * further fields, and each one is now in exactly one of three states:
 *
 *   FROM THE API   name, brand, category, price, originalPrice, rating,
 *                  reviewCount, inStock, and the image with its licence.
 *
 *   FROM THE REAL  stores — built from `GET /api/affiliate/retailers`, which is
 *   CHAPTER 26     the same list the disclosure page reads and the same ids the
 *                  click endpoint accepts. The retailers are real. Their PRICES
 *                  are still derived offsets, because no free live pricing API
 *                  exists for CartWise to call — established in Chapter 24,
 *                  re-confirmed in Chapter 26, unchanged here — and every
 *                  surface that shows one says "reference price".
 *
 *                  specGroups — from `data/specs.ts`, which is a template per
 *                  CATEGORY plus researched overrides for the products that
 *                  have them. It is deliberately NOT moved into the database:
 *                  there are no spec columns in `products`, and adding some
 *                  would mean inventing values for a hundred rows. A category
 *                  template is honest about being a template; a `ram_gb` column
 *                  full of guesses would not be.
 *
 *   DERIVED        tagline, tags, overview, highlights, note — all computed
 *                  below from fields on this page. They restate; they never
 *                  claim.
 *
 *   DELETED        aiScore, stockCount, releasedAt, lowestAt, reviews,
 *                  ratingBuckets, and the invented `features` / `boxContents`
 *                  copy. See the note on ProductBase for why each one had to
 *                  go rather than be re-homed.
 * ===========================================================================
 */

/** Categories the spec templates know. Anything else falls back to Accessories. */
const KNOWN_CATEGORIES: ProductCategory[] = [
    "Smartphone",
    "Laptop",
    "Headphones",
    "Earbuds",
    "Smartwatch",
    "Television",
    "Accessories",
];

/**
 * Narrows the API's free-text category onto the closed union the spec
 * templates are keyed by.
 *
 * The server has no categories table — it derives the list by grouping the
 * products — so a migration could introduce a category this frontend has no
 * template for. Falling back to "Accessories" means such a product still opens
 * with a generic spec table instead of crashing the page, which is the correct
 * failure for a catalogue that is edited by SQL.
 */
function toCategory(value: string): ProductCategory {
    return KNOWN_CATEGORIES.find((known) => known === value) ?? "Accessories";
}

/**
 * The positioning line under the product name.
 *
 * Derived, and deliberately plain. The authored version of this field said
 * things like "Titanium build, A18 Pro speed and the best video on any phone"
 * — a superlative nobody measured, for one of 23 products, with nothing to
 * write for the other 77. A sentence assembled from brand, model and category
 * is duller and is true of every product in the catalogue.
 */
/**
 * Category as it reads mid-sentence.
 *
 * `ProductCategory` is a display label, not a noun that fits a sentence:
 * "Accessories", "Headphones" and "Earbuds" are plural, the rest singular. A
 * naive `a ${category}` produced "a accessories" and "a headphones" — visible
 * on the page, and the sort of thing that makes derived copy look like a
 * template failure rather than a sentence.
 */
function categoryNoun(category: ProductCategory): string {
    switch (category) {
        case "Accessories":
            return "an accessory";
        case "Headphones":
            return "a pair of headphones";
        case "Earbuds":
            return "a pair of earbuds";
        default:
            return `a ${category.toLowerCase()}`;
    }
}

function deriveTagline(product: ApiProduct): string {
    const model = product.name.replace(`${product.brand} `, "");
    const noun = categoryNoun(toCategory(product.category));

    return `The ${product.brand} ${model}, ${noun} in the CartWise catalogue.`;
}

/**
 * Short chips under the summary.
 *
 * Every one is a restatement of a value rendered elsewhere on the same screen,
 * which is the test a derived field has to pass: a reader who disbelieves a
 * chip can check it against the price, the rating or the stock line without
 * leaving the page.
 */
function deriveTags(product: ApiProduct): string[] {
    const tags: string[] = [toCategory(product.category), product.brand];

    if (product.originalPrice && product.originalPrice > product.price) {
        tags.push("Discounted");
    }

    if (product.rating >= 4.7) tags.push("Highly rated");
    if (!product.inStock) tags.push("Out of stock");

    return tags;
}

/** Prose form of the same facts, for the "About this product" block. */
function deriveOverview(product: ApiProduct): string {
    const category = toCategory(product.category).toLowerCase();

    const discount =
        product.originalPrice && product.originalPrice > product.price
            ? ` It is listed below its original price of ₹${product.originalPrice.toLocaleString("en-IN")}.`
            : "";

    const stock = product.inStock
        ? "It is shown as available at the retailers CartWise links to."
        : "It is currently shown as unavailable at the retailers CartWise links to.";

    return (
        `${product.name} is a ${category} from ${product.brand}, carried in the CartWise catalogue at a `
        + `reference price of ₹${product.price.toLocaleString("en-IN")}.${discount} `
        + `It holds a rating of ${product.rating} out of 5 across ${product.reviewCount.toLocaleString("en-IN")} `
        + `ratings. ${stock}`
    );
}

/** Bullet form. Same rule: each line restates something visible on the page. */
function deriveHighlights(product: ApiProduct): string[] {
    const highlights: string[] = [
        `${product.brand} ${toCategory(product.category).toLowerCase()}`,
        `Reference price ₹${product.price.toLocaleString("en-IN")}`,
        `Rated ${product.rating} of 5 from ${product.reviewCount.toLocaleString("en-IN")} ratings`,
    ];

    if (product.originalPrice && product.originalPrice > product.price) {
        const saving = product.originalPrice - product.price;
        highlights.push(`₹${saving.toLocaleString("en-IN")} below the listed original price`);
    }

    highlights.push(
        product.inStock ? "Shown in stock" : "Shown out of stock",
    );

    return highlights;
}

/**
 * CartWise's own note, and the replacement for the fabricated review section.
 *
 * Written in the first person plural and labelled in the UI as CartWise's note,
 * so there is no reading of it under which a person is being quoted. It says
 * only what the catalogue knows, including — importantly — that CartWise has
 * not handled the product. A site that compares prices has no basis for a
 * hands-on opinion, and saying so is more useful than pretending otherwise.
 */
function deriveNote(product: ApiProduct): string {
    const rating =
        product.rating >= 4.7
            ? "It is among the better-rated products in its category here"
            : product.rating >= 4.3
                ? "It rates solidly against others in its category here"
                : "It rates below the strongest products in its category here";

    const value =
        product.originalPrice && product.originalPrice > product.price
            ? ", and it is currently listed under its original price"
            : "";

    return (
        `${rating}${value}. CartWise has not handled this product: this note is drawn from the `
        + `catalogue's own figures — rating, rating count and reference price — and nothing else. `
        + `The prices shown are illustrative reference values, not live quotes.`
    );
}

/** API record -> the base every other projection is built from. */
function toBase(product: ApiProduct): ProductBase {
    return {
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        category: toCategory(product.category),
        tagline: deriveTagline(product),
        price: product.price,
        // The API sends null for "not discounted"; ProductBase uses absent.
        // They mean the same thing and the UI already tests for absence.
        originalPrice: product.originalPrice ?? undefined,
        rating: product.rating,
        reviewCount: product.reviewCount,
        inStock: product.inStock,
        tags: deriveTags(product),
        image: {
            url: product.imageUrl,
            attribution: product.imageAttribution,
            license: product.imageLicense,
            licenseUrl: product.imageLicenseUrl,
            sourceUrl: product.imageSourceUrl,
            placeholder: product.imagePlaceholder,
        },
    };
}

/**
 * Assembles the full detail model.
 *
 * Takes the retailer list as an argument rather than fetching it, so the two
 * network calls a detail page needs can be issued together instead of in
 * series — see `getProductBySlug`.
 */
function assemble(product: ApiProduct, retailers: AffiliateRetailer[]): ProductDetail {
    const base = toBase(product);
    const stores = buildStoreOffers(base, retailers);

    return {
        ...base,
        images: buildGallery(base),
        overview: deriveOverview(product),
        highlights: deriveHighlights(product),
        note: deriveNote(product),
        specGroups: buildSpecGroups(base),
        stores,
        lowestPrice: lowestOffer(stores),
    };
}

/** The card-sized projection. */
function toCard(base: ProductBase): ProductCardModel {
    return {
        slug: base.slug,
        name: base.name,
        brand: base.brand,
        category: base.category,
        price: base.price,
        originalPrice: base.originalPrice,
        rating: base.rating,
        reviews: base.reviewCount,
        inStock: base.inStock,
        image: cardImage(base),
    };
}

/**
 * Looks a product up by its URL slug.
 *
 * Resolves to `null` rather than throwing when the slug is unknown: an unknown
 * slug is a routing outcome the page renders as "not found", not an error
 * condition that needs a retry button. `fetchProductBySlug` already turns the
 * API's 404 into null for exactly this reason, so a thrown error here really is
 * a failure — a network fault or a 5xx — and the page's retry button is the
 * right response to it.
 *
 * The artificial `delay` that used to open this function is gone. It existed to
 * make a synchronous array lookup feel like a request; there is a real request
 * now, with real latency, and adding more would be adding it to a user.
 */
export async function getProductBySlug(
    slug: string,
): Promise<ProductDetail | null> {
    // Issued together. The retailer list does not depend on the product, and
    // awaiting it after the product would put a second round trip on the
    // critical path of every detail page for no reason.
    const [product, retailers] = await Promise.all([
        fetchProductBySlug(slug),
        fetchAffiliateRetailers(),
    ]);

    return product ? assemble(product, retailers) : null;
}

/**
 * The three related rails.
 *
 * Each is one filtered page of the real catalogue rather than a scan of a local
 * array, and the filtering is done by the server — `category`, `sort` and
 * `size` are parameters `GET /api/products` already supports, so this needed no
 * new endpoint.
 *
 * - Similar: same category, cheapest first. The direct alternatives.
 * - Frequently compared: same category, best rated. What a shopper cross-shops.
 * - Recommended: the best-rated products outside this category.
 *
 * "Recommended" is the one that changed meaning. It used to sort by `aiScore`,
 * a fabricated number; it now sorts by real customer rating. The rail is asked
 * for `RELATED_LIMIT + 1` items in the same-category cases so that removing the
 * product itself still leaves a full row.
 *
 * A failure in any single rail is swallowed to an empty list rather than
 * propagated: the product loaded, the page is useful, and a broken rail is not
 * a reason to replace a working page with an error screen.
 */
export async function getRelatedProducts(
    product: ProductDetail,
): Promise<RelatedProducts> {
    const notThisOne = (item: ApiProduct) => item.slug !== product.slug;
    const category = product.category.toLowerCase();

    const [similar, compared, recommended] = await Promise.all([
        fetchProducts({ category, sort: "price-asc", size: RELATED_LIMIT + 1 })
            .then((page) => page.content)
            .catch(() => []),
        fetchProducts({ category, sort: "rating-desc", size: RELATED_LIMIT + 1 })
            .then((page) => page.content)
            .catch(() => []),
        // No "not this category" filter exists, so this asks for a page wide
        // enough that removing same-category products still leaves a full rail.
        fetchProducts({ sort: "rating-desc", size: 40 })
            .then((page) => page.content)
            .catch(() => []),
    ]);

    const toRail = (items: ApiProduct[]) =>
        items.filter(notThisOne).slice(0, RELATED_LIMIT).map((item) => toCard(toBase(item)));

    return {
        similar: toRail(similar),
        compared: toRail(
            compared.filter((item) => item.brand !== product.brand),
        ),
        recommended: toRail(
            recommended.filter((item) => toCategory(item.category) !== product.category),
        ),
    };
}

/**
 * Best-rated products, for the not-found recovery screen.
 *
 * Asynchronous as of Chapter 26.5, where it was synchronous — the local array
 * it read no longer exists. The not-found screen therefore has to handle its
 * suggestions arriving late, which is a real change to that component and is
 * made there rather than papered over with a blocking call.
 */
export async function getPopularProducts(
    limit = RELATED_LIMIT,
): Promise<ProductCardModel[]> {
    try {
        const page = await fetchProducts({ sort: "rating-desc", size: limit });
        return page.content.map((item) => toCard(toBase(item)));
    } catch {
        // The recovery screen is already the failure path. It must not have a
        // failure path of its own.
        return [];
    }
}
