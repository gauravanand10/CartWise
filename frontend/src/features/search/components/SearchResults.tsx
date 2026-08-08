import SearchResultCard from "./SearchResultCard";
import type { SearchProduct } from "../types/search";

interface SearchResultsProps {
    products: SearchProduct[];
}

/**
 * Responsive result grid: 1 → 2 → 3 columns.
 *
 * Two columns start at 400px rather than Tailwind's 640px `sm`, matching the
 * homepage grid so both pages present products at the same density.
 */
export default function SearchResults({ products }: SearchResultsProps) {
    return (
        <ul
            className="
                grid
                grid-cols-1
                gap-3
                min-[400px]:grid-cols-2
                sm:gap-4
                xl:grid-cols-3
                xl:gap-5
            "
        >
            {products.map((product) => (
                <li key={product.id} className="h-full">
                    <SearchResultCard product={product} />
                </li>
            ))}
        </ul>
    );
}
