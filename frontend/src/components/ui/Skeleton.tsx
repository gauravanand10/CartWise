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

export default function Skeleton({
    className,
    rounded = "md",
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]",
                "motion-safe:animate-[pulse_1.5s_ease-in-out_infinite]",
                roundedStyles[rounded],
                className
            )}
            {...props}
        />
    );
}
