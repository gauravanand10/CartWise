import {
    Battery,
    BatteryCharging,
    Clock3,
    Zap,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

const batteryData = [
    {
        title: "Battery Capacity",
        icon: <Battery size={22} />,
        left: "3582 mAh",
        right: "5000 mAh",
        winner: "right",
    },
    {
        title: "Wired Charging",
        icon: <BatteryCharging size={22} />,
        left: "27W",
        right: "45W",
        winner: "right",
    },
    {
        title: "Wireless Charging",
        icon: <Zap size={22} />,
        left: "MagSafe 25W",
        right: "Qi2 25W",
        winner: "draw",
    },
    {
        title: "Video Playback",
        icon: <Clock3 size={22} />,
        left: "27 Hours",
        right: "31 Hours",
        winner: "right",
    },
    {
        title: "Gaming Endurance",
        icon: <Battery size={22} />,
        left: "7.5 Hours",
        right: "9.3 Hours",
        winner: "right",
    },
];

export default function BatteryComparison() {
    return (
        <section className="mt-24">

            <div className="mb-12 text-center">

                <Badge variant="primary">
                    Battery Comparison
                </Badge>

                <h2 className="mt-5 text-4xl font-black">
                    Battery & Charging
                </h2>

                <p className="mt-4 text-lg text-slate-500">
                    Compare endurance, charging speeds and real-world battery performance.
                </p>

            </div>

            <div className="space-y-6">

                {batteryData.map((item) => (

                    <Card
                        key={item.title}
                        className="rounded-[30px] p-8"
                    >

                        <div className="grid grid-cols-[1fr_240px_1fr] items-center gap-8">

                            <div>

                                <h3 className="text-3xl font-black">

                                    {item.left}

                                </h3>

                            </div>

                            <div className="text-center">

                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">

                                    {item.icon}

                                </div>

                                <p className="font-bold">

                                    {item.title}

                                </p>

                            </div>

                            <div className="text-right">

                                <h3
                                    className={`text-3xl font-black ${item.winner === "right"
                                            ? "text-emerald-600"
                                            : "text-slate-900"
                                        }`}
                                >
                                    {item.right}
                                </h3>

                            </div>

                        </div>

                    </Card>

                ))}

            </div>

            <Card className="mt-10 rounded-[32px] bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-10 text-white">

                <h3 className="text-3xl font-black">
                    AI Battery Verdict
                </h3>

                <p className="mt-6 text-lg leading-8 text-emerald-100">

                    Samsung Galaxy S25 Ultra clearly leads in battery life,
                    charging speed and overall endurance.
                    Its larger 5000 mAh battery combined with the efficient
                    Snapdragon Elite platform delivers longer gaming,
                    video playback and daily usage.

                    The iPhone 16 Pro remains highly optimized,
                    but its smaller battery capacity limits long-duration usage.

                </p>

            </Card>

        </section>
    );
}
