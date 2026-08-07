import { ArrowRight } from "lucide-react";

import type { Banner } from "../../types/home";
import { eyebrow } from "../../styles";

interface BannerSlideProps {
    banner: Banner;
}

/** A single full-bleed promotional panel. Visual only — the carousel owns motion. */
export default function BannerSlide({ banner }: BannerSlideProps) {
    const { eyebrow: label, title, subtitle, cta, gradient, icon: Icon } = banner;

    return (
        <div
            className={`
                relative
                flex
                h-full
                w-full
                items-center
                overflow-hidden
                bg-gradient-to-br
                ${gradient}
            `}
        >
            {/* Depth: two soft blooms plus a low-contrast outline ring. */}

            <div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />

            <div
                className="
                    relative
                    z-10
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-8
                    px-6
                    pb-20
                    pt-9
                    sm:px-10
                    sm:pb-24
                    sm:pt-12
                    lg:px-16
                "
            >
                <div className="min-w-0 max-w-xl">
                    <span
                        className={`
                            inline-flex
                            items-center
                            rounded-full
                            border
                            border-white/25
                            bg-white/10
                            px-3
                            py-1
                            text-white/90
                            backdrop-blur-sm
                            sm:px-3.5
                            sm:py-1.5
                            ${eyebrow}
                        `}
                    >
                        {label}
                    </span>

                    <h3 className="mt-4 text-[26px] font-semibold leading-tight tracking-tight text-white min-[400px]:text-3xl sm:mt-5 sm:text-4xl lg:text-5xl">
                        {title}
                    </h3>

                    {/* Clamped rather than hidden on mobile: the subtitle carries
                        the offer detail, so it should shorten, not disappear. */}

                    <p className="mt-3 line-clamp-3 max-w-md text-sm leading-relaxed text-white/80 sm:mt-4 sm:line-clamp-none sm:text-base">
                        {subtitle}
                    </p>

                    <button
                        type="button"
                        className="
                            mt-6
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-white
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-slate-900
                            shadow-lg
                            transition-transform
                            duration-200
                            hover:scale-[1.03]
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-white
                            focus-visible:ring-offset-2
                            focus-visible:ring-offset-transparent
                            sm:mt-8
                            sm:px-6
                        "
                    >
                        {cta}
                        <ArrowRight size={16} />
                    </button>
                </div>

                {/* Oversized glyph anchors the right side. Appears from `md` and
                    grows at `lg`; below that the copy needs the full width. */}

                <div className="hidden shrink-0 md:block">
                    <div
                        className="
                            flex
                            h-28
                            w-28
                            items-center
                            justify-center
                            rounded-[28px]
                            border
                            border-white/20
                            bg-white/10
                            backdrop-blur-sm
                            lg:h-40
                            lg:w-40
                            lg:rounded-[36px]
                        "
                    >
                        <Icon
                            className="h-14 w-14 text-white/90 lg:h-20 lg:w-20"
                            strokeWidth={1.25}
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
