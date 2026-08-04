import { products } from "../data/products";
import type {
  SearchProduct,
  SortOption,
} from "../types/search";

import type { SearchFilter } from "../types/filter";

export const searchProducts = async (
  query: string,
  sort: SortOption,
  filter: SearchFilter
): Promise<SearchProduct[]> => {
  await new Promise((resolve) =>
    setTimeout(resolve, 500)
  );

  const keyword = query.trim().toLowerCase();

  let result = [...products];

  if (keyword) {
    result = result.filter((product) => {
      return (
        product.title
          .toLowerCase()
          .includes(keyword) ||
        product.brand
          .toLowerCase()
          .includes(keyword) ||
        product.category
          .toLowerCase()
          .includes(keyword)
      );
    });
  }

  if (filter.category !== "All") {
    result = result.filter(
      (product) =>
        product.category === filter.category
    );
  }

  switch (sort) {
    case "price-low-high":
      result.sort(
        (a, b) => a.price - b.price
      );
      break;

    case "price-high-low":
      result.sort(
        (a, b) => b.price - a.price
      );
      break;

    case "rating":
      result.sort(
        (a, b) => b.rating - a.rating
      );
      break;

    case "name":
      result.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
      break;
  }

  return result;
};
