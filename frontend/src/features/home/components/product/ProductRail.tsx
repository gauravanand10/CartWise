import type { HomeProduct } from "../../types/home";
import Rail from "../rail/Rail";
import { railItem } from "../../styles";
import ProductCard from "./ProductCard";

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
                    <ProductCard product={product} />
                </div>
            ))}
        </Rail>
    );
}
