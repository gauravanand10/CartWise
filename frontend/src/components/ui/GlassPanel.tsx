import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

type GlassVariant =
    | "default"
    | "light"
    | "dark"
    | "gradient";

interface GlassPanelProps
    extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: GlassVariant;
    blur?: boolean;
    padding?: boolean;
}

const baseStyles =
    "rounded-[32px] border transition-all duration-300";

const variants: Record<
    GlassVariant,
    string
> = {
    default:
        "border-white/30 bg-white/60 backdrop-blur-2xl shadow-xl",

    light:
        "border-white/50 bg-white/80 backdrop-blur-xl shadow-lg",

    dark:
        "border-slate-700/40 bg-slate-900/60 text-white backdrop-blur-2xl shadow-2xl",

    gradient:
        "border-white/20 bg-gradient-to-br from-white/50 via-fuchsia-50/60 to-violet-100/40 backdrop-blur-2xl shadow-xl",
};

export default function GlassPanel({
    children,
    variant = "default",
    blur = true,
    padding = true,
    className,
    ...props
}: GlassPanelProps) {
    return (
        <div
            className={cn(
                baseStyles,
                variants[variant],
                blur && "backdrop-blur-2xl",
                padding && "p-6",
                "hover:-translate-y-1 hover:shadow-2xl",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
