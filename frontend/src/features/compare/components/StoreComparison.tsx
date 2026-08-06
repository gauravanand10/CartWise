import {
    Clock3,
    ExternalLink,
    PackageCheck,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

import { compareData } from "../data/compareData";

export default function StoreComparison() {
    const { leftProduct, rightProduct } = compareData;

    return (
        <section className="mt-20">

            <div className="mb-12 text-center">

                <Badge variant="primary">
                    Best Store Prices
                </Badge>

                <h2 className="mt-5 text-4xl font-black">
                    Compare Prices Across Stores
                </h2>

                <p className="mt-4 text-lg text-slate-500">
                    Find the best deal from trusted online retailers.
                </p>

            </div>

            <div className="grid gap-8 lg:grid-cols-2">

                {[leftProduct, rightProduct].map((product) => (

                    <Card
                        key={product.id}
                        className="rounded-[32px] p-8"
                    >

                        <div className="mb-8 flex items-center justify-between">

                            <div>

                                <h3 className="text-2xl font-black">
                                    {product.name}
                                </h3>

                                <p className="text-slate-500">
                                    {product.brand}
                                </p>

                            </div>

                            <div className="text-right">

                                <p className="text-sm text-slate-500">
                                    Starting From
                                </p>

                                <p className="text-3xl font-black text-fuchsia-600">
                                    ₹{Math.min(...product.stores.map(store => store.price)).toLocaleString()}
                                </p>

                            </div>

                        </div>

                        <div className="space-y-5">

                            {product.stores.map((store) => (

                                <div
                                    key={store.store}
                                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-fuchsia-500 hover:shadow-lg"
                                >

                                    <div>

                                        <h4 className="font-bold">
                                            {store.store}
                                        </h4>

                                        <div className="mt-2 flex flex-wrap gap-5 text-sm text-slate-500">

                                            <span className="flex items-center gap-2">

                                                <Clock3 size={15} />

                                                {store.delivery}

                                            </span>

                                            <span className="flex items-center gap-2">

                                                <PackageCheck size={15} />

                                                {store.availability}

                                            </span>

                                        </div>

                                    </div>

                                    <div className="text-right">

                                        <p className="text-2xl font-black text-fuchsia-600">

                                            ₹{store.price.toLocaleString()}

                                        </p>

                                        <button className="mt-2 flex items-center gap-2 text-fuchsia-600 transition hover:text-purple-800">

                                            Visit

                                            <ExternalLink size={16} />

                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </Card>

                ))}

            </div>

        </section>
    );
}
