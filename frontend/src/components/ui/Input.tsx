import { forwardRef } from "react";

import type {
    InputHTMLAttributes,
    ReactNode,
} from "react";

import { cn } from "../../lib/cn";

interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            helperText,
            error,
            leftIcon,
            rightIcon,
            className,
            ...props
        },
        ref
    ) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        {label}
                    </label>
                )}

                <div
                    className={cn(
                        "group flex h-14 items-center gap-3 rounded-3xl border bg-white px-5 transition-all duration-300",
                        error
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-slate-200 hover:border-fuchsia-300 focus-within:border-fuchsia-600 focus-within:ring-4 focus-within:ring-fuchsia-100"
                    )}
                >
                    {leftIcon && (
                        <div className="text-slate-400 transition group-focus-within:text-fuchsia-600">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={cn(
                            "flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400",
                            className
                        )}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="text-slate-400">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error ? (
                    <p className="mt-2 text-sm font-medium text-red-500">
                        {error}
                    </p>
                ) : helperText ? (
                    <p className="mt-2 text-sm text-slate-500">
                        {helperText}
                    </p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
