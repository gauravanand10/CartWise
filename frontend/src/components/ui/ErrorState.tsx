import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import Button from "./Button";

import { cn } from "../../lib/cn";

interface ErrorStateProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export default function ErrorState({
    title = "Something went wrong",
    description = "An unexpected error occurred. Please try again.",
    icon,
    actionLabel,
    onAction,
    className,
}: ErrorStateProps) {
    return (
        <section
            className={cn(
                "flex flex-col items-center justify-center rounded-[32px] border border-red-100 bg-white px-8 py-20 text-center shadow-lg",
                className
            )}
        >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500">
                {icon ?? (
                    <AlertTriangle
                        size={42}
                        strokeWidth={1.8}
                    />
                )}
            </div>

            <h2 className="mt-8 text-3xl font-black text-slate-900">
                {title}
            </h2>

            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-500">
                {description}
            </p>

            {actionLabel && onAction && (
                <div className="mt-10">
                    <Button
                        variant="danger"
                        onClick={onAction}
                    >
                        {actionLabel}
                    </Button>
                </div>
            )}
        </section>
    );
}
