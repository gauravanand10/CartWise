import ProductCard from "../../../components/ui/ProductCard";
import type { ProductCardModel } from "../../../types/product";
import type { SearchProduct } from "../types/search";

interface SearchResultCardProps {
    product: SearchProduct;
}

/**
 * Adapter from the search model to the shared product card.
 *
 * The card itself now lives in `components/ui/ProductCard` because Product
 * Details renders the identical tile in its related-product rails — keeping a
 * second copy here would mean every future card change had to be made twice.
 * This file survives as the mapping layer so the search feature keeps its own
 * component boundary and `SearchProduct` never leaks into shared UI.
 */
export default function SearchResultCard({ product }: SearchResultCardProps) {
    const model: ProductCardModel = {
        slug: product.slug,
        name: product.title,
        brand: product.brand,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice,
        rating: product.rating,
        reviews: product.reviews,
        inStock: product.inStock,
        image: product.image,
    };

    return <ProductCard product={model} />;
}
