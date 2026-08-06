import { Heart, ArrowRightLeft, Eye } from "lucide-react";

import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";
import PriceTag from "./PriceTag";
import Rating from "./Rating";
import StoreBadge from "./StoreBadge";

import { cn } from "../../lib/cn";

export interface ProductCardProps {
    id: string;

    image: string;

    brand: string;

    title: string;

    category?: string;

    rating: number;

    reviews: number;

    price: number;

    originalPrice?: number;

    store:
    | "blinkit"
    | "zepto"
    | "instamart"
    | "amazon"
    | "flipkart"
    | "croma"
    | "relianceDigital";

    deliveryTime?: string;

    badge?: string;

    wishlist?: boolean;

    verified?: boolean;

    onWishlist?: () => void;

    onCompare?: () => void;

    onView?: () => void;

    className?: string;
}

export default function ProductCard({
    image,
    brand,
    title,
    rating,
    reviews,
    price,
    originalPrice,
    store,
    deliveryTime,
    badge,
    wishlist = false,
    verified = false,
    onWishlist,
    onCompare,
    onView,
    className,
}: ProductCardProps) {
    return (
        <Card
            variant="product"
            padding={false}
            className={cn(
                "group overflow-hidden",
                className
            )}
        >
            <div className="relative">

                {badge && (
                    <div className="absolute left-5 top-5 z-20">
                        <Badge variant="gradient">
                            {badge}
                        </Badge>
                    </div>
                )}

                <button
                    onClick={onWishlist}
                    className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:scale-110"
                >
                    <Heart
                        size={20}
                        className={cn(
                            wishlist
                                ? "fill-red-500 text-red-500"
                                : "text-slate-600"
                        )}
                    />
                </button>

                <div className="overflow-hidden rounded-t-[32px] bg-gradient-to-br from-slate-100 via-white to-fuchsia-50">

                    <img
                        src={image}
                        alt={title}
                        className="mx-auto h-72 object-contain p-8 transition duration-500 group-hover:scale-110"
                    />

                </div>

            </div>

            <div className="space-y-5 p-6">

                <div>

                    <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-600">
                        {brand}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-7 text-slate-900">
                        {title}
                    </h3>

                </div>

                <Rating
                    value={rating}
                    reviews={reviews}
                />

                <PriceTag
                    price={price}
                    originalPrice={originalPrice}
                />

                <StoreBadge
                    store={store}
                    deliveryTime={deliveryTime}
                    verified={verified}
                />

                <div className="flex gap-3 pt-2">

                    <Button
                        fullWidth
                        leftIcon={
                            <ArrowRightLeft
                                size={18}
                            />
                        }
                        onClick={onCompare}
                    >
                        Compare
                    </Button>

                    <Button
                        variant="outline"
                        leftIcon={
                            <Eye size={18} />
                        }
                        onClick={onView}
                    >
                        View
                    </Button>

                </div>

            </div>
        </Card>
    );
}
