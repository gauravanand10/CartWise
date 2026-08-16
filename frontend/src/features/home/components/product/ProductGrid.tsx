import type { HomeProduct } from "../../types/home";
import Reveal from "../motion/Reveal";
// Chapter 23: the shared card, not the homepage's own copy. See
// features/home/utils/toCardModel for why an adapter stands between them.
import ProductCard from "../../../../components/ui/ProductCard";
import { glyphFor, toCardModel } from "../../utils/toCardModel";

interface ProductGridProps {
    products: HomeProduct[];
}

/** Responsive product grid. Cards stretch to equal height within each row. */
export default function ProductGrid({ products }: ProductGridProps) {
    return (
        // Column ramp: 1 → 2 → 3 → 4.
        // Two columns start at 400px rather than Tailwind's 640px `sm`, because
        // a single full-width card per row wastes most of a modern phone screen.
        // Below 400px (small Androids) one column keeps the price and CTA legible.
        <div
            className="
                grid
                grid-cols-1
                gap-3
                min-[400px]:grid-cols-2
                sm:gap-4
                lg:grid-cols-3
                lg:gap-5
                xl:grid-cols-4
            "
        >
            {products.map((product, index) => (
                <Reveal
                    key={product.id}
                    delay={Math.min(index * 0.05, 0.3)}
                    className="h-full"
                >
                    <ProductCard
                        product={toCardModel(product)}
                        badge={product.badge}
                        store={product.store}
                        fallbackIcon={glyphFor(product.category)}
                    />
                </Reveal>
            ))}
        </div>
    );
}
