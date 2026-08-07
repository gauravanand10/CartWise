import type { SearchProduct } from "../types/search";
import SearchResultCard from "./SearchResultCard";

interface SearchResultsProps {
    products: SearchProduct[];
}

const SearchResults = ({
    products,
}: SearchResultsProps) => {
    return (
        <section>

            <div className="mb-8 flex items-center justify-between">

                <div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                        Products
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Browse available products.
                    </p>

                </div>

            </div>

            <div className="grid gap-4 min-[400px]:grid-cols-2 sm:gap-6 xl:grid-cols-3 xl:gap-8">

                {products.map((product) => (
                    <SearchResultCard
                        key={product.id}
                        product={product}
                    />
                ))}

            </div>

        </section>
    );
};

export default SearchResults;
