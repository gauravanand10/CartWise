import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { banners } from "../../data/banners";
import { useCarousel } from "../../hooks/useCarousel";
import BannerSlide from "./BannerSlide";

/** Horizontal travel of the incoming/outgoing slide, in px. */
const SLIDE_OFFSET = 48;

export default function BannerCarousel() {
    const reduceMotion = useReducedMotion();

    const { index, direction, next, prev, goTo, pause, resume } = useCarousel({
        length: banners.length,
        intervalMs: 5500,
        // Auto-advancing motion is exactly what reduced-motion users ask us not to do.
        autoPlay: !reduceMotion,
    });

    const banner = banners[index];

    return (
        <section
            aria-roledescription="carousel"
            aria-label="Promotions"
            onMouseEnter={pause}
            onMouseLeave={resume}
            onFocusCapture={pause}
            onBlurCapture={resume}
            className="
                relative
                h-[380px]
                overflow-hidden
                rounded-[32px]
                shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)]
                sm:h-[340px]
            "
        >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={banner.id}
                    custom={direction}
                    initial={{
                        opacity: 0,
                        x: reduceMotion ? 0 : direction * SLIDE_OFFSET,
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{
                        opacity: 0,
                        x: reduceMotion ? 0 : direction * -SLIDE_OFFSET,
                    }}
                    transition={{
                        duration: reduceMotion ? 0.2 : 0.55,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0"
                >
                    <BannerSlide banner={banner} />
                </motion.div>
            </AnimatePresence>

            {/* Controls */}

            <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-between px-8 sm:px-12 lg:px-16">

                {/* Dots double as a progress indicator. */}

                <div className="flex items-center gap-2">
                    {banners.map((item, dotIndex) => {
                        const active = dotIndex === index;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => goTo(dotIndex)}
                                aria-label={`Go to ${item.title}`}
                                aria-current={active}
                                className={`
                                    h-1.5
                                    rounded-full
                                    transition-all
                                    duration-300
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-white
                                    ${active
                                        ? "w-8 bg-white"
                                        : "w-1.5 bg-white/45 hover:bg-white/70"
                                    }
                                `}
                            />
                        );
                    })}
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                    <button
                        type="button"
                        onClick={prev}
                        aria-label="Previous promotion"
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/25
                            bg-white/10
                            text-white
                            backdrop-blur-sm
                            transition
                            hover:bg-white/20
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-white
                        "
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={next}
                        aria-label="Next promotion"
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/25
                            bg-white/10
                            text-white
                            backdrop-blur-sm
                            transition
                            hover:bg-white/20
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-white
                        "
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

            </div>
        </section>
    );
}
