import { ShoppingCart, Trophy } from "lucide-react";

import Button from "../../../components/ui/Button";
import SafeImage from "../../../components/ui/SafeImage";

import { compareData } from "../data/compareData";

/** Shared frame for the two thumbnails flanking the VS badge. */
const THUMB_FRAME =
    "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100";

export default function StickyCompareBar() {
    const { leftProduct, rightProduct, winner } = compareData;

    return (
        <div className="sticky top-0 z-50 mb-10 rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl shadow-xl">

            <div className="flex items-center justify-between px-8 py-5">

                <div className="flex items-center gap-6">

                    <SafeImage
                        src={leftProduct.image}
                        alt={leftProduct.name}
                        className={THUMB_FRAME}
                        imgClassName="h-full w-full object-contain p-2"
                        iconClassName="h-7 w-7 text-slate-400"
                    />

                    <div>

                        <h3 className="font-bold text-slate-900">
                            {leftProduct.name}
                        </h3>

                        <p className="text-sm text-slate-500">
                            ₹{leftProduct.price.toLocaleString()}
                        </p>

                    </div>

                </div>

                <div className="flex flex-col items-center">

                    <div className="rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-5 py-2 text-sm font-bold text-white">

                        VS

                    </div>

                    <div className="mt-2 flex items-center gap-2">

                        <Trophy
                            size={16}
                            className="text-yellow-500"
                        />

                        <span className="text-sm font-semibold text-slate-600">

                            AI Winner

                        </span>

                    </div>

                </div>

                <div className="flex items-center gap-6">

                    <div className="text-right">

                        <h3 className="font-bold text-slate-900">
                            {rightProduct.name}
                        </h3>

                        <p className="text-sm text-slate-500">
                            ₹{rightProduct.price.toLocaleString()}
                        </p>

                    </div>

                    <SafeImage
                        src={rightProduct.image}
                        alt={rightProduct.name}
                        className={THUMB_FRAME}
                        imgClassName="h-full w-full object-contain p-2"
                        iconClassName="h-7 w-7 text-slate-400"
                    />

                </div>

            </div>

            <div className="grid grid-cols-2 border-t">

                <Button
                    className={`rounded-none rounded-bl-3xl ${winner === "left"
                            ? "bg-emerald-600"
                            : ""
                        }`}
                    leftIcon={<ShoppingCart size={18} />}
                >
                    Buy {leftProduct.brand}
                </Button>

                <Button
                    className={`rounded-none rounded-br-3xl ${winner === "right"
                            ? "bg-emerald-600"
                            : ""
                        }`}
                    leftIcon={<ShoppingCart size={18} />}
                >
                    Buy {rightProduct.brand}
                </Button>

            </div>

        </div>
    );
}
