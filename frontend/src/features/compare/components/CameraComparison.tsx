import {
    Aperture,
    Camera,
    CheckCircle2,
    Moon,
    Video,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

const cameraFeatures = [
    {
        title: "Main Camera",
        left: "48 MP",
        right: "200 MP",
        winner: "right",
        icon: <Camera size={22} />,
    },
    {
        title: "Ultra Wide",
        left: "48 MP",
        right: "50 MP",
        winner: "right",
        icon: <Aperture size={22} />,
    },
    {
        title: "Night Photography",
        left: "Excellent",
        right: "Outstanding",
        winner: "right",
        icon: <Moon size={22} />,
    },
    {
        title: "Video Recording",
        left: "4K Dolby Vision",
        right: "8K UHD",
        winner: "right",
        icon: <Video size={22} />,
    },
];

export default function CameraComparison() {
    return (
        <section className="mt-24">

            <div className="mb-12 text-center">

                <Badge variant="primary">
                    Camera Comparison
                </Badge>

                <h2 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-black">

                    Photography & Videography

                </h2>

                <p className="mt-4 text-lg text-slate-500">

                    Compare every important camera capability.

                </p>

            </div>

            <div className="grid gap-8">

                {cameraFeatures.map((feature) => (

                    <Card
                        key={feature.title}
                        className="rounded-[30px] p-8"
                    >

                        <div className="grid grid-cols-2 items-center gap-x-4 gap-y-3 sm:gap-x-6 lg:grid-cols-[1fr_220px_1fr] lg:gap-8">

                            <div>

                                <h3 className="text-base font-black break-words sm:text-xl lg:text-2xl">

                                    {feature.left}

                                </h3>

                            </div>

                            <div className="order-first col-span-2 text-center lg:order-none lg:col-span-1">

                                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-fuchsia-100 text-fuchsia-600 lg:mb-4 lg:h-16 lg:w-16">

                                    {feature.icon}

                                </div>

                                <p className="font-bold">

                                    {feature.title}

                                </p>

                            </div>

                            <div className="text-right">

                                <div className="flex items-center justify-end gap-3">

                                    {feature.winner === "right" && (

                                        <CheckCircle2
                                            size={20}
                                            className="text-emerald-600"
                                        />

                                    )}

                                    <h3 className="text-base font-black break-words text-emerald-600 sm:text-xl lg:text-2xl">

                                        {feature.right}

                                    </h3>

                                </div>

                            </div>

                        </div>

                    </Card>

                ))}

            </div>

            <Card className="mt-10 rounded-[32px] bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 p-5 sm:p-8 lg:p-10 text-white">

                <h3 className="text-lg font-black break-words sm:text-2xl lg:text-3xl">

                    AI Camera Verdict

                </h3>

                <p className="mt-5 text-lg leading-8 text-fuchsia-100">

                    Samsung Galaxy S25 Ultra provides greater hardware
                    flexibility with its 200 MP primary sensor,
                    versatile zoom system and excellent low-light
                    photography.

                    The iPhone 16 Pro still leads in video consistency,
                    color science and computational photography,
                    making it the preferred choice for professional
                    content creators.

                </p>

            </Card>

        </section>
    );
}
