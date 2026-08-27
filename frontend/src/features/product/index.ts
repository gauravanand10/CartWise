export { default as ProductPage } from "./ProductPage";

export { useProduct } from "./hooks/useProduct";

/*
 * Chapter 26.5 dropped `getAllSlugs` from this barrel along with the local
 * catalogue it read. "Every slug in the catalogue" was answerable only while
 * the catalogue was an array in the bundle; with 100 products behind a paged
 * API it would be a request loop, and nothing imported it.
 */
export {
    getPopularProducts,
    getProductBySlug,
    getRelatedProducts,
} from "./services/productService";

export type {
    ProductCardModel,
    ProductDetail,
    ProductStatus,
    RelatedProducts,
    SpecGroup,
    StoreOffer,
} from "./types/product";
