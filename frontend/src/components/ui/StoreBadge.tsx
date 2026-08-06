import { Clock3, ShieldCheck } from "lucide-react";

import { cn } from "../../lib/cn";

type Store =
    | "blinkit"
    | "zepto"
    | "instamart"
    | "amazon"
    | "flipkart"
    | "croma"
    | "relianceDigital";

interface StoreBadgeProps {
    store: Store;
    deliveryTime?: string;
    verified?: boolean;
    className?: string;
}

const storeStyles: Record<Store, string> = {
    blinkit:
        "bg-yellow-400 text-slate-900 border-yellow-400 font-black",

    zepto:
        "bg-violet-600 text-white border-violet-600",

    instamart:
        "bg-orange-500 text-white border-orange-500",

    amazon:
        "bg-slate-900 text-white border-slate-900",

    flipkart:
        "bg-blue-600 text-white border-blue-600",

    croma:
        "bg-cyan-500 text-white border-cyan-500",

    relianceDigital:
        "bg-rose-600 text-white border-rose-600",
};

const storeNames: Record<Store, string> = {
    blinkit: "Blinkit",
    zepto: "Zepto",
    instamart: "Instamart",
    amazon: "Amazon",
    flipkart: "Flipkart",
    croma: "Croma",
    relianceDigital: "Reliance Digital",
};

export default function StoreBadge({
    store,
    deliveryTime,
    verified = false,
    className,
}: StoreBadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm",
                storeStyles[store],
                className
            )}
        >
            <span>{storeNames[store]}</span>

            {deliveryTime && (
                <>
                    <span className="opacity-30">•</span>

                    <span className="flex items-center gap-1 text-xs">
                        <Clock3 size={14} />
                        {deliveryTime}
                    </span>
                </>
            )}

            {verified && (
                <ShieldCheck
                    size={16}
                    className="text-emerald-500"
                />
            )}
        </div>
    );
}
