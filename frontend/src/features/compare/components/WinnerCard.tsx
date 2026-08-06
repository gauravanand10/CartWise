import {
    ArrowRight,
    Award,
    Brain,
    CheckCircle2,
    Sparkles,
    Star,
    Trophy,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

const reasons = [
    "Best overall performance",
    "Excellent display quality",
    "Long battery life",
    "Better value for money",
];

export default function WinnerCard() {
    return (
        <section className="mt-16">

            <Card className="overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-12 text-white">

                <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">

                    <div>

                        <Badge variant="primary">
                            <Sparkles size={14} />
                            AI Recommendation
                        </Badge>

                        <h2 className="mt-6 text-5xl font-black leading-tight">
                            Overall Winner
                        </h2>

                        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                            After analyzing specifications, pricing,
                            camera, battery, display, performance and
                            software experience, CartWise recommends
                            the following product.
                        </p>

                        <div className="mt-10 flex items-center gap-6">

                            <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white/10 text-6xl backdrop-blur">
                                🤖
                            </div>

                            <div>

                                <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300">
                                    Winner
                                </p>

                                <h3 className="mt-2 text-4xl font-black">
                                    Samsung Galaxy S25 Ultra
                                </h3>

                                <p className="mt-3 text-lg text-slate-300">
                                    Overall Score
                                </p>

                                <div className="mt-2 flex items-center gap-3">

                                    <Star
                                        size={24}
                                        className="fill-yellow-400 text-yellow-400"
                                    />

                                    <span className="text-3xl font-black">
                                        9.6 / 10
                                    </span>

                                </div>

                            </div>

                        </div>

                        <div className="mt-10 grid gap-5 md:grid-cols-2">

                            {reasons.map((reason) => (

                                <div
                                    key={reason}
                                    className="flex items-center gap-3 rounded-2xl bg-white/5 p-4"
                                >

                                    <CheckCircle2
                                        size={22}
                                        className="text-emerald-400"
                                    />

                                    <span className="font-medium">
                                        {reason}
                                    </span>

                                </div>

                            ))}

                        </div>

                        <div className="mt-10 flex flex-wrap gap-4">

                            <Button
                                size="lg"
                                leftIcon={<ArrowRight size={18} />}
                            >
                                View Product
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                leftIcon={<Award size={18} />}
                            >
                                Full Analysis
                            </Button>

                        </div>

                    </div>

                    <div className="flex items-center justify-center">

                        <div className="relative">

                            <div className="absolute inset-0 rounded-full bg-fuchsia-500/20 blur-3xl" />

                            <div className="relative flex h-[360px] w-[320px] flex-col items-center justify-center rounded-[36px] border border-white/10 bg-white/10 p-8 backdrop-blur-xl">

                                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">

                                    <Trophy
                                        size={60}
                                        className="text-white"
                                    />

                                </div>

                                <h3 className="mt-8 text-center text-3xl font-black">
                                    AI Winner
                                </h3>

                                <p className="mt-3 text-center text-slate-300">
                                    Samsung Galaxy S25 Ultra
                                </p>

                                <div className="mt-8 flex items-center gap-3 rounded-full bg-emerald-500/20 px-5 py-3 text-emerald-300">

                                    <Brain size={20} />

                                    <span className="font-semibold">
                                        96% Confidence
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </Card>

        </section>
    );
}
