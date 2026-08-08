import { Layers } from "lucide-react";

import ProductCard from "../../../components/ui/ProductCard";
import ProductSection from "./ProductSection";
import type { ProductCardModel, RelatedProducts as Related } from "../types/product";

interface RelatedProductsProps {
    related: Related;
}

interface Rail {
    id: string;
    title: string;
    description: string;
    items: ProductCardModel[];
}

/**
 * Similar, frequently compared and recommended products.
 *
 * Renders through the shared `components/ui/ProductCard`, so these tiles are
 * literally the same component the search results use — clicking one navigates
 * to its own details page and the whole section becomes a browsing loop.
 *
 * Empty rails are dropped rather than rendered as an empty heading: a product
 * in a single-item category genuinely has nothing to compare against.
 */
export default function RelatedProducts({ related }: RelatedProductsProps) {
    const rails: Rail[] = [
        {
            id: "similar",
            title: "Similar products",
            description: "Closest alternatives at around the same price.",
            items: related.similar,
        },
        {
            id: "compared",
            title: "Frequently compared",
            description: "What other shoppers looked at alongside this.",
            items: related.compared,
        },
        {
            id: "recommended",
            title: "Recommended for you",
            description: "Highest-scoring picks from other categories.",
            items: related.recommended,
        },
    ].filter((rail) => rail.items.length > 0);

    if (rails.length === 0) return null;

    return (
        <div className="space-y-6">
            {rails.map((rail, index) => (
                <ProductSection
                    key={rail.id}
                    id={`related-${rail.id}`}
                    title={rail.title}
                    description={rail.description}
                    // Only the first rail carries the section icon, so three
                    // stacked rails do not read as three unrelated sections.
                    icon={index === 0 ? Layers : undefined}
                >
                    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {rail.items.map((item) => (
                            <li key={item.slug} className="h-full">
                                <ProductCard product={item} />
                            </li>
                        ))}
                    </ul>
                </ProductSection>
            ))}
        </div>
    );
}
