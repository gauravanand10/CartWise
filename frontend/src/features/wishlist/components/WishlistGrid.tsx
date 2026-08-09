import ProductCard from "../../../components/ui/ProductCard";
import type { ProductCardModel } from "../../product/types/product";

interface WishlistGridProps {
    products: ProductCardModel[];
}

/**
 * The saved-products grid.
 *
 * Renders the shared `components/ui/ProductCard` — the same tile search results
 * and related-product rails use — so a saved product looks and behaves exactly
 * as it does everywhere else, and already carries the image, brand, rating,
 * price, original price, discount badge, wishlist and compare controls and the
 * link to its product page. A wishlist-specific card would have duplicated all
 * of that.
 *
 * Column ramp matches the search results grid: 1 → 2 at 400px → 3 at `xl`.
 */
export default function WishlistGrid({ products }: WishlistGridProps) {
    return (
        <ul
            className="
                grid
                grid-cols-1
                gap-3
                min-[400px]:grid-cols-2
                sm:gap-4
                lg:grid-cols-3
                xl:grid-cols-4
                xl:gap-5
            "
        >
            {products.map((product) => (
                <li key={product.slug} className="h-full">
                    <ProductCard product={product} />
                </li>
            ))}
        </ul>
    );
}
