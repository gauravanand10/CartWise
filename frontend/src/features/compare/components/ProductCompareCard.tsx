import {
    ArrowRight,
    Star,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import SafeImage from "../../../components/ui/SafeImage";

import type { CompareProduct } from "../types/compare";

interface ProductCompareCardProps {
    product: CompareProduct;

    highlight?: boolean;

    badge?: string;
}

export default function ProductCompareCard({
    product,
    highlight = false,
    badge,
}: ProductCompareCardProps) {
    return (
        <Card
            className={`relative overflow-hidden rounded-[32px] p-8 transition-all duration-300 ${highlight
                    ? "border-2 border-fuchsia-600 shadow-2xl"
                    : "border border-slate-200 hover:shadow-xl"
                }`}
        >
            {badge && (
                <div className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white">
                    {badge}
                </div>
            )}

            <div className="flex justify-center">

                <SafeImage
                    src={product.image}
                    alt={product.name}
                    className="flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50"
                    imgClassName="h-full w-full object-contain p-4 transition-transform duration-500 hover:scale-105"
                    iconClassName="h-16 w-16 text-slate-300"
                />

            </div>

            <div className="mt-8 text-center">

                <p className="text-sm font-semibold uppercase tracking-wider text-fuchsia-600">
                    {product.brand}
                </p>

                <h2 className="mt-2 text-3xl font-black text-slate-900">
                    {product.name}
                </h2>

            </div>

            <div className="mt-6 flex items-center justify-center gap-2">

                <Star
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                />

                <span className="font-bold">
                    {product.rating}
                </span>

                <span className="text-slate-500">
                    ({product.reviews.toLocaleString()} Reviews)
                </span>

            </div>

            <div className="mt-8 text-center">

                <p className="text-sm text-slate-500">
                    Starting From
                </p>

                <h3 className="mt-2 text-4xl font-black text-fuchsia-600">
                    ₹{product.price.toLocaleString()}
                </h3>

                <p className="mt-2 text-lg text-slate-400 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                </p>

            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">

                <div className="rounded-2xl bg-slate-50 p-5 text-center">

                    <p className="text-sm text-slate-500">
                        Overall
                    </p>

                    <h3 className="mt-2 text-3xl font-black text-emerald-600">
                        {product.score.overall}
                    </h3>

                </div>

                <div className="rounded-2xl bg-slate-50 p-5 text-center">

                    <p className="text-sm text-slate-500">
                        Camera
                    </p>

                    <h3 className="mt-2 text-3xl font-black text-fuchsia-600">
                        {product.score.camera}
                    </h3>

                </div>

            </div>

            <Button
                className="mt-10 w-full"
                size="lg"
                rightIcon={<ArrowRight size={18} />}
            >
                View Product
            </Button>

        </Card>
    );
}
