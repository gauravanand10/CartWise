import { Link } from "react-router-dom";

import type { Product } from "../types/product";

interface RelatedProductsProps {
    products: Product[];
}

export default function RelatedProducts({
    products,
}: RelatedProductsProps) {

    if (products.length === 0) {
        return null;
    }

    return (

        <section>

            <div className="mb-10">

                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">

                    Recommendations

                </span>

                <h2 className="mt-5 text-4xl font-black text-slate-900">

                    Related Products

                </h2>

                <p className="mt-3 text-slate-500">

                    Products you may also be interested in.

                </p>

            </div>

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

                {products.map((product) => (

                    <article
                        key={product.id}
                        className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                    >

                        <div className="relative flex h-60 items-center justify-center bg-slate-100">

                            <div className="text-8xl transition duration-300 group-hover:scale-110">

                                {product.images[0]}

                            </div>

                            <div className="absolute left-4 top-4 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">

                                {product.category}

                            </div>

                        </div>

                        <div className="space-y-5 p-6">

                            <h3 className="text-2xl font-bold text-slate-900">

                                {product.name}

                            </h3>

                            <div className="flex items-center justify-between">

                                <span className="text-3xl font-black text-blue-600">

                                    ₹{product.price.toLocaleString()}

                                </span>

                                <span className="rounded-lg bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">

                                    ⭐ {product.rating}

                                </span>

                            </div>

                            <Link
                                to={`/product/${product.id}`}
                                className="block rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-center font-semibold text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >

                                View Details

                            </Link>

                        </div>

                    </article>

                ))}

            </div>

        </section>

    );

}
