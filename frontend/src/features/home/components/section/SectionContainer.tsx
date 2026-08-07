import type { ReactNode } from "react";

interface SectionContainerProps {
    children: ReactNode;
    /** Renders content inside a large rounded, tinted panel instead of directly on the page background. */
    panel?: boolean;
    /** Tailwind background classes for the panel, e.g. "bg-slate-50". */
    background?: string;
    /** Use with a saturated/dark `background` to switch to light-on-dark panel chrome. */
    dark?: boolean;
    className?: string;
    /** Anchor id / aria-labelledby target. */
    id?: string;
}

/**
 * Wraps a homepage section.
 *
 * Width and centering come from the page's shared `Container`
 * (components/layout/Container.tsx) further up the tree, so this component only
 * controls the section's own background treatment — never its alignment.
 *
 * Note it does NOT set a text colour on the dark variant: doing so would cascade
 * into nested white cards and wash out their text. Dark sections pass `onDark`
 * to the specific children that need it instead.
 */
export default function SectionContainer({
    children,
    panel = false,
    background = "",
    dark = false,
    className = "",
    id,
}: SectionContainerProps) {
    if (!panel) {
        return (
            <section id={id} className={className}>
                {children}
            </section>
        );
    }

    return (
        <section
            id={id}
            className={`
                rounded-[24px]
                p-5
                sm:rounded-[36px]
                sm:p-10
                lg:p-14
                ${dark
                    ? "shadow-[0_24px_60px_-24px_rgba(15,23,42,0.5)]"
                    : "ring-1 ring-slate-200/70"
                }
                ${background}
                ${className}
            `}
        >
            {children}
        </section>
    );
}
