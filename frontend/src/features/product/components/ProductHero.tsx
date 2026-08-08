import PricingCard from "./PricingCard";
import ProductActions from "./ProductActions";
import ProductGallery from "./ProductGallery";
import ProductSummary from "./ProductSummary";
import type { ProductDetail } from "../types/product";

interface ProductHeroProps {
    product: ProductDetail;
}

/**
 * The above-the-fold half of the page: gallery on one side, everything needed
 * to make a decision on the other.
 *
 * Single column until `lg`. A side-by-side gallery on a phone would leave both
 * halves too narrow to be useful, and the gallery has to come first in source
 * order so it is what a screen reader reaches first.
 */
export default function ProductHero({ product }: ProductHeroProps) {
    return (
        <section
            aria-label={`${product.name} overview`}
            className="grid gap-6 lg:grid-cols-2 lg:gap-10 xl:gap-14"
        >
            <div className="min-w-0">
                <ProductGallery
                    images={product.images}
                    name={product.name}
                    category={product.category}
                />
            </div>

            <div className="flex min-w-0 flex-col gap-5">
                <ProductSummary product={product} />

                <PricingCard product={product} />

                <ProductActions name={product.name} slug={product.slug} />
            </div>
        </section>
    );
}
