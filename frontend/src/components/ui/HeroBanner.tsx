import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

interface HeroBannerProps {
    badge?: ReactNode;
    title: ReactNode;
    subtitle: ReactNode;
    actions?: ReactNode;
    image?: ReactNode;
    className?: string;
}

export default function HeroBanner({
    badge,
    title,
    subtitle,
    actions,
    image,
    className,
}: HeroBannerProps) {
    return (
        <section
            className={cn(
                "relative overflow-hidden rounded-[40px]",
                "bg-gradient-to-br from-fuchsia-600 via-pink-600 to-purple-700",
                "px-10 py-16 text-white shadow-2xl",
                className
            )}
        >
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />

            <div className="relative grid items-center gap-12 lg:grid-cols-2">
                <div className="space-y-8">
                    {badge}

                    <div className="space-y-5">
                        <h1 className="text-5xl font-black leading-tight tracking-tight lg:text-6xl">
                            {title}
                        </h1>

                        <p className="max-w-2xl text-xl leading-9 text-fuchsia-100">
                            {subtitle}
                        </p>
                    </div>

                    {actions && (
                        <div className="flex flex-wrap gap-4">
                            {actions}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center">
                    {image}
                </div>
            </div>
        </section>
    );
}
