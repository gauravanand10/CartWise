import {
    Brain,
    Cpu,
    Gamepad2,
    Gauge,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

const benchmarks = [
    {
        title: "AnTuTu v10",
        icon: <Gauge size={22} />,
        left: 1812000,
        right: 2325000,
    },
    {
        title: "Geekbench Multi-Core",
        icon: <Cpu size={22} />,
        left: 8450,
        right: 10320,
    },
    {
        title: "AI Benchmark",
        icon: <Brain size={22} />,
        left: 89,
        right: 97,
    },
    {
        title: "Gaming Score",
        icon: <Gamepad2 size={22} />,
        left: 91,
        right: 98,
    },
];

export default function BenchmarkComparison() {
    return (
        <section className="mt-24">

            <div className="mb-12 text-center">

                <Badge variant="primary">
                    Performance Benchmarks
                </Badge>

                <h2 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-black">

                    Real World Performance

                </h2>

                <p className="mt-4 text-lg text-slate-500">

                    Compare benchmark scores from industry standard tests.

                </p>

            </div>

            <div className="grid gap-8">

                {benchmarks.map((benchmark) => {

                    const max = Math.max(
                        benchmark.left,
                        benchmark.right
                    );

                    return (

                        <Card
                            key={benchmark.title}
                            className="rounded-[30px] p-8"
                        >

                            <div className="mb-6 flex items-center gap-4">

                                <div className="rounded-xl bg-fuchsia-100 p-3 text-fuchsia-600">

                                    {benchmark.icon}

                                </div>

                                <h3 className="text-base font-black break-words sm:text-xl lg:text-2xl">

                                    {benchmark.title}

                                </h3>

                            </div>

                            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] items-center gap-3 sm:gap-6 lg:grid-cols-[120px_1fr_120px]">

                                <div className="text-center">

                                    <p className="text-base font-black break-words sm:text-xl lg:text-2xl">

                                        {benchmark.left.toLocaleString()}

                                    </p>

                                </div>

                                <div>

                                    <div className="mb-3 grid grid-cols-2 gap-4">

                                        <div className="h-5 overflow-hidden rounded-full bg-slate-200">

                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600"
                                                style={{
                                                    width: `${benchmark.left /
                                                        max *
                                                        100
                                                        }%`,
                                                }}
                                            />

                                        </div>

                                        <div className="h-5 overflow-hidden rounded-full bg-slate-200">

                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                                                style={{
                                                    width: `${benchmark.right /
                                                        max *
                                                        100
                                                        }%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                </div>

                                <div className="text-center">

                                    <p className="text-base font-black break-words text-emerald-600 sm:text-xl lg:text-2xl">

                                        {benchmark.right.toLocaleString()}

                                    </p>

                                </div>

                            </div>

                        </Card>

                    );

                })}

            </div>

        </section>
    );
}
