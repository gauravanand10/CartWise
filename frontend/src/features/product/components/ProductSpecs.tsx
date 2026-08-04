import type { Product } from "../types/product";

interface ProductSpecsProps {
    product: Product;
}

export default function ProductSpecs({
    product,
}: ProductSpecsProps) {

    return (

        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">

            <div className="mb-10">

                <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">

                    Specifications

                </span>

                <h2 className="mt-5 text-4xl font-black text-slate-900">

                    Technical Specifications

                </h2>

                <p className="mt-3 text-slate-500">

                    Complete hardware and software details of the product.

                </p>

            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">

                {product.specifications.map(
                    (specification, index) => (

                        <div
                            key={specification.title}
                            className={`grid grid-cols-1 gap-4 border-b border-slate-200 p-6 md:grid-cols-3 ${
                                index % 2 === 0
                                    ? "bg-white"
                                    : "bg-slate-50"
                            }`}
                        >

                            <div className="font-semibold text-slate-600">

                                {specification.title}

                            </div>

                            <div className="md:col-span-2 font-medium text-slate-900">

                                {specification.value}

                            </div>

                        </div>

                    )
                )}

            </div>

        </section>

    );

}
