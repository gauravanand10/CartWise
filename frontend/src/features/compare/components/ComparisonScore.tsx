import {
    Battery,
    Camera,
    Cpu,
    Gauge,
    IndianRupee,
    MonitorSmartphone,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

import { compareData } from "../data/compareData";

const scoreIcons = {
    performance: <Cpu size={20} />,
    camera: <Camera size={20} />,
    battery: <Battery size={20} />,
    display: <MonitorSmartphone size={20} />,
    value: <IndianRupee size={20} />,
    overall: <Gauge size={20} />,
};

const scoreLabels = {
    performance: "Performance",
    camera: "Camera",
    battery: "Battery",
    display: "Display",
    value: "Value",
    overall: "Overall",
};

const scoreKeys = [
    "performance",
    "camera",
    "battery",
    "display",
    "value",
    "overall",
] as const;

export default function ComparisonScore() {
    const left = compareData.leftProduct;
    const right = compareData.rightProduct;

    return (
        <section className="mt-20">

            <div className="mb-12 text-center">

                <Badge variant="primary">
                    AI Score Breakdown
                </Badge>

                <h2 className="mt-5 text-4xl font-black text-slate-900">
                    Category Comparison
                </h2>

                <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-500">
                    Every category is evaluated using specifications,
                    benchmarks, pricing, reviews and AI analysis.
                </p>

            </div>

            <Card className="rounded-[36px] p-10">

                <div className="mb-10 grid grid-cols-[140px_1fr_140px] items-center">

                    <div className="text-center">

                        <h3 className="text-lg font-bold">
                            {left.name}
                        </h3>

                    </div>

                    <div />

                    <div className="text-center">

                        <h3 className="text-lg font-bold">
                            {right.name}
                        </h3>

                    </div>

                </div>

                <div className="space-y-8">

                    {scoreKeys.map((key) => {

                        const leftScore = left.score[key];
                        const rightScore = right.score[key];

                        const winner =
                            leftScore > rightScore
                                ? "left"
                                : rightScore > leftScore
                                    ? "right"
                                    : "draw";

                        return (

                            <div
                                key={key}
                                className="grid grid-cols-[140px_1fr_140px] items-center gap-6"
                            >

                                <div className="text-center">

                                    <p
                                        className={`text-3xl font-black ${winner === "left"
                                                ? "text-emerald-600"
                                                : "text-slate-900"
                                            }`}
                                    >
                                        {leftScore}
                                    </p>

                                </div>

                                <div>

                                    <div className="mb-3 flex items-center justify-center gap-3">

                                        <div className="text-fuchsia-600">
                                            {scoreIcons[key]}
                                        </div>

                                        <span className="font-semibold">
                                            {scoreLabels[key]}
                                        </span>

                                    </div>

                                    <div className="relative h-4 overflow-hidden rounded-full bg-slate-200">

                                        <div
                                            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 transition-all duration-700"
                                            style={{
                                                width: `${Math.max(
                                                    leftScore,
                                                    rightScore
                                                )}%`,
                                            }}
                                        />

                                    </div>

                                </div>

                                <div className="text-center">

                                    <p
                                        className={`text-3xl font-black ${winner === "right"
                                                ? "text-emerald-600"
                                                : "text-slate-900"
                                            }`}
                                    >
                                        {rightScore}
                                    </p>

                                </div>

                            </div>

                        );
                    })}

                </div>

            </Card>

        </section>
    );
}
