import BannerCarousel from "../banner/BannerCarousel";
import Reveal from "../motion/Reveal";
import HeroSearch from "./HeroSearch";

/**
 * Above-the-fold block: search, then promotions.
 *
 * Intentionally minimal — no statistics, comparison widgets or AI cards. Those
 * live further down the page so the first screen stays calm and the search
 * field is unmistakably the primary action.
 */
export default function Hero() {
    return (
        <section className="relative">

            {/* Ambient wash. Sits behind content and never intercepts clicks. */}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-200/40 via-violet-200/40 to-indigo-200/40 blur-[120px]"
            />

            <div className="relative space-y-14">

                <Reveal offset={16}>
                    <HeroSearch />
                </Reveal>

                <Reveal delay={0.1}>
                    <BannerCarousel />
                </Reveal>

            </div>

        </section>
    );
}
