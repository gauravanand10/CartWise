import {
    Monitor,
    ShieldCheck,
    Sparkles,
    Sun,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

const displayData = [
    {
        title: "Display Size",
        icon: <Monitor size={22} />,
        left: "6.3-inch OLED",
        right: "6.9-inch AMOLED",
        winner: "right",
    },
    {
        title: "Resolution",
        icon: <Sparkles size={22} />,
        left: "2622 × 1206",
        right: "3120 × 1440",
        winner: "right",
    },
    {
        title: "Peak Brightness",
        icon: <Sun size={22} />,
        left: "2000 nits",
        right: "2600 nits",
        winner: "right",
    },
    {
        title: "Refresh Rate",
        icon: <Monitor size={22} />,
        left: "120 Hz ProMotion",
        right: "120 Hz LTPO",
        winner: "draw",
    },
    {
        title: "Protection",
        icon: <ShieldCheck size={22} />,
        left: "Ceramic Shield",
        right: "Gorilla Glass Armor",
        winner: "draw",
    },
];

export default function DisplayComparison() {
    return (
        <section className="mt-24">

            <div className="mb-12 text-center">

                <Badge variant="primary">
                    Display Comparison
                </Badge>

                <h2 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-black">
                    Display & Visual Experience
                </h2>

                <p className="mt-4 text-lg text-slate-500">
                    Compare brightness, resolution, protection and smoothness.
                </p>

            </div>

            <div className="space-y-6">

                {displayData.map((item) => (

                    <Card
                        key={item.title}
                        className="rounded-[30px] p-8"
                    >

                        <div className="grid grid-cols-2 items-center gap-x-4 gap-y-3 sm:gap-x-6 lg:grid-cols-[1fr_240px_1fr] lg:gap-8">

                            <div>

                                <h3 className="text-lg font-black break-words sm:text-2xl lg:text-3xl">

                                    {item.left}

                                </h3>

                            </div>

                            <div className="order-first col-span-2 text-center lg:order-none lg:col-span-1">

                                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 lg:mb-4 lg:h-16 lg:w-16">

                                    {item.icon}

                                </div>

                                <p className="font-bold">

                                    {item.title}

                                </p>

                            </div>

                            <div className="text-right">

                                <h3
                                    className={`text-lg font-black break-words sm:text-2xl lg:text-3xl ${
                                        item.winner === "right"
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

            <Card className="mt-10 rounded-[32px] bg-gradient-to-r from-cyan-600 via-sky-600 to-purple-700 p-5 sm:p-8 lg:p-10 text-white">

                <h3 className="text-lg font-black break-words sm:text-2xl lg:text-3xl">

                    AI Display Verdict

                </h3>

                <p className="mt-6 text-lg leading-8 text-cyan-100">

                    Galaxy S25 Ultra delivers one of the brightest and most
                    immersive smartphone displays available. Its higher
                    resolution and Gorilla Glass Armor provide an excellent
                    viewing experience outdoors.

                    The iPhone 16 Pro continues to excel in color accuracy,
                    HDR playback and display calibration, making it ideal
                    for professional creators and video editing.

                </p>

            </Card>

        </section>
    );
}
