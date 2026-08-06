import {
    ArrowRight,
    Sparkles,
    TrendingUp,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

const comparisons = [
    {
        id: 1,
        left: "iPhone 16",
        right: "Pixel 10 Pro",
        leftPrice: "₹79,999",
        rightPrice: "₹76,999",
        score: 94,
        badge: "Trending",
        emoji: "📱",
    },
    {
        id: 2,
        left: "MacBook Air M4",
        right: "Dell XPS 14",
        leftPrice: "₹1,09,900",
        rightPrice: "₹1,14,999",
        score: 96,
        badge: "Popular",
        emoji: "💻",
    },
    {
        id: 3,
        left: "Sony WH-1000XM6",
        right: "AirPods Max",
        leftPrice: "₹31,999",
        rightPrice: "₹59,900",
        score: 92,
        badge: "Editor's Pick",
        emoji: "🎧",
    },
    {
        id: 4,
        left: "Apple Watch Ultra",
        right: "Galaxy Watch Ultra",
        leftPrice: "₹89,900",
        rightPrice: "₹54,999",
        score: 95,
        badge: "Hot",
        emoji: "⌚",
    },
];

export default function RelatedComparisons() {
    return (
        <section className="mt-20">

            <div className="mb-12 text-center">

                <Badge variant="primary">
                    <TrendingUp size={14} />
                    Popular Comparisons
                </Badge>

                <h2 className="mt-5 text-4xl font-black text-slate-900">
                    Continue Exploring
                </h2>

                <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-500">
                    Thousands of users are comparing these products right now.
                </p>

            </div>

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

                {comparisons.map((item) => (

                    <Card
                        key={item.id}
                        className="group overflow-hidden rounded-[32px] p-0 transition duration-500 hover:-translate-y-3 hover:shadow-2xl"
                    >

                        <div className="bg-gradient-to-br from-fuchsia-600 via-pink-600 to-purple-700 p-8 text-white">

                            <div className="flex items-center justify-between">

                                <Badge variant="secondary">
                                    {item.badge}
                                </Badge>

                                <Sparkles size={20} />

                            </div>

                            <div className="mt-8 text-center text-7xl">
                                {item.emoji}
                            </div>

                        </div>

                        <div className="space-y-5 p-8">

                            <div>

                                <h3 className="text-xl font-black text-slate-900">
                                    {item.left}
                                </h3>

                                <p className="text-fuchsia-600 font-semibold">
                                    {item.leftPrice}
                                </p>

                            </div>

                            <div className="flex justify-center">

                                <div className="rounded-full bg-slate-100 px-5 py-2 font-bold text-slate-600">
                                    VS
                                </div>

                            </div>

                            <div>

                                <h3 className="text-xl font-black text-slate-900">
                                    {item.right}
                                </h3>

                                <p className="text-fuchsia-600 font-semibold">
                                    {item.rightPrice}
                                </p>

                            </div>

                            <div className="rounded-2xl bg-fuchsia-50 p-5">

                                <p className="text-sm text-slate-500">
                                    AI Match Score
                                </p>

                                <div className="mt-2 flex items-center justify-between">

                                    <span className="text-3xl font-black text-fuchsia-600">
                                        {item.score}
                                    </span>

                                    <span className="font-semibold">
                                        /100
                                    </span>

                                </div>

                            </div>

                            <Button
                                fullWidth
                                rightIcon={<ArrowRight size={18} />}
                            >
                                Compare Now
                            </Button>

                        </div>

                    </Card>

                ))}

            </div>

        </section>
    );
}
