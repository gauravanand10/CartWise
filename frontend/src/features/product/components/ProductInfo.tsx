import type { Product } from "../types/product";

interface ProductInfoProps {
    product: Product;
}

export default function ProductInfo({
    product,
}: ProductInfoProps) {

    const discount =
        product.originalPrice
            ? Math.round(
                ((product.originalPrice - product.price) /
                    product.originalPrice) *
                100
            )
            : 0;

    return (

        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 lg:p-10 shadow-xl">

            <span className="rounded-full bg-fuchsia-100 px-4 py-2 text-sm font-semibold text-purple-700">

                {product.category}

            </span>

            <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-slate-900">

                {product.name}

            </h1>

            <p className="mt-3 text-lg text-slate-500">

                by{" "}

                <span className="font-semibold text-slate-700">

                    {product.brand}

                </span>

            </p>

            <div className="mt-6 flex flex-wrap items-center gap-6">

                <div className="rounded-xl bg-amber-100 px-4 py-2 font-semibold text-amber-700">

                    ⭐ {product.rating}

                </div>

                <span className="text-slate-500">

                    {product.reviewCount} Reviews

                </span>

                <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">

                    SKU : {product.sku}

                </span>

            </div>

            <div className="mt-10 flex flex-wrap items-end gap-4">

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-fuchsia-600">

                    ₹{product.price.toLocaleString()}

                </h2>

                {product.originalPrice && (

                    <>
                        <span className="text-2xl text-slate-400 line-through">

                            ₹{product.originalPrice.toLocaleString()}

                        </span>

                        <span className="rounded-xl bg-green-100 px-4 py-2 font-bold text-green-700">

                            {discount}% OFF

                        </span>
                    </>

                )}

            </div>

            <div className="mt-8">

                {product.stock > 0 ? (

                    <div className="inline-flex items-center rounded-full bg-emerald-100 px-5 py-2 font-semibold text-emerald-700">

                        ✓ In Stock ({product.stock} left)

                    </div>

                ) : (

                    <div className="inline-flex items-center rounded-full bg-red-100 px-5 py-2 font-semibold text-red-700">

                        ✕ Out of Stock

                    </div>

                )}

            </div>

            <div className="mt-10">

                <h3 className="text-xl font-bold text-slate-900">

                    Highlights

                </h3>

                <ul className="mt-5 space-y-3">

                    {product.features.map((feature) => (

                        <li
                            key={feature}
                            className="flex items-center gap-3 text-slate-600"
                        >

                            <span className="text-green-600">

                                ✔

                            </span>

                            {feature}

                        </li>

                    ))}

                </ul>

            </div>

            <div className="mt-12 grid grid-cols-2 gap-5">

                <button
                    type="button"
                    className="rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 py-4 text-lg font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >

                    Compare

                </button>

                <button
                    type="button"
                    className="rounded-2xl border border-slate-300 bg-white py-4 text-lg font-semibold text-slate-700 transition duration-300 hover:border-red-500 hover:text-red-600 hover:shadow-lg"
                >

                    Add to Wishlist

                </button>

            </div>

        </section>

    );

}
