import { Star } from "lucide-react";

import { cn } from "../../lib/cn";

type RatingSize = "sm" | "md" | "lg";

interface RatingProps {
    value: number;
    reviews?: number;
    size?: RatingSize;
    showValue?: boolean;
    compact?: boolean;
    className?: string;
}

const iconSize: Record<RatingSize, number> = {
    sm: 14,
    md: 16,
    lg: 20,
};

const textSize: Record<RatingSize, string> = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
};

export default function Rating({
    value,
    reviews,
    size = "md",
    showValue = true,
    compact = false,
    className,
}: RatingProps) {
    const fullStars = Math.round(value);

    return (
        <div
            className={cn(
                "flex items-center gap-2",
                textSize[size],
                className
            )}
        >
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                        key={index}
                        size={iconSize[size]}
                        className={cn(
                            index < fullStars
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                        )}
                    />
                ))}
            </div>

            {showValue && (
                <span className="font-semibold text-slate-700">
                    {value.toFixed(1)}
                </span>
            )}

            {!compact && reviews !== undefined && (
                <span className="text-slate-500">
                    ({reviews.toLocaleString()})
                </span>
            )}
        </div>
    );
}
