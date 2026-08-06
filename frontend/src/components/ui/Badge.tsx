import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

type BadgeVariant =
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral"
    | "gradient";

type BadgeSize =
    | "sm"
    | "md"
    | "lg";

interface BadgeProps
    extends HTMLAttributes<HTMLSpanElement> {
    children: ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    icon?: ReactNode;
}

const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300";

const variants: Record<BadgeVariant, string> = {
    primary:
        "bg-fuchsia-100 text-fuchsia-700",

    secondary:
        "bg-violet-100 text-violet-700",

    success:
        "bg-emerald-100 text-emerald-700",

    warning:
        "bg-amber-100 text-amber-700",

    danger:
        "bg-red-100 text-red-700",

    info:
        "bg-cyan-100 text-cyan-700",

    neutral:
        "bg-slate-100 text-slate-700",

    gradient:
        "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white",
};

const sizes: Record<BadgeSize, string> = {
    sm: "h-6 px-3 text-xs",

    md: "h-8 px-4 text-sm",

    lg: "h-10 px-5 text-base",
};

export default function Badge({
    children,
    variant = "primary",
    size = "md",
    icon,
    className,
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {icon}
            {children}
        </span>
    );
}
