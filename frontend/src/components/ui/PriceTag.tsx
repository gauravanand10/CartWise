import { cn } from "../../lib/cn";

type PriceSize =
    | "sm"
    | "md"
    | "lg";

interface PriceTagProps {
    price: number;
    originalPrice?: number;
    currency?: string;
    size?: PriceSize;
    highlight?: boolean;
    className?: string;
}

const priceSize: Record<PriceSize, string> = {
    sm: "text-lg",

    md: "text-2xl",

    lg: "text-4xl",
};

const oldPriceSize: Record<PriceSize, string> = {
    sm: "text-sm",

    md: "text-base",

    lg: "text-xl",
};

export default function PriceTag({
    price,
    originalPrice,
    currency = "₹",
    size = "md",
    highlight = false,
    className,
}: PriceTagProps) {
    const hasDiscount =
        originalPrice !== undefined &&
        originalPrice > price;

    const discount = hasDiscount
        ? Math.round(
            ((originalPrice - price) /
                originalPrice) *
            100
        )
        : 0;

    return (
        <div
            className={cn(
                "flex flex-wrap items-center gap-3",
                className
            )}
        >
            <span
                className={cn(
                    "font-black tracking-tight text-slate-900",
                    priceSize[size],
                    highlight &&
                    "bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent"
                )}
            >
                {currency}
                {price.toLocaleString()}
            </span>

            {hasDiscount && (
                <>
                    <span
                        className={cn(
                            "font-medium text-slate-400 line-through",
                            oldPriceSize[size]
                        )}
                    >
                        {currency}
                        {originalPrice.toLocaleString()}
                    </span>

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                        {discount}% OFF
                    </span>
                </>
            )}
        </div>
    );
}
