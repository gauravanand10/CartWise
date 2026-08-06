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
        <div
            className={`grid grid-cols-[1fr_240px_1fr] items-center ${
                !isLast ? "border-b" : ""
            }`}
        >
            <div
                className={`flex items-center justify-between p-6 transition-all duration-300 ${
                    specification.winner === "left"
                        ? "bg-emerald-50"
                        : ""
                }`}
            >
                <span className="text-lg font-semibold">
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

            <div className="border-x px-6 py-8 text-center">

                <h3 className="font-bold text-slate-800">
                    {specification.label}
                </h3>

            </div>

            <div
                className={`flex items-center justify-between p-6 transition-all duration-300 ${
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

                <span className="text-lg font-semibold">
                    {specification.right}
                </span>
            </div>
        </div>
    );
}
