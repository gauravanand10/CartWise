import { BadgeCheck, Star, ThumbsUp } from "lucide-react";

import { formatCount } from "../../../lib/currency";
import type { Review } from "../types/product";

interface ReviewCardProps {
    review: Review;
}

/** One customer review, with its verified-purchase badge. */
export default function ReviewCard({ review }: ReviewCardProps) {
    const posted = new Date(review.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <li className="rounded-2xl border border-slate-200 p-4 sm:p-5">

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <div className="flex min-w-0 items-center gap-2.5">
                    {/* Initial tile rather than an avatar image: there are no
                        user photos to load, and a coloured monogram is honest
                        about that where a grey silhouette looks broken. */}
                    <span
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white"
                    >
                        {review.author.charAt(0)}
                    </span>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                            {review.author}
                        </p>

                        {review.verified && (
                            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <BadgeCheck size={12} aria-hidden="true" />
                                Verified purchase
                            </p>
                        )}
                    </div>
                </div>

                <div
                    className="flex shrink-0 items-center gap-0.5"
                    role="img"
                    aria-label={`${review.rating} out of 5 stars`}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={13}
                            aria-hidden="true"
                            className={
                                star <= review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                            }
                        />
                    ))}
                </div>
            </div>

            <h4 className="mt-3.5 text-sm font-semibold text-slate-900">
                {review.title}
            </h4>

            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {review.body}
            </p>

            <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <time dateTime={review.date}>{posted}</time>

                <span className="inline-flex items-center gap-1">
                    <ThumbsUp size={12} aria-hidden="true" />
                    {formatCount(review.helpful)} found this helpful
                </span>
            </div>

        </li>
    );
}
