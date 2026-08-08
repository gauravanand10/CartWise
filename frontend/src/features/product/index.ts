export { default as ProductPage } from "./ProductPage";

export { useProduct } from "./hooks/useProduct";

export {
    getAllSlugs,
    getProductBySlug,
    getRelatedProducts,
} from "./services/productService";

export type {
    ProductCardModel,
    ProductDetail,
    ProductStatus,
    RelatedProducts,
    Review,
    SpecGroup,
    StoreOffer,
} from "./types/product";
