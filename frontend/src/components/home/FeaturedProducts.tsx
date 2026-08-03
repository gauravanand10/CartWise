import ProductCard from "./ProductCard";
import featuredProducts from "../../data/featuredProducts";

export default function FeaturedProducts() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold">
            Featured Products
          </h2>

          <p className="mt-3 text-gray-600">
            Explore some of the most popular products available on CartWise.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              price={product.price}
              rating={product.rating}
              image={product.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
