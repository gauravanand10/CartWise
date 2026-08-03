import { whyCartWise } from "../../data/whyCartWise";

export default function WhyCartWise() {
    return (
        <section className="bg-white py-20">
            <div className="mx-auto max-w-6xl px-6">

                <div className="mb-14 text-center">
                    <h2 className="text-4xl font-bold text-gray-900">
                        Why Choose CartWise?
                    </h2>

                    <p className="mt-4 text-lg text-gray-600">
                        Everything you need to make smarter purchasing decisions.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">

                    {whyCartWise.map((item) => (

                        <div
                            key={item.title}
                            className="rounded-xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >

                            <div className="mb-5 text-5xl">
                                {item.icon}
                            </div>

                            <h3 className="mb-3 text-2xl font-semibold">
                                {item.title}
                            </h3>

                            <p className="text-gray-600">
                                {item.description}
                            </p>

                        </div>

                    ))}

                </div>

            </div>
        </section>
    );
}
