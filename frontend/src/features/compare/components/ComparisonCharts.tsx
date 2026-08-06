import {
    BarChart3,
    Battery,
    Camera,
    Cpu,
    IndianRupee,
    MonitorSmartphone,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

import { compareData } from "../data/compareData";

const chartItems = [
    {
        title: "Performance",
        icon: <Cpu size={20} />,
        left: compareData.leftProduct.score.performance,
        right: compareData.rightProduct.score.performance,
    },
    {
        title: "Camera",
        icon: <Camera size={20} />,
        left: compareData.leftProduct.score.camera,
        right: compareData.rightProduct.score.camera,
    },
    {
        title: "Battery",
        icon: <Battery size={20} />,
        left: compareData.leftProduct.score.battery,
        right: compareData.rightProduct.score.battery,
    },
    {
        title: "Display",
        icon: <MonitorSmartphone size={20} />,
        left: compareData.leftProduct.score.display,
        right: compareData.rightProduct.score.display,
    },
    {
        title: "Value",
        icon: <IndianRupee size={20} />,
        left: compareData.leftProduct.score.value,
        right: compareData.rightProduct.score.value,
    },
];

export default function ComparisonCharts() {
    return (
        <section className="mt-20">

            <div className="mb-12 text-center">

                <Badge variant="primary">
                    Performance Analytics
                </Badge>

                <h2 className="mt-5 text-4xl font-black text-slate-900">
                    Visual Score Comparison
                </h2>

                <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-500">
                    Compare every category visually to understand where
                    each product performs better.
                </p>

            </div>

            <div className="grid gap-8 xl:grid-cols-2">

                <Card className="rounded-[36px] p-10">

                    <div className="mb-8 flex items-center gap-4">

                        <div className="rounded-2xl bg-fuchsia-100 p-4 text-fuchsia-600">

                            <BarChart3 size={24} />

                        </div>

                        <div>

                            <h3 className="text-2xl font-black">
                                Score Distribution
                            </h3>

                            <p className="text-slate-500">
                                AI generated comparison
                            </p>

                        </div>

                    </div>

                    <div className="space-y-8">

                        {chartItems.map((item) => (

                            <div key={item.title}>

                                <div className="mb-3 flex items-center justify-between">

                                    <div className="flex items-center gap-3">

                                        <div className="text-fuchsia-600">
                                            {item.icon}
                                        </div>

                                        <span className="font-semibold">
                                            {item.title}
                                        </span>

                                    </div>

                                    <div className="flex gap-6 text-sm font-semibold">

                                        <span>
                                            {item.left}
                                        </span>

                                        <span>
                                            {item.right}
                                        </span>

                                    </div>

                                </div>

                                <div className="grid grid-cols-2 gap-3">

                                    <div className="h-4 overflow-hidden rounded-full bg-slate-200">

                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition-all duration-1000"
                                            style={{
                                                width: `${item.left}%`,
                                            }}
                                        />

                                    </div>

                                    <div className="h-4 overflow-hidden rounded-full bg-slate-200">

                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-1000"
                                            style={{
                                                width: `${item.right}%`,
                                            }}
                                        />

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </Card>

                <Card className="rounded-[36px] p-10">

                    <h3 className="text-2xl font-black">
                        Overall Analysis
                    </h3>

                    <div className="mt-10 flex justify-center">

                        <div className="relative flex h-72 w-72 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-100 via-violet-100 to-pink-100">

                            <div className="flex h-48 w-48 flex-col items-center justify-center rounded-full bg-white shadow-xl">

                                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                                    Winner
                                </p>

                                <h2 className="mt-4 text-center text-3xl font-black">
                                    {compareData.rightProduct.brand}
                                </h2>

                                <span className="mt-3 text-6xl font-black text-fuchsia-600">
                                    {compareData.rightProduct.score.overall}
                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-5">

                        <div className="rounded-3xl bg-fuchsia-50 p-6 text-center">

                            <p className="text-sm text-slate-500">
                                Price Difference
                            </p>

                            <h3 className="mt-2 text-3xl font-black text-fuchsia-600">
                                ₹
                                {(
                                    compareData.leftProduct.price -
                                    compareData.rightProduct.price
                                ).toLocaleString()}
                            </h3>

                        </div>

                        <div className="rounded-3xl bg-emerald-50 p-6 text-center">

                            <p className="text-sm text-slate-500">
                                AI Confidence
                            </p>

                            <h3 className="mt-2 text-3xl font-black text-emerald-600">
                                {compareData.confidence}%
                            </h3>

                        </div>

                    </div>

                </Card>

            </div>

        </section>
    );
}
