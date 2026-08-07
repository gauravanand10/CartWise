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
        // z-30, not z-50: the navbar is also `sticky top-0 z-50`, and being
        // later in the DOM this bar was painting *over* the header once stuck.
        <div className="sticky top-0 z-30 mb-10 rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl shadow-xl">

            {/* Stacks on phones. Two products plus a VS badge across one row
                needs ~520px; below that the second product was clipped out of
                the card entirely. */}

            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">

                <div className="flex min-w-0 items-center gap-3 sm:gap-6">

                    <SafeImage
                        src={leftProduct.image}
                        alt={leftProduct.name}
                        className={THUMB_FRAME}
                        imgClassName="h-full w-full object-contain p-2"
                        iconClassName="h-7 w-7 text-slate-400"
                    />

                    <div className="min-w-0">

                        <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                            {leftProduct.name}
                        </h3>

                        <p className="text-xs text-slate-500 sm:text-sm">
                            ₹{leftProduct.price.toLocaleString()}
                        </p>

                    </div>

                </div>

                {/* Horizontal while stacked so the badge and verdict share one
                    compact line instead of eating two rows on a phone. */}

                <div className="flex shrink-0 flex-row items-center justify-center gap-3 sm:flex-col sm:gap-0">

                    <div className="rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-1.5 text-xs font-bold text-white sm:px-5 sm:py-2 sm:text-sm">

                        VS

                    </div>

                    <div className="flex items-center gap-2 sm:mt-2">

                        <Trophy
                            size={16}
                            className="text-yellow-500"
                        />

                        <span className="text-xs font-semibold text-slate-600 sm:text-sm">

                            AI Winner

                        </span>

                    </div>

                </div>

                <div className="flex min-w-0 flex-row-reverse items-center justify-end gap-3 sm:flex-row sm:gap-6">

                    <div className="min-w-0 text-left sm:text-right">

                        <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                            {rightProduct.name}
                        </h3>

                        <p className="text-xs text-slate-500 sm:text-sm">
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
