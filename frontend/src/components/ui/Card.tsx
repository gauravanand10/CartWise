import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

type CardVariant =
    | "default"
    | "glass"
    | "gradient"
    | "product"
    | "interactive"
    | "flat";

interface CardProps
    extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: CardVariant;
    padding?: boolean;
}

const baseStyles =
    "rounded-[32px] transition-all duration-300";

const variantStyles: Record<CardVariant, string> = {
    default:
        "bg-white border border-slate-200 shadow-lg",

    glass:
        "border border-white/30 bg-white/60 backdrop-blur-2xl shadow-xl",

    gradient:
        "bg-gradient-to-br from-fuchsia-600 via-pink-600 to-purple-700 text-white shadow-2xl",

    product:
        "bg-white border border-slate-200 shadow-lg hover:-translate-y-2 hover:shadow-2xl",

    interactive:
        "bg-white border border-slate-200 shadow-lg hover:-translate-y-1 hover:shadow-xl cursor-pointer",

    flat:
        "bg-slate-50 border border-slate-200",
};

export default function Card({
    children,
    variant = "default",
    padding = true,
    className,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                baseStyles,
                variantStyles[variant],
                padding && "p-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
