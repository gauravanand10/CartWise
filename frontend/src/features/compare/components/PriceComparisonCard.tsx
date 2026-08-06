import {
    Clock3,
    ExternalLink,
    PackageCheck,
} from "lucide-react";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

import type { StorePrice } from "../types/compare";

interface PriceComparisonCardProps {
    title: string;

    stores: StorePrice[];
}

export default function PriceComparisonCard({
    title,
    stores,
}: PriceComparisonCardProps) {

    const lowestPrice = Math.min(
        ...stores.map((store) => store.price)
    );

    return (

        <Card className="rounded-[32px] p-8">

            <div className="mb-8 flex items-center justify-between">

                <div>

                    <h3 className="text-2xl font-black">
                        {title}
                    </h3>

                    <p className="mt-2 text-slate-500">
                        Compare offers across retailers
                    </p>

                </div>

                <div className="rounded-2xl bg-emerald-50 px-5 py-3">

                    <p className="text-xs font-semibold uppercase text-emerald-600">
                        Lowest Price
                    </p>

                    <p className="mt-1 text-2xl font-black text-emerald-600">
                        ₹{lowestPrice.toLocaleString()}
                    </p>

                </div>

            </div>

            <div className="space-y-5">

                {stores.map((store) => {

                    const isLowest =
                        store.price === lowestPrice;

                    return (

                        <div
                            key={store.store}
                            className={`rounded-2xl border p-5 transition-all duration-300 ${
                                isLowest
                                    ? "border-emerald-500 bg-emerald-50"
                                    : "border-slate-200 hover:border-fuchsia-500"
                            }`}
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <h4 className="font-bold">
                                        {store.store}
                                    </h4>

                                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">

                                        <span className="flex items-center gap-2">

                                            <Clock3 size={15} />

                                            {store.delivery}

                                        </span>

                                        <span className="flex items-center gap-2">

                                            <PackageCheck size={15} />

                                            {store.availability}

                                        </span>

                                    </div>

                                </div>

                                <div className="text-right">

                                    <p className="text-2xl font-black text-fuchsia-600">
                                        ₹{store.price.toLocaleString()}
                                    </p>

                                    {isLowest && (

                                        <span className="mt-2 inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">

                                            Best Deal

                                        </span>

                                    )}

                                </div>

                            </div>

                            <Button
                                className="mt-5 w-full"
                                variant="outline"
                                rightIcon={<ExternalLink size={16} />}
                            >
                                Visit Store
                            </Button>

                        </div>

                    );

                })}

            </div>

        </Card>

    );

}
