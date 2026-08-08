import { useEffect, useMemo } from "react";

import AiInsights from "./components/AiInsights";
import Breadcrumb from "./components/Breadcrumb";
import ProductDescription from "./components/ProductDescription";
import ProductHero from "./components/ProductHero";
import ProductReviews from "./components/ProductReviews";
import ProductSpecs from "./components/ProductSpecs";
import RelatedProducts from "./components/RelatedProducts";
import StoreComparison from "./components/StoreComparison";

import ProductError from "./components/states/ProductError";
import ProductNotFound from "./components/states/ProductNotFound";
import ProductSkeleton from "./components/states/ProductSkeleton";

import { getPopularProducts } from "./services/productService";
import { useProduct } from "./hooks/useProduct";

/**
 * Product Details.
 *
 * MainLayout supplies the `<main>` landmark and the width container, so this
 * page only owns its own vertical rhythm — the same contract the Search page
 * follows.
 */
export default function ProductPage() {
    const { slug, product, related, status, error, retry } = useProduct();

    // Related products link to other products, so the same component re-renders
    // with new data while the viewport is halfway down the page. Without this
    // the user lands in the middle of the next product's reviews.
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [slug]);

    const popular = useMemo(() => getPopularProducts(), []);

    if (status === "loading") {
        return <ProductSkeleton />;
    }

    if (status === "error") {
        return <ProductError message={error} onRetry={retry} />;
    }

    if (status === "not-found" || !product) {
        return <ProductNotFound slug={slug} suggestions={popular} />;
    }

    return (
        <div className="space-y-6 sm:space-y-8">

            <Breadcrumb category={product.category} name={product.name} />

            <ProductHero product={product} />

            <StoreComparison
                stores={product.stores}
                productName={product.name}
            />

            <ProductSpecs groups={product.specGroups} />

            <ProductDescription
                overview={product.overview}
                highlights={product.highlights}
                features={product.features}
                boxContents={product.boxContents}
            />

            <AiInsights ai={product.ai} productName={product.name} />

            <ProductReviews
                rating={product.rating}
                reviewCount={product.reviewCount}
                buckets={product.ratingBuckets}
                reviews={product.reviews}
            />

            <RelatedProducts related={related} />

        </div>
    );
}
