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
        // `overflow-x-clip` (not `hidden`) contains the decorative wash without
        // creating a scroll container, so `position: sticky` on the navbar above
        // keeps working.
        <section className="relative overflow-x-clip">

            {/* Ambient wash. Sits behind content and never intercepts clicks.
                Width is clamped to the viewport: a hardcoded 820px here used to
                push the document 227px wider than a 375px phone, giving every
                mobile screen a horizontal scrollbar. */}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 left-1/2 h-[260px] w-full max-w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-200/40 via-violet-200/40 to-indigo-200/40 blur-[80px] sm:h-[340px] sm:blur-[100px] lg:h-[420px] lg:blur-[120px]"
            />

            <div className="relative space-y-10 sm:space-y-12 lg:space-y-14">

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
