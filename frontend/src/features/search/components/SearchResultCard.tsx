import type { SearchProduct } from "../types/search";

interface SearchResultCardProps {
  product: SearchProduct;
}

const SearchResultCard = ({
  product,
}: SearchResultCardProps) => {
  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <img
        src={product.image}
        alt={product.title}
        className="h-56 w-full object-cover"
      />

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold text-purple-700">
            {product.category}
          </span>

          <span className="text-sm font-medium text-green-600">
            ★ {product.rating}
          </span>
        </div>

        <h2 className="line-clamp-2 text-lg font-bold">
          {product.title}
        </h2>

        <p className="text-gray-500">
          {product.brand}
        </p>

        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-fuchsia-600">
            ₹{product.price.toLocaleString()}
          </h3>

          <span className="text-sm font-medium text-green-600">
            In Stock
          </span>
        </div>

        <div className="flex gap-3 pt-2">
          <button className="flex-1 rounded-lg bg-fuchsia-600 py-2 font-semibold text-white transition hover:bg-purple-700">
            Compare
          </button>

          <button className="flex-1 rounded-lg border py-2 font-semibold transition hover:bg-gray-100">
            Details
          </button>
        </div>
      </div>
    </article>
  );
};

export default SearchResultCard;
