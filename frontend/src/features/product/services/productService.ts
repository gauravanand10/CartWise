import { products } from "../data/products";

import type {
    Product,
} from "../types/product";

const delay = (ms: number) =>
    new Promise((resolve) =>
        setTimeout(resolve, ms)
    );

class ProductService {

    async getAllProducts(): Promise<Product[]> {

        await delay(400);

        return products;

    }

    async getProductById(
        id: number
    ): Promise<Product | null> {

        await delay(400);

        const product = products.find(
            (product) =>
                product.id === id
        );

        return product ?? null;

    }

    async getRelatedProducts(
        product: Product
    ): Promise<Product[]> {

        await delay(250);

        return products.filter(
            (candidate) =>
                product.relatedProducts.includes(
                    candidate.id
                )
        );

    }

    async getProductsByCategory(
        category: string
    ): Promise<Product[]> {

        await delay(250);

        return products.filter(
            (product) =>
                product.category === category
        );

    }

    async getProductsByBrand(
        brand: string
    ): Promise<Product[]> {

        await delay(250);

        return products.filter(
            (product) =>
                product.brand === brand
        );

    }

}

export const productService =
    new ProductService();
