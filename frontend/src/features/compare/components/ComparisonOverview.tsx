import {
    ArrowRight,
    Star,
    Trophy,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

import { compareData } from "../data/compareData";

export default function ComparisonOverview() {
    const { leftProduct, rightProduct } = compareData;

    return (
        <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-12 text-white">

            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

            <div className="relative">

                <div className="text-center">

                    <Badge variant="primary">
                        Premium Comparison
                    </Badge>

                    <h1 className="mt-6 text-5xl font-black">
                        {leftProduct.name}
                        <span className="mx-5 text-fuchsia-400">VS</span>
                        {rightProduct.name}
                    </h1>

                    <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-300">
                        Compare pricing, specifications, AI recommendations,
                        performance benchmarks and camera quality before making
                        your buying decision.
                    </p>

                </div>

                <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_auto_1fr]">

                    <Card className="rounded-[32px] p-8 text-center">

                        <img
                            src={leftProduct.image}
                            alt={leftProduct.name}
                            className="mx-auto h-64 object-contain"
                        />

                        <h2 className="mt-8 text-3xl font-black text-slate-900">
                            {leftProduct.name}
                        </h2>

                        <div className="mt-4 flex items-center justify-center gap-2">

                            <Star
                                size={18}
                                className="fill-yellow-400 text-yellow-400"
                            />

                            <span className="font-bold">
                                {leftProduct.rating}
                            </span>

                            <span className="text-slate-500">
                                ({leftProduct.reviews.toLocaleString()} Reviews)
                            </span>

                        </div>

                        <p className="mt-6 text-4xl font-black text-fuchsia-600">
                            ₹{leftProduct.price.toLocaleString()}
                        </p>

                        <Button
                            className="mt-8 w-full"
                            size="lg"
                        >
                            View Product
                        </Button>

                    </Card>

                    <div className="flex items-center justify-center">

                        <div className="rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 p-8 shadow-2xl">

                            <Trophy size={42} />

                        </div>

                    </div>

                    <Card className="rounded-[32px] p-8 text-center">

                        <img
                            src={rightProduct.image}
                            alt={rightProduct.name}
                            className="mx-auto h-64 object-contain"
                        />

                        <h2 className="mt-8 text-3xl font-black text-slate-900">
                            {rightProduct.name}
                        </h2>

                        <div className="mt-4 flex items-center justify-center gap-2">

                            <Star
                                size={18}
                                className="fill-yellow-400 text-yellow-400"
                            />

                            <span className="font-bold">
                                {rightProduct.rating}
                            </span>

                            <span className="text-slate-500">
                                ({rightProduct.reviews.toLocaleString()} Reviews)
                            </span>

                        </div>

                        <p className="mt-6 text-4xl font-black text-fuchsia-600">
                            ₹{rightProduct.price.toLocaleString()}
                        </p>

                        <Button
                            className="mt-8 w-full"
                            size="lg"
                        >
                            View Product
                        </Button>

                    </Card>

                </div>

                <div className="mt-16 flex justify-center">

                    <Button
                        size="lg"
                        rightIcon={<ArrowRight size={20} />}
                    >
                        Start Detailed Comparison
                    </Button>

                </div>

            </div>

        </section>
    );
}
