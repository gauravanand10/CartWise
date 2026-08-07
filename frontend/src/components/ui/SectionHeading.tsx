import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

interface SectionHeadingProps {
    title: string;
    subtitle?: string;
    badge?: ReactNode;
    action?: ReactNode;
    centered?: boolean;
    className?: string;
}

export default function SectionHeading({
    title,
    subtitle,
    badge,
    action,
    centered = false,
    className,
}: SectionHeadingProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
                centered && "items-center text-center",
                className
            )}
        >
            <div className="space-y-3">

                {badge}

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
                    {title}
                </h2>

                {subtitle && (
                    <p className="max-w-2xl text-lg leading-8 text-slate-500">
                        {subtitle}
                    </p>
                )}

            </div>

            {action && (
                <div className="flex shrink-0 items-center">
                    {action}
                </div>
            )}
        </div>
    );
}
