import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

import Button from "./Button";

import { cn } from "../../lib/cn";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: ReactNode;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export default function EmptyState({
    title,
    description,
    icon,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <section
            className={cn(
                "flex flex-col items-center justify-center rounded-[32px] border border-slate-200 bg-white px-8 py-20 text-center shadow-lg",
                className
            )}
        >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-fuchsia-50 text-fuchsia-600">
                {icon ?? <SearchX size={42} strokeWidth={1.8} />}
            </div>

            <h2 className="mt-8 text-2xl sm:text-3xl font-black text-slate-900">
                {title}
            </h2>

            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-500">
                {description}
            </p>

            {actionLabel && onAction && (
                <div className="mt-10">
                    <Button onClick={onAction}>
                        {actionLabel}
                    </Button>
                </div>
            )}
        </section>
    );
}
