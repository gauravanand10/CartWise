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
                    /*
                        Chapter 24: this CTA was a dead button labelled "How
                        scoring works", and it is the one section CTA that
                        could not simply be repointed. Every other one wanted a
                        filtered catalogue, which /browse already serves. This
                        one promises an explanation of the AI score, and there
                        is no such page in the application — pointing it at the
                        catalogue would answer a question the user did not ask.
                        Hidden until the explainer exists. Deferred, and stated
                        in the chapter report rather than papered over.
                    */
                    hideCta
                />
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
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
