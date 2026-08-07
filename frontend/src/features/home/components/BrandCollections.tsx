import { brands } from "../data/brands";
import BrandCard from "./brand/BrandCard";
import Reveal from "./motion/Reveal";
import SectionContainer from "./section/SectionContainer";
import SectionHeader from "./section/SectionHeader";

export default function BrandCollections() {
    return (
        <SectionContainer id="brands">

            <Reveal>
                <SectionHeader
                    title="Shop by brand"
                    subtitle="Jump straight into a catalogue you already trust."
                    ctaLabel="All brands"
                />
            </Reveal>

            <div
                className="
                    grid
                    grid-cols-2
                    gap-3
                    min-[400px]:gap-4
                    sm:grid-cols-3
                    md:grid-cols-4
                    lg:grid-cols-5
                "
            >
                {brands.map((brand, index) => (
                    <Reveal
                        key={brand.id}
                        delay={Math.min(index * 0.04, 0.24)}
                    >
                        <BrandCard brand={brand} />
                    </Reveal>
                ))}
            </div>

        </SectionContainer>
    );
}
