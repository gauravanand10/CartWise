import {
    Brain,
    ShieldCheck,
    Smartphone,
    Sparkles,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

const softwareData = [
    {
        title: "Operating System",
        icon: <Smartphone size={22} />,
        left: "iOS 26",
        right: "Android 16 (One UI 8)",
        winner: "draw",
    },
    {
        title: "AI Features",
        icon: <Brain size={22} />,
        left: "Apple Intelligence",
        right: "Galaxy AI",
        winner: "right",
    },
    {
        title: "Software Updates",
        icon: <ShieldCheck size={22} />,
        left: "6+ Years",
        right: "7 Years",
        winner: "right",
    },
    {
        title: "Customization",
        icon: <Sparkles size={22} />,
        left: "Limited",
        right: "Extensive",
        winner: "right",
    },
];

export default function SoftwareComparison() {
    return (
        <section className="mt-24">

            <div className="mb-12 text-center">

                <Badge variant="primary">
                    Software Experience
                </Badge>

                <h2 className="mt-5 text-4xl font-black">

                    Software & AI Features

                </h2>

                <p className="mt-4 text-lg text-slate-500">

                    Compare operating systems, AI capabilities,
                    long-term software support and customization.

                </p>

            </div>

            <div className="space-y-6">

                {softwareData.map((item) => (

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

                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-600">

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

            <Card className="mt-10 rounded-[32px] bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 p-10 text-white">

                <h3 className="text-3xl font-black">

                    AI Software Verdict

                </h3>

                <p className="mt-6 text-lg leading-8 text-violet-100">

                    Samsung's Galaxy AI currently provides a broader
                    collection of productivity, translation,
                    summarization and image-editing tools.

                    Apple's ecosystem remains unmatched for users
                    invested in Macs, iPads and Apple Watches,
                    delivering excellent continuity and long-term
                    stability.

                </p>

            </Card>

        </section>
    );
}
