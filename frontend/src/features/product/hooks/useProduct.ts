import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { productService } from "../services/productService";

import type { Product } from "../types/product";

interface UseProductReturn {
    product: Product | null;
    relatedProducts: Product[];
    loading: boolean;
    error: string | null;
}

export function useProduct(): UseProductReturn {

    const { id } = useParams();

    const [product, setProduct] =
        useState<Product | null>(null);

    const [relatedProducts, setRelatedProducts] =
        useState<Product[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {

        async function loadProduct() {

            try {

                setLoading(true);
                setError(null);

                const productId = Number(id);

                if (Number.isNaN(productId)) {

                    setError("Invalid product id.");

                    return;

                }

                const currentProduct =
                    await productService.getProductById(
                        productId
                    );

                if (!currentProduct) {

                    setError("Product not found.");

                    return;

                }

                setProduct(currentProduct);

                const related =
                    await productService.getRelatedProducts(
                        currentProduct
                    );

                setRelatedProducts(related);

            } catch (err) {

                console.error(err);

                setError(
                    "Something went wrong while loading the product."
                );

            } finally {

                setLoading(false);

            }

        }

        loadProduct();

    }, [id]);

    return {

        product,

        relatedProducts,

        loading,

        error,

    };

}
