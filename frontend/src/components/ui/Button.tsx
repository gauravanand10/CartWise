import type {
    ButtonHTMLAttributes,
    ReactNode,
} from "react";

import { cn } from "../../lib/cn";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "success"
    | "danger";

export type ButtonSize =
    | "sm"
    | "md"
    | "lg";

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 text-white shadow-lg hover:-translate-y-0.5 hover:shadow-2xl",

    secondary:
        "bg-slate-900 text-white hover:bg-slate-800",

    outline:
        "border border-slate-300 bg-white text-slate-800 hover:border-fuchsia-600 hover:text-fuchsia-600 hover:shadow-md",

    ghost:
        "bg-transparent text-slate-700 hover:bg-slate-100",

    success:
        "bg-emerald-600 text-white hover:bg-emerald-700",

    danger:
        "bg-red-500 text-white hover:bg-red-600",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-10 px-4 text-sm",

    md: "h-12 px-6 text-base",

    lg: "h-14 px-8 text-lg",
};

export default function Button({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    disabled,
    leftIcon,
    rightIcon,
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-3xl font-semibold transition-all duration-300",
                "hover:-translate-y-0.5 active:scale-95",
                "disabled:cursor-not-allowed disabled:opacity-50",
                variantStyles[variant],
                sizeStyles[size],
                fullWidth && "w-full",
                className
            )}
            {...props}
        >
            {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
                <>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </>
            )}
        </button>
    );
}
