import { TrendingUp } from "lucide-react";

import { trendingProducts } from "../data/products";
import ProductGrid from "./product/ProductGrid";
import Reveal from "./motion/Reveal";
import SectionContainer from "./section/SectionContainer";
import SectionHeader from "./section/SectionHeader";

export default function TrendingProducts() {
    return (
        <SectionContainer id="trending">

            <Reveal>
                <SectionHeader
                    eyebrow="Trending today"
                    icon={TrendingUp}
                    accentClass="text-blue-600"
                    title="What everyone's comparing"
                    subtitle="The most-viewed products on CartWise in the last 24 hours."
                    ctaLabel="See all"
                    ctaTo="/browse?sort=rating-desc"
                />
            </Reveal>

            <ProductGrid products={trendingProducts} />

        </SectionContainer>
    );
}
