import type { MetafieldDefinitionInput } from "~/types/admin.types";
import { KEY_CATALOGS, KEY_VIEWS, NAMESPACE_ACCOUNT, NAMESPACE_AUTOSUGGEST, NAMESPACE_CATEGORY, NAMESPACE_RECOMMENDATIONS, NAMESPACE_SEARCH, NAMESPACE_TEMPLATES, TEMPLATE_AUTOSUGGEST, TEMPLATE_CATEGORY, TEMPLATE_CATEGORY_LIST, TEMPLATE_RECOMMENDATIONS, TEMPLATE_SEARCH, TEMPLATE_SEARCH_LIST } from "./constants";

const account = [
  {
    name: "Account ID",
    key: "account_id",
    description: "Bloomreach Account ID",
    type: "single_line_text_field",
  },
  {
    name: "Domain Key",
    key: "domain_key",
    description: "Bloomreach Default Catalog",
    type: "single_line_text_field",
  },
  {
    name: "Auth Key",
    key: "auth_key",
    description: "Bloomreach Auth Key",
    type: "single_line_text_field",
  },
  {
    name: "Search Page URL",
    key: "search_page_url",
    description: "Shopify Store search page URL, can be absolute or relative",
    type: "single_line_text_field",
  },
  {
    name: "Auto-adjust search page URL",
    key: "autoadjust_search_page_url",
    description: "Auto adjust search page URL for market subfolders",
    type: "boolean",
  },
  {
    name: "Enable Multicurrency Support",
    key: "multicurrency_enabled",
    description: "When enabled, this setting will convert prices from your stores default currency to the user selected currency, if your store supports multiple currencies",
    type: "boolean",
  },
  {
    name: "Enable Multi-Catalog Support",
    key: "multi_catalog_enabled",
    type: "boolean",
  },
  {
    name: "Catalog Mappings",
    key: KEY_CATALOGS,
    description: "Language to Bloomreach Catalog mappings",
    type: "json",
  },
  {
    name: "View Mappings",
    key: KEY_VIEWS,
    description: "Country to Bloomreach View mappings",
    type: "json",
  }
];

const autosuggest = [
  {
    name: "Endpoint",
    key: "endpoint",
    description: "Bloomreach Autosuggest API endpoint",
    type: "url",
  },
  {
    name: "CSS Selector",
    key: "css_selector",
    description: "CSS Selector for the search input element",
    type: "single_line_text_field",
  },
  {
    name: "Number of Terms",
    key: "number_of_terms",
    description: "Number of suggested terms to show",
    type: "number_integer",
  },
  {
    name: "Number of Products",
    key: "number_of_products",
    description: "Number of suggested products to show",
    type: "number_integer",
  },
  {
    name: "Number of Collections",
    key: "number_of_collections",
    description: "Number of suggested collections to show",
    type: "number_integer",
  },
  {
    name: "Custom CSS",
    key: "custom_css",
    type: "multi_line_text_field",
  },
  {
    name: "Additional Parameters",
    key: "additional_parameters",
    description: "Additional API parameters",
    type: "single_line_text_field",
  },
];

const search = [
  {
    name: "Endpoint",
    key: "endpoint",
    description: "Bloomreach Search API endpoint",
    type: "url",
  },
  {
    name: "Items per Page",
    key: "items_per_page",
    description: "Number of products per page",
    type: "number_integer",
  },
  {
    name: "Display Variants",
    key: "display_variants",
    description: "Whether to display product variants",
    type: "boolean",
  },
  {
    name: "Include Facets",
    key: "facets_included",
    description: "Whether to display facets",
    type: "boolean",
  },
  {
    name: "Initial Number of Facets",
    key: "initial_number_of_facets",
    description: "Default number of facets to show",
    type: "number_integer",
  },
  {
    name: "Initial Number of Facet Values",
    key: "initial_number_of_facet_values",
    description: "Default number of facet values to show",
    type: "number_integer",
  },
  {
    name: "Enable Infinite Scroll",
    key: "infinite_scroll",
    description: "Whether to use infinite scroll",
    type: "boolean",
  },
  {
    name: "Product Attributes",
    key: "fl_fields",
    description: "Product attributes included in the API response",
    type: "single_line_text_field",
  },
  {
    name: "Sorting Options",
    key: "sorting_options",
    type: "json",
  },
  {
    name: "Custom CSS",
    key: "custom_css",
    type: "multi_line_text_field",
  },
  {
    name: "Additional Parameters",
    key: "additional_parameters",
    description: "Additional API parameters",
    type: "single_line_text_field",
  },
];

