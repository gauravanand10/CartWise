import { Sparkles } from "lucide-react";

import { aiPicks } from "../data/products";
import AIPickCard from "./ai/AIPickCard";
import Reveal from "./motion/Reveal";
import SectionContainer from "./section/SectionContainer";
import SectionHeader from "./section/SectionHeader";

export default function AIPicks() {
    return (
        <SectionContainer
            id="ai-picks"
            panel
            background="bg-slate-50"
        >

            <Reveal>
                <SectionHeader
                    eyebrow="CartWise AI"
                    icon={Sparkles}
                    accentClass="text-violet-600"
                    title="What our AI would buy"
                    subtitle="Scored on price history, review sentiment and real-world benchmarks — not on what a store paid to promote."
                    ctaLabel="How scoring works"
                />
            </Reveal>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {aiPicks.map((pick, index) => (
                    <Reveal
                        key={pick.id}
                        delay={Math.min(index * 0.07, 0.25)}
                        className="h-full"
                    >
                        <AIPickCard pick={pick} />
                    </Reveal>
                ))}
            </div>

        </SectionContainer>
    );
}
