import { Check, Minus } from "lucide-react";

import type { Specification } from "../types/compare";

interface SpecificationRowProps {
    specification: Specification;

    isLast?: boolean;
}

export default function SpecificationRow({
    specification,
    isLast = false,
}: SpecificationRowProps) {
    return (
        // Below `lg` the spec label spans a full row of its own and the two
        // values sit side by side under it. Keeping the 240px centre track on a
        // phone squeezed each value column to well under 50px.
        <div
            className={`grid grid-cols-2 items-center lg:grid-cols-[1fr_240px_1fr] ${
                !isLast ? "border-b" : ""
            }`}
        >
            <div
                className={`order-first col-span-2 border-b px-4 py-2.5 text-center lg:order-none lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:border-x lg:border-b-0 lg:px-6 lg:py-8`}
            >
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 lg:text-base lg:normal-case lg:tracking-normal lg:text-slate-800">
                    {specification.label}
                </h3>
            </div>

            <div
                className={`flex items-center justify-between gap-2 p-4 transition-all duration-300 lg:col-start-1 lg:row-start-1 lg:p-6 ${
                    specification.winner === "left"
                        ? "bg-emerald-50"
                        : ""
                }`}
            >
                <span className="min-w-0 break-words text-sm font-semibold lg:text-lg">
                    {specification.left}
                </span>

                {specification.winner === "left" && (
                    <Check
                        size={20}
                        className="text-emerald-600"
                    />
                )}

                {specification.winner === "draw" && (
                    <Minus
                        size={20}
                        className="text-slate-400"
                    />
                )}
            </div>

            <div
                className={`flex items-center justify-between gap-2 p-4 transition-all duration-300 lg:col-start-3 lg:row-start-1 lg:p-6 ${
                    specification.winner === "right"
                        ? "bg-emerald-50"
                        : ""
                }`}
            >
                {specification.winner === "right" && (
                    <Check
                        size={20}
                        className="text-emerald-600"
                    />
                )}

                {specification.winner === "draw" && (
                    <Minus
                        size={20}
                        className="text-slate-400"
                    />
                )}

                <span className="min-w-0 break-words text-sm font-semibold lg:text-lg">
                    {specification.right}
                </span>
            </div>
        </div>
    );
}
