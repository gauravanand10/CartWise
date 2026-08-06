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
                    px-8
                    pb-24
                    pt-12
                    sm:px-12
                    lg:px-16
                "
            >
                <div className="max-w-xl">
                    <span
                        className={`
                            inline-flex
                            items-center
                            rounded-full
                            border
                            border-white/25
                            bg-white/10
                            px-3.5
                            py-1.5
                            text-white/90
                            backdrop-blur-sm
                            ${eyebrow}
                        `}
                    >
                        {label}
                    </span>

                    <h3 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                        {title}
                    </h3>

                    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                        {subtitle}
                    </p>

                    <button
                        type="button"
                        className="
                            mt-8
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-white
                            px-6
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
                        "
                    >
                        {cta}
                        <ArrowRight size={16} />
                    </button>
                </div>

                {/* Oversized glyph anchors the right side; hidden when space is tight. */}

                <div className="hidden shrink-0 lg:block">
                    <div
                        className="
                            flex
                            h-40
                            w-40
                            items-center
                            justify-center
                            rounded-[36px]
                            border
                            border-white/20
                            bg-white/10
                            backdrop-blur-sm
                        "
                    >
                        <Icon
                            className="h-20 w-20 text-white/90"
                            strokeWidth={1.25}
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
