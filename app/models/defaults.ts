const autosuggest = {
  endpoint: "https://staging-suggest.dxpapi.com/api/v1/suggest/",
  css_selector: 'form[role="search"] input[type="text"], form[role="search"] input[type="search"]',
  number_of_terms: 4,
  number_of_products: 8,
  number_of_collections: 8,
};

const search = {
  endpoint: "https://staging-core.dxpapi.com/api/v1/core/",
  items_per_page: 16,
  display_variants: false,
  facets_included: true,
  initial_number_of_facets: 3,
  initial_number_of_facet_values: 6,
  infinite_scroll: false,
  fl_fields: "pid,title,brand,price,sale_price,thumb_image,sku_thumb_images,sku_swatch_images,sku_color_group,url,price_range,sale_price_range,description",
  sorting_options: [
    { label: "Relevance", value: "" },
    { label: "Name (A - Z)", value: "title+asc" },
    { label: "Name (Z - A)", value: "title+desc" },
    { label: "Price (low - high)", value: "sale_price+asc" },
    { label: "Price (high - low)", value: "sale_price+desc" },
  ],
};

const recommendations = {
  endpoint: "https://pathways-staging.dxpapi.com/api/v2/widgets/",
  fl_fields: "pid,price,sale_price,title,thumb_image,url",
  items_to_show: 4,
  items_to_fetch: 16,
}

export const defaults = { autosuggest, search, recommendations };
