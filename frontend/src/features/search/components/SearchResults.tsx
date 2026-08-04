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

                    <h2 className="text-3xl font-black text-slate-900">
                        Products
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Browse available products.
                    </p>

                </div>

            </div>

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

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
