import { useEffect, useState } from "react";

import Breadcrumb from "./components/Breadcrumb";
import ProductDescription from "./components/ProductDescription";
import ProductHero from "./components/ProductHero";
import ProductSpecs from "./components/ProductSpecs";
import RelatedProducts from "./components/RelatedProducts";
import StoreComparison from "./components/StoreComparison";

import ProductError from "./components/states/ProductError";
import ProductNotFound from "./components/states/ProductNotFound";
import ProductSkeleton from "./components/states/ProductSkeleton";

import { getPopularProducts } from "./services/productService";
import type { ProductCardModel } from "./types/product";
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

    /*
     * Suggestions for the not-found screen.
     *
     * `useState` + `useEffect` rather than `useMemo`, because Chapter 26.5 made
     * `getPopularProducts` asynchronous — it reads the real catalogue over HTTP
     * now that the local array is gone. The initial value is an empty list and
     * `ProductNotFound` renders fine with one, so the recovery screen appears
     * immediately and fills in a moment later instead of waiting on a request
     * it may not even need.
     */
    const [popular, setPopular] = useState<ProductCardModel[]>([]);

    useEffect(() => {
        let cancelled = false;

        // Chapter 29 added the `.catch`. This list feeds the NOT-FOUND screen,
        // which makes an unhandled rejection here especially wrong: the one
        // place it can fire is the page a reader has already reached by
        // something going wrong.
        void getPopularProducts()
            .then((products) => {
                if (!cancelled) setPopular(products);
            })
            .catch(() => {
                if (!cancelled) setPopular([]);
            });

        return () => {
            cancelled = true;
        };
    }, []);

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
                productSlug={product.slug}
            />

            <ProductSpecs groups={product.specGroups} />

            <ProductDescription
                overview={product.overview}
                highlights={product.highlights}
                note={product.note}
            />

            {/*
                Chapter 26.5 removed two sections from this page.

                <AiInsights> rendered a 0-100 "CartWise AI score", a confidence
                percentage, and pros/cons/who-should-buy paragraphs. No model
                produced any of it.

                <ProductReviews> rendered named customer reviews with dates,
                ratings, "verified purchase" badges and helpful-vote counts, all
                generated from the product's slug. Fabricated consumer reviews
                are not a styling problem — they fall under the same FTC
                Endorsement Guides regime as the affiliate disclosure Chapter 26
                built, which treats a fake consumer endorsement as deceptive.

                What replaces them is one honest paragraph inside
                <ProductDescription>: CartWise's own note, written as CartWise
                and labelled as such, saying only what the catalogue's figures
                support — including that CartWise has never handled the product.
            */}

            <RelatedProducts related={related} />

        </div>
    );
}
