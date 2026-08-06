import Breadcrumb from "./components/Breadcrumb";
import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import ProductSpecs from "./components/ProductSpecs";
import ProductDescription from "./components/ProductDescription";
import RelatedProducts from "./components/RelatedProducts";
import ProductSkeleton from "./components/ProductSkeleton";
import ProductError from "./components/ProductError";

import { useProduct } from "./hooks/useProduct";

export default function ProductPage() {

    const {

        product,

        relatedProducts,

        loading,

        error,

    } = useProduct();

    if (loading) {

        return <ProductSkeleton />;

    }

    if (error || !product) {

        return (
            <ProductError
                message={
                    error ??
                    "Unable to load product."
                }
            />
        );

    }

    return (

        // MainLayout supplies the <main> landmark and the width container, so
        // this page only owns its own vertical rhythm.
        <div>

            <div>

                <Breadcrumb
                    product={product}
                />

                <section className="mt-10 grid gap-12 lg:grid-cols-2">

                    <ProductGallery
                        product={product}
                    />

                    <ProductInfo
                        product={product}
                    />

                </section>

                <section className="mt-16">

                    <ProductSpecs
                        product={product}
                    />

                </section>

                <section className="mt-16">

                    <ProductDescription
                        product={product}
                    />

                </section>

                <section className="mt-20">

                    <RelatedProducts
                        products={
                            relatedProducts
                        }
                    />

                </section>

            </div>

        </div>

    );

}
