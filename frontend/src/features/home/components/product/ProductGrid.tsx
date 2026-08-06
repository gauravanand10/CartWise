import type { HomeProduct } from "../../types/home";
import Reveal from "../motion/Reveal";
import ProductCard from "./ProductCard";

interface ProductGridProps {
    products: HomeProduct[];
}

/** Responsive product grid. Cards stretch to equal height within each row. */
export default function ProductGrid({ products }: ProductGridProps) {
    return (
        <div
            className="
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
            "
        >
            {products.map((product, index) => (
                <Reveal
                    key={product.id}
                    delay={Math.min(index * 0.05, 0.3)}
                    className="h-full"
                >
                    <ProductCard product={product} />
                </Reveal>
            ))}
        </div>
    );
}
