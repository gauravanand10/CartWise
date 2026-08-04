import ProductCard from "./ProductCard";
import featuredProducts from "../../data/featuredProducts";

export default function FeaturedProducts() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-8">

        <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700">
              Featured Products
            </span>

            <h2 className="mt-6 text-5xl font-black text-slate-900">
              Trending Products
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-500">
              Discover the latest and most popular products across all categories.
            </p>

          </div>

          <button className="rounded-2xl border border-slate-200 bg-white px-8 py-4 font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:text-blue-600">
            View All
          </button>

        </div>

        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">

          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      </div>
    </section>
  );
}
