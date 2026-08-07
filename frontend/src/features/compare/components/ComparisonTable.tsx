import {
    Check,
    Trophy,
    X,
} from "lucide-react";

import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

import { compareData } from "../data/compareData";

import SpecificationRow from "./SpecificationRow";

export default function ComparisonTable() {
    const left = compareData.leftProduct;
    const right = compareData.rightProduct;

    return (
        <section className="mt-20">

            <div className="mb-12 text-center">

                <Badge variant="primary">
                    Detailed Specifications
                </Badge>

                <h2 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">
                    Side-by-Side Comparison
                </h2>

                <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-500">
                    Compare every important specification before making
                    your purchase decision.
                </p>

            </div>

            <Card className="overflow-hidden rounded-[36px] p-0">

                {/* The trophy divider collapses to a narrow auto column on
                    phones; a fixed 240px middle track left almost nothing for
                    the two product names either side of it. */}

                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] border-b bg-slate-50 lg:grid-cols-[1fr_240px_1fr]">

                    <div className="p-4 text-center sm:p-6 lg:p-8">

                        <h3 className="text-base font-black sm:text-xl lg:text-2xl">
                            {left.name}
                        </h3>

                        <p className="mt-2 text-base font-black text-fuchsia-600 sm:text-2xl lg:text-3xl">
                            ₹{left.price.toLocaleString()}
                        </p>

                    </div>

                    <div className="flex items-center justify-center border-x px-3 lg:px-0">

                        <div className="rounded-full bg-fuchsia-600 p-2.5 text-white lg:p-4">

                            <Trophy className="h-5 w-5 lg:h-7 lg:w-7" />

                        </div>

                    </div>

                    <div className="p-4 text-center sm:p-6 lg:p-8">

                        <h3 className="text-base font-black sm:text-xl lg:text-2xl">
                            {right.name}
                        </h3>

                        <p className="mt-2 text-base font-black text-fuchsia-600 sm:text-2xl lg:text-3xl">
                            ₹{right.price.toLocaleString()}
                        </p>

                    </div>

                </div>

                {left.specifications.map((specification, index) => (

                    <SpecificationRow
                        key={specification.label}
                        specification={specification}
                        isLast={
                            index === left.specifications.length - 1
                        }
                    />

                ))}

            </Card>

            <div className="mt-10 grid gap-8 lg:grid-cols-2">

                <Card className="rounded-3xl p-8">

                    <h3 className="mb-6 text-2xl font-black">
                        {left.name}
                    </h3>

                    <div className="space-y-4">

                        {left.pros.map((item) => (

                            <div
                                key={item}
                                className="flex items-center gap-3"
                            >

                                <Check
                                    size={20}
                                    className="text-emerald-600"
                                />

                                <span>
                                    {item}
                                </span>

                            </div>

                        ))}

                        {left.cons.map((item) => (

                            <div
                                key={item}
                                className="flex items-center gap-3"
                            >

                                <X
                                    size={20}
                                    className="text-red-500"
                                />

                                <span>
                                    {item}
                                </span>

                            </div>

                        ))}

                    </div>

                </Card>

                <Card className="rounded-3xl p-8">

                    <h3 className="mb-6 text-2xl font-black">
                        {right.name}
                    </h3>

                    <div className="space-y-4">

                        {right.pros.map((item) => (

                            <div
                                key={item}
                                className="flex items-center gap-3"
                            >

                                <Check
                                    size={20}
                                    className="text-emerald-600"
                                />

                                <span>
                                    {item}
                                </span>

                            </div>

                        ))}

                        {right.cons.map((item) => (

                            <div
                                key={item}
                                className="flex items-center gap-3"
                            >

                                <X
                                    size={20}
                                    className="text-red-500"
                                />

                                <span>
                                    {item}
                                </span>

                            </div>

                        ))}

                    </div>

                </Card>

            </div>

        </section>
    );
}
