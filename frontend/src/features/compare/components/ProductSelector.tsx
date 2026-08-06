import { ArrowLeftRight, Search } from "lucide-react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

export default function ProductSelector() {
    return (
        <section className="mt-12">

            <Card className="rounded-[36px] p-10">

                <div className="mb-10 text-center">

                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-600">
                        Compare Products
                    </p>

                    <h2 className="text-4xl font-black text-slate-900">
                        Select Two Products
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
                        Search and choose any two products to generate
                        an intelligent comparison with pricing,
                        specifications and AI recommendations.
                    </p>

                </div>

                <div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr]">

                    <div className="space-y-6">

                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                            <div className="flex items-center gap-5 p-6">

                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-5xl">
                                    📱
                                </div>

                                <div>

                                    <p className="text-sm text-slate-500">
                                        Product A
                                    </p>

                                    <h3 className="text-2xl font-bold">
                                        Apple iPhone 16 Pro
                                    </h3>

                                    <p className="mt-1 text-fuchsia-600">
                                        ₹129,900
                                    </p>

                                </div>

                            </div>

                        </div>

                        <Input
                            placeholder="Search first product..."
                            leftIcon={<Search size={18} />}
                        />

                    </div>

                    <div className="flex items-center justify-center">

                        <button
                            className="
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-full
                                bg-gradient-to-r
                                from-fuchsia-600
                                to-violet-600
                                text-white
                                shadow-xl
                                transition
                                duration-300
                                hover:rotate-180
                            "
                        >
                            <ArrowLeftRight size={26} />
                        </button>

                    </div>

                    <div className="space-y-6">

                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                            <div className="flex items-center gap-5 p-6">

                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-5xl">
                                    🤖
                                </div>

                                <div>

                                    <p className="text-sm text-slate-500">
                                        Product B
                                    </p>

                                    <h3 className="text-2xl font-bold">
                                        Samsung Galaxy S25 Ultra
                                    </h3>

                                    <p className="mt-1 text-fuchsia-600">
                                        ₹124,999
                                    </p>

                                </div>

                            </div>

                        </div>

                        <Input
                            placeholder="Search second product..."
                            leftIcon={<Search size={18} />}
                        />

                    </div>

                </div>

                <div className="mt-10 flex justify-center">

                    <Button
                        size="lg"
                        className="min-w-[280px]"
                    >
                        Compare Now
                    </Button>

                </div>

            </Card>

        </section>
    );
}
