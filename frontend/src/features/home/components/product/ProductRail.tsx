import type { HomeProduct } from "../../types/home";
import Rail from "../rail/Rail";
import { railItem } from "../../styles";
// Chapter 23: the shared card, not the homepage's own copy.
import ProductCard from "../../../../components/ui/ProductCard";
import { glyphFor, toCardModel } from "../../utils/toCardModel";

interface ProductRailProps {
    products: HomeProduct[];
    /** Accessible name for the scroll region, e.g. "Recently viewed products". */
    label: string;
}

/** Netflix-style horizontal row of product cards. */
export default function ProductRail({ products, label }: ProductRailProps) {
    return (
        <Rail label={label}>
            {products.map((product) => (
                <div
                    key={product.id}
                    className={railItem}
                >
                    <ProductCard
                        product={toCardModel(product)}
                        badge={product.badge}
                        store={product.store}
                        fallbackIcon={glyphFor(product.category)}
                        className="h-full"
                    />
                </div>
            ))}
        </Rail>
    );
}
