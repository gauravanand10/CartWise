import { Link } from "react-router-dom";

interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  price: string;
  rating: number;
  image: string;
}

export default function ProductCard({
  id,
  name,
  category,
  price,
  rating,
  image,
}: ProductCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="mb-5 flex justify-center text-6xl">
        {image}
      </div>

      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
        {category}
      </span>

      <h3 className="mt-4 text-2xl font-bold">
        {name}
      </h3>

      <p className="mt-4 text-4xl font-bold text-blue-600">
        {price}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-yellow-500">
          ⭐ {rating}
        </span>

        <span className="text-green-600">
          In Stock
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="flex-1 rounded-lg bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700">
          Compare
        </button>

        <Link
          to={`/product/${id}`}
          className="flex-1 rounded-lg border py-2 text-center font-semibold transition hover:bg-gray-100"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
