import { Flame } from "lucide-react";

import { flashDeals } from "../data/products";
import { railItem } from "../styles";
import FlashDealCard from "./flash/FlashDealCard";
import Rail from "./rail/Rail";
import Reveal from "./motion/Reveal";
import SectionContainer from "./section/SectionContainer";
import SectionHeader from "./section/SectionHeader";

export default function FlashDeals() {
    return (
        <SectionContainer id="flash-deals">

            <Reveal>
                <SectionHeader
                    eyebrow="Live now"
                    icon={Flame}
                    accentClass="text-orange-600"
                    title="Flash deals"
                    subtitle="Time-boxed price drops, refreshed hourly across every store we track."
                    ctaLabel="All deals"
                />
            </Reveal>

            <Reveal delay={0.08}>
                <Rail label="Flash deals">
                    {flashDeals.map((deal) => (
                        <div
                            key={deal.id}
                            className={`${railItem} w-[260px] sm:w-[280px]`}
                        >
                            <FlashDealCard deal={deal} />
                        </div>
                    ))}
                </Rail>
            </Reveal>

        </SectionContainer>
    );
}
