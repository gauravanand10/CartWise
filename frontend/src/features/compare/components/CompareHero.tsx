import { ArrowRightLeft, Sparkles, Trophy } from "lucide-react";
import HeroBanner from "../../../components/ui/HeroBanner";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";

export default function CompareHero() {
    return (
        <HeroBanner
            badge={
                <Badge variant="primary">
                    <Sparkles size={14} />
                    AI Powered Comparison
                </Badge>
            }
            title={
                <>
                    Compare Products
                    <br />
                    Like a <span className="gradient-text">Pro</span>
                </>
            }
            subtitle={
                <>
                    Compare specifications, pricing, ratings,
                    performance and features from multiple stores
                    using CartWise's intelligent comparison engine.
                </>
            }
            actions={
                <>
                    <Button
                        size="lg"
                        leftIcon={<ArrowRightLeft size={20} />}
                    >
                        Start Comparing
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        leftIcon={<Trophy size={20} />}
                    >
                        Top Comparisons
                    </Button>
                </>
            }
            image={
                <div className="relative flex h-[420px] w-full items-center justify-center">

                    <div className="absolute h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

                    <div className="grid grid-cols-2 gap-6">

                        <div className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl transition duration-300 hover:-translate-y-2">

                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-fuchsia-500 text-white text-2xl sm:text-3xl lg:text-4xl">
                                📱
                            </div>

                            <h3 className="text-xl font-bold">
                                Smartphone
                            </h3>

                            <p className="mt-2 text-sm text-fuchsia-100">
                                Apple iPhone 16 Pro
                            </p>

                        </div>

                        <div className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl transition duration-300 hover:-translate-y-2">

                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500 text-white text-2xl sm:text-3xl lg:text-4xl">
                                🤖
                            </div>

                            <h3 className="text-xl font-bold">
                                Smartphone
                            </h3>

                            <p className="mt-2 text-sm text-fuchsia-100">
                                Samsung S25 Ultra
                            </p>

                        </div>

                        <div className="col-span-2 rounded-3xl border border-white/20 bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 p-6 backdrop-blur-xl">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm uppercase tracking-wider text-fuchsia-100">
                                        AI Recommendation
                                    </p>

                                    <h3 className="mt-2 text-2xl sm:text-3xl font-black">
                                        Best Value
                                    </h3>

                                </div>

                                <div className="rounded-full bg-yellow-400 p-5 text-2xl sm:text-3xl lg:text-4xl">
                                    🏆
                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            }
        />
    );
}
