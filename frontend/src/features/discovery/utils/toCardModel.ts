import type { ApiProduct } from "../../../services/api";
import type { ProductCardModel } from "../../../types/product";

/**
 * Adapts the API's product shape to the one `ProductCard` renders.
 *
 * Three fields genuinely differ and this is the one place that reconciles them,
 * exactly as `services/api.ts` documented when it named the mismatch: the API
 * says `reviewCount` and `imageUrl`, the card model says `reviews` and `image`.
 * Neither side is wrong — the API keeps the database's vocabulary because that
 * is the contract other clients read, and the card model keeps the frontend's.
 *
 * The adapter lives here rather than in `api.ts` on purpose. `api.ts` is the
 * boundary to the server and should describe what the server sends; the moment
 * it starts renaming fields to suit one component, it stops being a description
 * of the API and becomes a second, undocumented contract.
 */
export function toCardModel(product: ApiProduct): ProductCardModel {
    return {
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,

        // `null` from the API becomes `undefined`, because the card model marks
        // this optional rather than nullable. Passing null through would render
        // a struck-through "₹null" wherever the card tests truthiness loosely.
        originalPrice: product.originalPrice ?? undefined,

        rating: product.rating,
        reviews: product.reviewCount,
        inStock: product.inStock,

        // The card's `image` is a required string and `SafeImage` already draws
        // a placeholder for anything it cannot load, so an empty string is the
        // honest value for "no image" — it fails the load and gets the fallback.
        image: product.imageUrl ?? "",

        // Deliberately absent. `aiScore` has no column behind it, and the card
        // hides its badge when the field is undefined. Inventing a number here
        // would put a fabricated score on every product on the browse page.
    };
}
