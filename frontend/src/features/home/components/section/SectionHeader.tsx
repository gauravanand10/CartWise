import type { LucideIcon } from "lucide-react";

import { eyebrow as eyebrowClass } from "../../styles";
import ViewAllButton from "./ViewAllButton";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    /** Small coloured label above the title, e.g. "Ends in 3 hours". */
    eyebrow?: string;
    /** Optional accent glyph shown beside the eyebrow. */
    icon?: LucideIcon;
    /** Tailwind text colour for the eyebrow/icon, e.g. "text-orange-600". */
    accentClass?: string;
    ctaLabel?: string;
    onCtaClick?: () => void;
    /** Renders light-on-dark, for use inside saturated panels. */
    onDark?: boolean;
    /** Hides the CTA entirely for sections that don't have a "see more" target. */
    hideCta?: boolean;
}

/**
 * Shared heading for every homepage section.
 *
 * Typography follows one hierarchy across the page — semibold title, regular
 * subtitle, optional coloured eyebrow — so sections read as a system rather
 * than as eight independently-styled blocks.
 */
export default function SectionHeader({
    title,
    subtitle,
    eyebrow,
    icon: Icon,
    accentClass = "text-blue-600",
    ctaLabel,
    onCtaClick,
    onDark = false,
    hideCta = false,
}: SectionHeaderProps) {
    return (
        // `items-start` while stacked, `items-end` once side by side: when the
        // CTA wraps onto its own line on narrow screens, baseline-aligning it
        // against a two-line title left it visually detached.
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">

            <div className="min-w-0">
                {eyebrow && (
                    <span
                        className={`
                            mb-2.5
                            flex
                            items-center
                            gap-1.5
                            ${eyebrowClass}
                            ${onDark ? "text-white/70" : accentClass}
                        `}
                    >
                        {Icon && <Icon size={14} aria-hidden="true" />}
                        {eyebrow}
                    </span>
                )}

                <h2
                    className={`
                        text-xl
                        font-semibold
                        tracking-tight
                        min-[400px]:text-2xl
                        sm:text-3xl
                        ${onDark ? "text-white" : "text-slate-900"}
                    `}
                >
                    {title}
                </h2>

                {subtitle && (
                    <p
                        className={`
                            mt-1.5
                            max-w-2xl
                            text-sm
                            leading-relaxed
                            sm:mt-2
                            sm:text-[15px]
                            ${onDark ? "text-white/70" : "text-slate-500"}
                        `}
                    >
                        {subtitle}
                    </p>
                )}
            </div>

            {!hideCta && (
                <ViewAllButton
                    label={ctaLabel}
                    onDark={onDark}
                    onClick={onCtaClick}
                />
            )}

        </div>
    );
}
