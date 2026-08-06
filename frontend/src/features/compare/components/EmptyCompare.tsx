import {
    ArrowRight,
    Search,
    ShoppingCart,
} from "lucide-react";

import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

interface EmptyCompareProps {
    onStartComparison?: () => void;
}

export default function EmptyCompare({
    onStartComparison,
}: EmptyCompareProps) {
    return (
        <section className="flex min-h-[650px] items-center justify-center">

            <Card className="w-full max-w-5xl overflow-hidden rounded-[40px]">

                <div className="grid items-center lg:grid-cols-2">

                    <div className="space-y-8 p-12">

                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-fuchsia-100">

                            <ShoppingCart
                                size={48}
                                className="text-fuchsia-600"
                            />

                        </div>

                        <h1 className="text-5xl font-black leading-tight text-slate-900">

                            No Products Selected

                        </h1>

                        <p className="text-lg leading-8 text-slate-500">

                            Select any two products to unlock a detailed
                            AI-powered comparison including prices,
                            specifications, benchmarks, reviews,
                            battery life, cameras and much more.

                        </p>

                        <div className="flex flex-wrap gap-4">

                            <Button
                                size="lg"
                                leftIcon={<Search size={18} />}
                                rightIcon={<ArrowRight size={18} />}
                                onClick={onStartComparison}
                            >
                                Start Comparing
                            </Button>

                        </div>

                    </div>

                    <div className="relative flex h-full items-center justify-center overflow-hidden bg-gradient-to-br from-fuchsia-600 via-pink-600 to-purple-700 p-16">

                        <div className="absolute h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />

                        <div className="relative">

                            <div className="flex gap-8">

                                <div className="h-72 w-48 rounded-[32px] bg-white shadow-2xl" />

                                <div className="flex items-center">

                                    <div className="rounded-full bg-white p-5 text-3xl font-black text-purple-700">

                                        VS

                                    </div>

                                </div>

                                <div className="h-72 w-48 rounded-[32px] bg-white shadow-2xl" />

                            </div>

                        </div>

                    </div>

                </div>

            </Card>

        </section>
    );
}
