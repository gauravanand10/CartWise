import {
    Award,
    BatteryCharging,
    Camera,
    CheckCircle2,
    Cpu,
    DollarSign,
    Gamepad2,
    Sparkles,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

const verdicts = [
    {
        title: "Best Overall",
        icon: <Award size={22} />,
        winner: "Samsung Galaxy S25 Ultra",
        reason: "Excellent balance of performance, display, camera and battery.",
    },
    {
        title: "Best Camera",
        icon: <Camera size={22} />,
        winner: "Samsung Galaxy S25 Ultra",
        reason: "Versatile camera system with excellent zoom capabilities.",
    },
    {
        title: "Best Performance",
        icon: <Cpu size={22} />,
        winner: "Samsung Galaxy S25 Ultra",
        reason: "Higher benchmark scores and sustained performance.",
    },
    {
        title: "Best Battery",
        icon: <BatteryCharging size={22} />,
        winner: "Samsung Galaxy S25 Ultra",
        reason: "Longer battery life with faster charging.",
    },
    {
        title: "Best Value",
        icon: <DollarSign size={22} />,
        winner: "Samsung Galaxy S25 Ultra",
        reason: "Offers more flagship features at a competitive price.",
    },
    {
        title: "Best For Gaming",
        icon: <Gamepad2 size={22} />,
        winner: "Samsung Galaxy S25 Ultra",
        reason: "Higher GPU performance and larger cooling system.",
    },
];

export default function FinalVerdict() {
    return (
        <section className="mt-24">

            <div className="mb-12 text-center">

                <Badge variant="primary">
                    Final Verdict
                </Badge>

                <h2 className="mt-5 text-5xl font-black">

                    Which Phone Should You Buy?

                </h2>

                <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-500">

                    Our AI combines specifications, benchmark scores,
                    expert opinions and user reviews to provide the
                    final recommendation.

                </p>

            </div>

            <div className="grid gap-8 lg:grid-cols-2">

                {verdicts.map((item) => (

                    <Card
                        key={item.title}
                        className="rounded-[32px] p-8 transition hover:-translate-y-1 hover:shadow-xl"
                    >

                        <div className="flex items-start gap-5">

                            <div className="rounded-2xl bg-fuchsia-100 p-4 text-fuchsia-600">

                                {item.icon}

                            </div>

                            <div className="flex-1">

                                <h3 className="text-2xl font-black">

                                    {item.title}

                                </h3>

                                <div className="mt-4 flex items-center gap-3">

                                    <CheckCircle2
                                        size={22}
                                        className="text-emerald-600"
                                    />

                                    <span className="text-xl font-bold text-emerald-600">

                                        {item.winner}

                                    </span>

                                </div>

                                <p className="mt-4 leading-7 text-slate-600">

                                    {item.reason}

                                </p>

                            </div>

                        </div>

                    </Card>

                ))}

            </div>

            <Card className="mt-12 rounded-[36px] bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-700 p-12 text-white">

                <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">

                    <div>

                        <Badge variant="secondary">
                            AI Recommendation
                        </Badge>

                        <h2 className="mt-6 text-5xl font-black">

                            Samsung Galaxy S25 Ultra

                        </h2>

                        <p className="mt-6 max-w-4xl text-xl leading-9 text-fuchsia-100">

                            The Galaxy S25 Ultra is our overall recommendation
                            because it consistently leads in battery life,
                            display quality, performance, charging speed,
                            AI features and overall value.

                            If your priority is professional video recording,
                            tight ecosystem integration and long-term iOS
                            experience, the iPhone 16 Pro remains an
                            outstanding alternative.

                        </p>

                    </div>

                    <div className="space-y-4">

                        <Button
                            size="lg"
                            className="w-full"
                        >
                            Buy Samsung
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full border-white text-white hover:bg-white hover:text-slate-900"
                        >
                            Compare Again
                        </Button>

                    </div>

                </div>

            </Card>

            <Card className="mt-10 rounded-[30px] p-10">

                <div className="flex items-center gap-4">

                    <Sparkles
                        size={26}
                        className="text-violet-600"
                    />

                    <h3 className="text-3xl font-black">

                        AI Confidence

                    </h3>

                </div>

                <div className="mt-8">

                    <div className="h-5 overflow-hidden rounded-full bg-slate-200">

                        <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-fuchsia-600"
                            style={{
                                width: "96%",
                            }}
                        />

                    </div>

                    <div className="mt-4 flex justify-between">

                        <span className="text-slate-500">

                            Recommendation Confidence

                        </span>

                        <span className="text-2xl font-black text-emerald-600">

                            96%

                        </span>

                    </div>

                </div>

            </Card>

        </section>
    );
}
