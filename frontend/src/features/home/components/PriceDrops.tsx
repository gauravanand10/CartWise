import { TrendingDown } from "lucide-react";

import { priceDropProducts } from "../data/products";
import ProductGrid from "./product/ProductGrid";
import Reveal from "./motion/Reveal";
import SectionContainer from "./section/SectionContainer";
import SectionHeader from "./section/SectionHeader";

/**
 * Products furthest below their usual price.
 *
 * Distinct from Flash Deals: those are time-boxed offers with a countdown,
 * these are ranked purely by how far the price has fallen against its own
 * history — no expiry, no urgency framing.
 *
 * Rendered as a plain section rather than a panel because the AI Picks panel
 * follows immediately after; two tinted panels back to back read as one block.
 */
export default function PriceDrops() {
    return (
        <SectionContainer id="price-drops">

            <Reveal>
                <SectionHeader
                    eyebrow="Tracked over 90 days"
                    icon={TrendingDown}
                    accentClass="text-emerald-600"
                    title="Biggest price drops"
                    subtitle="Ranked by how far each product has fallen below its usual price."
                    ctaLabel="All price drops"
                    ctaTo="/browse?sort=price-asc"
                />
            </Reveal>

            <ProductGrid products={priceDropProducts} />

        </SectionContainer>
    );
}
