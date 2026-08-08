import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getProductBySlug, getRelatedProducts } from "../services/productService";
import type {
    ProductDetail,
    ProductStatus,
    RelatedProducts,
} from "../types/product";

const EMPTY_RELATED: RelatedProducts = {
    similar: [],
    compared: [],
    recommended: [],
};

interface UseProduct {
    slug: string;
    product: ProductDetail | null;
    related: RelatedProducts;
    status: ProductStatus;
    error: string;
    retry: () => void;
}

/**
 * Loads the product named by the `:slug` route param.
 *
 * Distinguishes "not found" from "error": an unknown slug is a normal outcome
 * that deserves a recovery screen, while a genuine failure deserves a retry
 * button. Collapsing the two would offer a pointless retry on a URL that will
 * never resolve.
 */
export function useProduct(): UseProduct {
    const { slug = "" } = useParams<{ slug: string }>();

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [related, setRelated] = useState<RelatedProducts>(EMPTY_RELATED);
    const [status, setStatus] = useState<ProductStatus>("loading");
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);

    const retry = useCallback(() => setAttempt((n) => n + 1), []);

    useEffect(() => {
        // Guards against a slower earlier request landing after a newer one —
        // easy to trigger by clicking through two related products quickly.
        let cancelled = false;

        const load = async () => {
            setStatus("loading");
            setError("");

            try {
                const found = await getProductBySlug(slug);
                if (cancelled) return;

                if (!found) {
                    setProduct(null);
                    setRelated(EMPTY_RELATED);
                    setStatus("not-found");
                    return;
                }

                setProduct(found);
                setStatus("ready");

                const rails = await getRelatedProducts(found);
                if (!cancelled) setRelated(rails);
            } catch {
                if (cancelled) return;

                setProduct(null);
                setRelated(EMPTY_RELATED);
                setError("We couldn't load this product. Please try again.");
                setStatus("error");
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [slug, attempt]);

    return { slug, product, related, status, error, retry };
}
