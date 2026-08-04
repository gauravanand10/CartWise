import { Link } from "react-router-dom";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

      <div className="relative flex h-72 items-center justify-center overflow-hidden bg-slate-100">

        <div className="text-8xl">
          {product.image}
        </div>

        <div className="absolute left-4 top-4 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
          {product.category}
        </div>

        <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-bold shadow">
          ⭐ {product.rating}
        </div>

      </div>

      <div className="space-y-5 p-6">

        <h2 className="text-2xl font-bold text-slate-900">
          {product.name}
        </h2>

        <h3 className="text-3xl font-black text-blue-600">
          {product.price}
        </h3>

        <p className="text-sm font-medium text-green-600">
          In Stock
        </p>

        <div className="grid grid-cols-2 gap-3">

          <button className="rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700">
            Compare
          </button>

          <Link
            to={`/product/${product.id}`}
            className="rounded-xl border border-slate-300 py-3 text-center font-semibold transition hover:border-blue-600 hover:text-blue-600"
          >
            Details
          </Link>

        </div>

      </div>

    </article>
  );
}
