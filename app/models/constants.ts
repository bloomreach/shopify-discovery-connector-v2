import type { SortingOption } from "~/types/store";

export const NAMESPACE_ACCOUNT = "account";
export const NAMESPACE_RECOMMENDATIONS = "recommendations";
export const NAMESPACE_TEMPLATES = "templates";
export const NAMESPACE_AUTOSUGGEST = "autosuggest";
export const NAMESPACE_SEARCH = "search";
export const NAMESPACE_CATEGORY = "category";
export const KEY_CATALOGS = "catalogs";
export const KEY_VIEWS = "views";
export const TEMPLATE_AUTOSUGGEST = "autosuggest";
export const TEMPLATE_SEARCH = "search";
export const TEMPLATE_SEARCH_LIST = "search_product_list";
export const TEMPLATE_CATEGORY = "category";
export const TEMPLATE_CATEGORY_LIST = "category_product_list";
export const TEMPLATE_RECOMMENDATIONS = "recommendations";
export const SORTING_OPTIONS: SortingOption[] = [
  { label: "Relevance", value: "" },
  { label: "Name (A - Z)", value: "title+asc" },
  { label: "Name (Z - A)", value: "title+desc" },
  { label: "Price (low - high)", value: "sale_price+asc" },
  { label: "Price (high - low)", value: "sale_price+desc" },
  { label: "Bestseller", value: "best_seller+desc" },
];