const category = [
  {
    name: "Endpoint",
    key: "endpoint",
    description: "Bloomreach Search API endpoint",
    type: "url",
  },
  {
    name: "Items per Page",
    key: "items_per_page",
    description: "Number of products per page",
    type: "number_integer",
  },
  {
    name: "Display Variants",
    key: "display_variants",
    description: "Whether to display product variants",
    type: "boolean",
  },
  {
    name: "Include Facets",
    key: "facets_included",
    description: "Whether to display facets",
    type: "boolean",
  },
  {
    name: "Initial Number of Facets",
    key: "initial_number_of_facets",
    description: "Default number of facets to show",
    type: "number_integer",
  },
  {
    name: "Initial Number of Facet Values",
    key: "initial_number_of_facet_values",
    description: "Default number of facet values to show",
    type: "number_integer",
  },
  {
    name: "Enable Infinite Scroll",
    key: "infinite_scroll",
    description: "Whether to use infinite scroll",
    type: "boolean",
  },
  {
    name: "Product Attributes",
    key: "fl_fields",
    description: "Product attributes included in the API response",
    type: "single_line_text_field",
  },
  {
    name: "Sorting Options",
    key: "sorting_options",
    type: "json",
  },
  {
    name: "Custom CSS",
    key: "custom_css",
    type: "multi_line_text_field",
  },
  {
    name: "Additional Parameters",
    key: "additional_parameters",
    description: "Additional API parameters",
    type: "single_line_text_field",
  },
];

const recommendations = [
  {
    name: "Endpoint",
    key: "endpoint",
    description: "Bloomreach Pathways API endpoint",
    type: "url",
  },
  {
    name: "Items to Show",
    key: "items_to_show",
    description: "Number of products to show per page",
    type: "number_integer",
  },
  {
    name: "Items to Fetch",
    key: "items_to_fetch",
    description: "Number of products to fetch totally",
    type: "number_integer",
  },
  {
    name: "Product Attributes",
    key: "fl_fields",
    description: "Product attributes included in the API response",
    type: "single_line_text_field",
  },
  {
    name: "Custom CSS",
    key: "custom_css",
    type: "multi_line_text_field",
  },
  {
    name: "Additional Parameters",
    key: "additional_parameters",
    description: "Additional API parameters",
    type: "single_line_text_field",
  },
];

const templates = [
  {
    name: "Autosuggest Template",
    key: TEMPLATE_AUTOSUGGEST,
    type: "multi_line_text_field",
  },
  {
    name: "Autosuggest Template Version",
    key: `${TEMPLATE_AUTOSUGGEST}_version`,
    type: "single_line_text_field",
  },
  {
    name: "Search Layout Template",
    key: TEMPLATE_SEARCH,
    type: "multi_line_text_field",
  },
  {
    name: "Search Layout Template Version",
    key: `${TEMPLATE_SEARCH}_version`,
    type: "single_line_text_field",
  },
  {
    name: "Search Product List Template",
    key: TEMPLATE_SEARCH_LIST,
    type: "multi_line_text_field",
  },
  {
    name: "Search Product List Template Version",
    key: `${TEMPLATE_SEARCH_LIST}_version`,
    type: "single_line_text_field",
  },
  {
    name: "Collections Layout Template",
    key: TEMPLATE_CATEGORY,
    type: "multi_line_text_field",
  },
  {
    name: "Collections Layout Template Version",
    key: `${TEMPLATE_CATEGORY}_version`,
    type: "single_line_text_field",
  },
  {
    name: "Collections Product List Template",
    key: TEMPLATE_CATEGORY_LIST,
    type: "multi_line_text_field",
  },
  {
    name: "Collections Product List Template Version",
    key: `${TEMPLATE_CATEGORY_LIST}_version`,
    type: "single_line_text_field",
  },
  {
    name: "Recommendations Widget Template",
    key: TEMPLATE_RECOMMENDATIONS,
    type: "multi_line_text_field",
  },
  {
    name: "Recommendations Widget Template Version",
    key: `${TEMPLATE_RECOMMENDATIONS}_version`,
    type: "single_line_text_field",
  },
];

export const metaDefinitions = {
  [NAMESPACE_ACCOUNT]: account,
  [NAMESPACE_AUTOSUGGEST]: autosuggest,
  [NAMESPACE_SEARCH]: search,
  [NAMESPACE_CATEGORY]: category,
  [NAMESPACE_RECOMMENDATIONS]: recommendations,
  [NAMESPACE_TEMPLATES]: templates,
} as Record<string, Omit<MetafieldDefinitionInput, 'ownerType' | 'namespace'>[]>;
