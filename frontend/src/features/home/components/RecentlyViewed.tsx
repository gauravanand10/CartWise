import { History } from "lucide-react";

import { recentlyViewedProducts } from "../data/products";
import ProductRail from "./product/ProductRail";
import Reveal from "./motion/Reveal";
import SectionContainer from "./section/SectionContainer";
import SectionHeader from "./section/SectionHeader";

export default function RecentlyViewed() {
    return (
        <SectionContainer id="recently-viewed">

            <Reveal>
                <SectionHeader
                    eyebrow="Pick up where you left off"
                    icon={History}
                    accentClass="text-slate-500"
                    title="Recently viewed"
                    ctaLabel="Full history"
                />
            </Reveal>

            <Reveal delay={0.08}>
                <ProductRail
                    products={recentlyViewedProducts}
                    label="Recently viewed products"
                />
            </Reveal>

        </SectionContainer>
    );
}
