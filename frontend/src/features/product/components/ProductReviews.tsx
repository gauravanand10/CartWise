import { MessageSquareText } from "lucide-react";

import ProductSection from "./ProductSection";
import RatingSummary from "./RatingSummary";
import ReviewCard from "./ReviewCard";
import { formatCount } from "../../../lib/currency";
import type { RatingBucket, Review } from "../types/product";

interface ProductReviewsProps {
    rating: number;
    reviewCount: number;
    buckets: RatingBucket[];
    reviews: Review[];
}

/** Overall score, distribution and the featured reviews. */
export default function ProductReviews({
    rating,
    reviewCount,
    buckets,
    reviews,
}: ProductReviewsProps) {
    return (
        <ProductSection
            id="reviews"
            title="Ratings & reviews"
            icon={MessageSquareText}
            description={`Based on ${formatCount(reviewCount)} verified ratings across all stores.`}
        >
            <div className="space-y-7">

                <RatingSummary
                    rating={rating}
                    reviewCount={reviewCount}
                    buckets={buckets}
                />

                <div className="border-t border-slate-100 pt-6">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Featured reviews
                    </h3>

                    {reviews.length === 0 ? (
                        // Genuine empty state: a product can be listed before
                        // anyone has written about it.
                        <p className="mt-3 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                            No written reviews yet. Ratings above come from
                            store aggregates.
                        </p>
                    ) : (
                        <ul className="mt-3 space-y-3">
                            {reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </ProductSection>
    );
}
