import type { Product } from "../types/product";

interface ProductDescriptionProps {
    product: Product;
}

export default function ProductDescription({
    product,
}: ProductDescriptionProps) {

    return (

        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 lg:p-10 shadow-xl">

            <div className="mb-10">

                <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">

                    Description

                </span>

                <h2 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">

                    About this Product

                </h2>

                <p className="mt-3 text-slate-500">

                    Learn more about this product before making your purchase.

                </p>

            </div>

            <div className="space-y-6">

                <p className="text-lg leading-9 text-slate-600">

                    {product.description}

                </p>

                <div className="rounded-2xl bg-slate-50 p-6">

                    <h3 className="mb-4 text-xl font-bold text-slate-900">

                        Why choose this product?

                    </h3>

                    <ul className="space-y-3">

                        {product.features.map((feature) => (

                            <li
                                key={feature}
                                className="flex items-center gap-3 text-slate-600"
                            >

                                <span className="text-green-600 text-lg">

                                    ✔

                                </span>

                                {feature}

                            </li>

                        ))}

                    </ul>

                </div>

            </div>

        </section>

    );

}
