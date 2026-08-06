import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

type ChipVariant =
    | "default"
    | "primary"
    | "success"
    | "danger";

type ChipSize =
    | "sm"
    | "md"
    | "lg";

interface ChipProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    selected?: boolean;
    icon?: ReactNode;
    variant?: ChipVariant;
    size?: ChipSize;
}

const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-full border font-medium transition-all duration-300";

const variants: Record<ChipVariant, string> = {
    default:
        "border-slate-200 bg-white text-slate-700 hover:border-fuchsia-500 hover:bg-fuchsia-50 hover:text-fuchsia-600",

    primary:
        "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 hover:border-fuchsia-600",

    success:
        "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-600",

    danger:
        "border-red-200 bg-red-50 text-red-700 hover:border-red-600",
};

const selectedStyles: Record<ChipVariant, string> = {
    default:
        "border-fuchsia-600 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg",

    primary:
        "border-fuchsia-600 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg",

    success:
        "border-emerald-600 bg-emerald-600 text-white shadow-lg",

    danger:
        "border-red-600 bg-red-600 text-white shadow-lg",
};

const sizes: Record<ChipSize, string> = {
    sm: "h-9 px-4 text-sm",

    md: "h-11 px-5 text-sm",

    lg: "h-12 px-6 text-base",
};

export default function Chip({
    children,
    selected = false,
    icon,
    variant = "default",
    size = "md",
    className,
    ...props
}: ChipProps) {
    return (
        <button
            type="button"
            className={cn(
                baseStyles,
                sizes[size],
                selected
                    ? selectedStyles[variant]
                    : variants[variant],
                "hover:-translate-y-0.5 active:scale-95",
                className
            )}
            {...props}
        >
            {icon}
            {children}
        </button>
    );
}
