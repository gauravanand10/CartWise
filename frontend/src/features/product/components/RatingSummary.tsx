import { Star } from "lucide-react";

import { formatCount } from "../../../lib/currency";
import type { RatingBucket } from "../types/product";

interface RatingSummaryProps {
    rating: number;
    reviewCount: number;
    buckets: RatingBucket[];
}

/**
 * Overall score plus the star distribution.
 *
 * The histogram matters as much as the average: a 4.5 built from straight
 * fours reads very differently from a 4.5 split between fives and ones, and the
 * bars are the only way to tell them apart.
 */
export default function RatingSummary({
    rating,
    reviewCount,
    buckets,
}: RatingSummaryProps) {
    const max = Math.max(...buckets.map((bucket) => bucket.count), 1);

    return (
        <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:gap-8">

            <div className="text-center sm:text-left">
                <p className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    {rating.toFixed(1)}
                </p>

                <div
                    className="mt-1.5 flex items-center justify-center gap-0.5 sm:justify-start"
                    role="img"
                    aria-label={`${rating} out of 5 stars`}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={15}
                            aria-hidden="true"
                            className={
                                star <= Math.round(rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                            }
                        />
                    ))}
                </div>

                <p className="mt-1.5 whitespace-nowrap text-xs text-slate-500">
                    {formatCount(reviewCount)} ratings
                </p>
            </div>

            <ul className="space-y-2">
                {buckets.map((bucket) => {
                    const share = Math.round((bucket.count / max) * 100);
                    const percent = Math.round((bucket.count / reviewCount) * 100);

                    return (
                        <li key={bucket.stars} className="flex items-center gap-3">
                            <span className="w-8 shrink-0 text-xs font-medium text-slate-600">
                                {bucket.stars}★
                            </span>

                            <span
                                className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100"
                                role="img"
                                aria-label={`${bucket.stars} ${bucket.stars === 1 ? "star" : "stars"}: ${formatCount(bucket.count)} ratings, ${percent} percent`}
                            >
                                {/* Inline width: continuous data, no utility class can express it. */}
                                <span
                                    className="block h-full rounded-full bg-amber-400"
                                    style={{ width: `${share}%` }}
                                />
                            </span>

                            <span className="w-12 shrink-0 text-right text-xs tabular-nums text-slate-400">
                                {percent}%
                            </span>
                        </li>
                    );
                })}
            </ul>

        </div>
    );
}
