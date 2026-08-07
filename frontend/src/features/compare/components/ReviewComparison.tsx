import {
    MessageSquare,
    Star,
    ThumbsDown,
    ThumbsUp,
    Users,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

const reviewData = [
    {
        title: "Overall User Rating",
        icon: <Star size={22} />,
        left: "4.8 / 5",
        right: "4.9 / 5",
        winner: "right",
    },
    {
        title: "Expert Rating",
        icon: <MessageSquare size={22} />,
        left: "9.4 / 10",
        right: "9.7 / 10",
        winner: "right",
    },
    {
        title: "Customer Satisfaction",
        icon: <Users size={22} />,
        left: "94%",
        right: "97%",
        winner: "right",
    },
];

const iphonePros = [
    "Outstanding cameras",
    "Excellent video recording",
    "Powerful A18 Pro chip",
    "Premium titanium design",
    "Smooth iOS ecosystem",
];

const iphoneCons = [
    "Premium pricing",
    "Slow charging",
    "Limited customization",
];

const samsungPros = [
    "Excellent display",
    "Outstanding battery",
    "Powerful Galaxy AI",
    "Excellent zoom camera",
    "Great value",
];

const samsungCons = [
    "Large size",
    "Heavy device",
    "One UI learning curve",
];

export default function ReviewComparison() {
    return (
        <section className="mt-24">

            <div className="mb-12 text-center">

                <Badge variant="primary">
                    Reviews & Ratings
                </Badge>

                <h2 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-black">

                    Community & Expert Opinion

                </h2>

                <p className="mt-4 text-lg text-slate-500">

                    Ratings collected from users, reviewers and AI analysis.

                </p>

            </div>

            <div className="grid gap-6">

                {reviewData.map((item) => (

                    <Card
                        key={item.title}
                        className="rounded-[30px] p-8"
                    >

                        <div className="grid grid-cols-2 items-center gap-x-4 gap-y-3 sm:gap-x-6 lg:grid-cols-[1fr_260px_1fr] lg:gap-0">

                            <div>

                                <h3 className="text-lg font-black break-words sm:text-2xl lg:text-3xl">

                                    {item.left}

                                </h3>

                            </div>

                            <div className="order-first col-span-2 text-center lg:order-none lg:col-span-1">

                                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600 lg:mb-4 lg:h-16 lg:w-16">

                                    {item.icon}

                                </div>

                                <p className="font-bold">

                                    {item.title}

                                </p>

                            </div>

                            <div className="text-right">

                                <h3
                                    className={`text-lg font-black break-words sm:text-2xl lg:text-3xl ${item.winner === "right"
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

            <div className="mt-12 grid gap-8 lg:grid-cols-2">

                <Card className="rounded-[30px] p-8">

                    <h3 className="mb-8 text-lg font-black break-words sm:text-2xl lg:text-3xl">

                        iPhone 16 Pro

                    </h3>

                    <div className="space-y-5">

                        {iphonePros.map((item) => (

                            <div
                                key={item}
                                className="flex items-center gap-3"
                            >

                                <ThumbsUp
                                    size={20}
                                    className="text-emerald-600"
                                />

                                <span>{item}</span>

                            </div>

                        ))}

                        {iphoneCons.map((item) => (

                            <div
                                key={item}
                                className="flex items-center gap-3"
                            >

                                <ThumbsDown
                                    size={20}
                                    className="text-red-500"
                                />

                                <span>{item}</span>

                            </div>

                        ))}

                    </div>

                </Card>

                <Card className="rounded-[30px] p-8">

                    <h3 className="mb-8 text-lg font-black break-words sm:text-2xl lg:text-3xl">

                        Samsung Galaxy S25 Ultra

                    </h3>

                    <div className="space-y-5">

                        {samsungPros.map((item) => (

                            <div
                                key={item}
                                className="flex items-center gap-3"
                            >

                                <ThumbsUp
                                    size={20}
                                    className="text-emerald-600"
                                />

                                <span>{item}</span>

                            </div>

                        ))}

                        {samsungCons.map((item) => (

                            <div
                                key={item}
                                className="flex items-center gap-3"
                            >

                                <ThumbsDown
                                    size={20}
                                    className="text-red-500"
                                />

                                <span>{item}</span>

                            </div>

                        ))}

                    </div>

                </Card>

            </div>

            <Card className="mt-10 rounded-[32px] bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-5 sm:p-8 lg:p-10 text-white">

                <h3 className="text-lg font-black break-words sm:text-2xl lg:text-3xl">

                    AI Review Summary

                </h3>

                <p className="mt-6 text-lg leading-8 text-orange-100">

                    Based on expert reviews, verified customer feedback
                    and overall user satisfaction, the Samsung Galaxy
                    S25 Ultra receives a slightly higher recommendation
                    because of its excellent battery life, outstanding
                    display, versatile camera system and strong value.

                    The iPhone 16 Pro remains the preferred choice for
                    users who prioritize video recording, ecosystem
                    integration and long-term software stability.

                </p>

            </Card>

        </section>
    );
}
