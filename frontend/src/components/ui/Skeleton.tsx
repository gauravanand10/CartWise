import type { HTMLAttributes } from "react";

import { cn } from "../../lib/cn";

interface SkeletonProps
    extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    rounded?: "sm" | "md" | "lg" | "full";
}

const roundedStyles = {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-3xl",
    full: "rounded-full",
};

/**
 * A loading placeholder.
 *
 * ---------------------------------------------------------------------------
 * CHAPTER 29 — CALMER, AND ANNOUNCED.
 *
 * It was a slate gradient running Tailwind's `animate-pulse` on a 1.5s loop,
 * with a second `motion-safe:animate-[pulse…]` layered on top of the first — a
 * duplicate that did nothing except make the rule harder to read.
 *
 * Two changes. The animation is now `cw-skeleton`: one flat neutral from the
 * token set breathing between full and 55% opacity over 1.6s. A loading state
 * should be the quietest thing on a screen, and a high-contrast gradient
 * sweeping left to right is the most eye-catching motion an interface can make
 * — it pulled attention to the part of the page with the least information on
 * it.
 *
 * And `aria-hidden`. A skeleton is a picture of content that does not exist
 * yet; announcing a screenful of empty boxes to a screen reader is noise. The
 * components that own them mark the region `aria-busy`, which is the property
 * that actually carries "this is loading" to assistive technology.
 * ---------------------------------------------------------------------------
 */
export default function Skeleton({
    className,
    rounded = "md",
    ...props
}: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={cn("cw-skeleton", roundedStyles[rounded], className)}
            {...props}
        />
    );
}
