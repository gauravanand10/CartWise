import { useState } from "react";

import type { Product } from "../types/product";

interface ProductGalleryProps {
    product: Product;
}

export default function ProductGallery({
    product,
}: ProductGalleryProps) {

    const [selectedImage, setSelectedImage] =
        useState(0);

    return (

        <section className="space-y-6">

            <div className="relative flex h-[520px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xl transition duration-300">

                <div className="select-none text-[180px] transition duration-300 hover:scale-105">

                    {product.images[selectedImage]}

                </div>

                <div className="absolute left-6 top-6 rounded-full bg-fuchsia-600 px-5 py-2 text-sm font-semibold text-white shadow">

                    {product.brand}

                </div>

                <div className="absolute right-6 top-6 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow">

                    {product.stock > 0
                        ? "In Stock"
                        : "Out of Stock"}

                </div>

            </div>

            <div className="grid grid-cols-4 gap-4">

                {product.images.map(
                    (image, index) => (

                        <button
                            key={index}
                            type="button"
                            onClick={() =>
                                setSelectedImage(index)
                            }
                            className={`flex h-28 items-center justify-center rounded-2xl border bg-white text-3xl sm:text-5xl lg:text-6xl shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${selectedImage === index
                                    ? "border-fuchsia-600 ring-2 ring-fuchsia-200"
                                    : "border-slate-200"
                                }`}
                        >

                            {image}

                        </button>

                    )
                )}

            </div>

        </section>

    );

}
