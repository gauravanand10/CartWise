import {
    Brain,
    CheckCircle2,
    Sparkles,
    TrendingUp,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

import { compareData } from "../data/compareData";

export default function AISummary() {
    const {
        leftProduct,
        rightProduct,
        confidence,
        winner,
        summary,
    } = compareData;

    const winnerProduct =
        winner === "left"
            ? leftProduct
            : rightProduct;

    return (
        <section className="mt-20">

            <Card className="overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-12 text-white">

                <div className="grid gap-12 lg:grid-cols-[1.3fr_420px]">

                    <div>

                        <Badge variant="primary">
                            <Brain size={14} />
                            AI Recommendation
                        </Badge>

                        <h2 className="mt-6 text-5xl font-black leading-tight">
                            Why did AI choose{" "}
                            <span className="text-fuchsia-400">
                                {winnerProduct.name}
                            </span>
                            ?
                        </h2>

                        <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-300">
                            {summary}
                        </p>

                        <div className="mt-10 space-y-5">

                            <div className="flex items-start gap-4">

                                <CheckCircle2
                                    size={24}
                                    className="mt-1 text-emerald-400"
                                />

                                <div>

                                    <h3 className="font-bold text-xl">
                                        Better Overall Performance
                                    </h3>

                                    <p className="mt-2 text-slate-300">
                                        AI benchmark analysis indicates
                                        superior CPU and GPU performance
                                        under sustained workloads.
                                    </p>

                                </div>

                            </div>

                            <div className="flex items-start gap-4">

                                <CheckCircle2
                                    size={24}
                                    className="mt-1 text-emerald-400"
                                />

                                <div>

                                    <h3 className="font-bold text-xl">
                                        Better Long-Term Value
                                    </h3>

                                    <p className="mt-2 text-slate-300">
                                        Pricing, features and hardware
                                        collectively provide stronger
                                        value for money.
                                    </p>

                                </div>

                            </div>

                            <div className="flex items-start gap-4">

                                <CheckCircle2
                                    size={24}
                                    className="mt-1 text-emerald-400"
                                />

                                <div>

                                    <h3 className="font-bold text-xl">
                                        Superior Battery Life
                                    </h3>

                                    <p className="mt-2 text-slate-300">
                                        Larger battery capacity and
                                        better endurance across
                                        productivity, gaming and media
                                        usage.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                    <div>

                        <Card className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white backdrop-blur-xl">

                            <div className="flex items-center gap-3">

                                <Sparkles className="text-fuchsia-400" />

                                <h3 className="text-2xl font-black">
                                    AI Confidence
                                </h3>

                            </div>

                            <div className="mt-10">

                                <div className="flex items-end gap-3">

                                    <span className="text-6xl font-black">
                                        {confidence}
                                    </span>

                                    <span className="mb-2 text-3xl font-bold">
                                        %
                                    </span>

                                </div>

                                <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/10">

                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-all duration-1000"
                                        style={{
                                            width: `${confidence}%`,
                                        }}
                                    />

                                </div>

                            </div>

                            <div className="mt-10 rounded-2xl bg-white/5 p-5">

                                <div className="flex items-center gap-3">

                                    <TrendingUp
                                        size={22}
                                        className="text-emerald-400"
                                    />

                                    <span className="font-semibold">
                                        Winning Score
                                    </span>

                                </div>

                                <div className="mt-5 flex items-center justify-between">

                                    <span>
                                        {winnerProduct.name}
                                    </span>

                                    <span className="text-3xl font-black text-emerald-400">
                                        {
                                            winnerProduct.score
                                                .overall
                                        }
                                        /100
                                    </span>

                                </div>

                            </div>

                            <div className="mt-8 rounded-2xl bg-fuchsia-500/10 p-5">

                                <h4 className="font-bold">
                                    AI Verdict
                                </h4>

                                <p className="mt-3 text-slate-300 leading-7">
                                    Recommended for users looking for
                                    the strongest overall flagship
                                    smartphone experience today.
                                </p>

                            </div>

                        </Card>

                    </div>

                </div>

            </Card>

        </section>
    );
}
