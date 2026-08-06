import { Sparkles } from "lucide-react";

import { recommendedProducts } from "../data/products";
import ProductRail from "./product/ProductRail";
import Reveal from "./motion/Reveal";
import SectionContainer from "./section/SectionContainer";
import SectionHeader from "./section/SectionHeader";

export default function RecommendedProducts() {
    return (
        <SectionContainer id="recommended">

            <Reveal>
                <SectionHeader
                    eyebrow="Picked for you"
                    icon={Sparkles}
                    accentClass="text-violet-600"
                    title="Recommended for you"
                    subtitle="Based on what you've viewed and compared so far."
                    ctaLabel="Refine picks"
                />
            </Reveal>

            <Reveal delay={0.08}>
                <ProductRail
                    products={recommendedProducts}
                    label="Recommended products"
                />
            </Reveal>

        </SectionContainer>
    );
}
