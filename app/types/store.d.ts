import type { Prisma } from "@prisma/client";
import type { Market, Metafield, MetafieldConnection } from "./admin.types";

export interface Account {
  account_id?: string;
  auth_key?: string;
  domain_key?: string;
  search_page_url?: string;
  multicurrency_enabled?: boolean;
  multi_catalog_enabled?: boolean;
  autoadjust_search_page_url?: boolean;
}

export interface Recommendations {
  endpoint?: string;
  fl_fields?: string;
  items_to_show?: string | number;
  items_to_fetch?: string | number;
  custom_css?: string;
  additional_parameters?: string;
}

export interface Autosuggest {
  endpoint?: string;
  css_selector?: string;
  number_of_terms?: string | number;
  number_of_products?: string | number;
  number_of_collections?: string | number;
  custom_css?: string;
  additional_parameters?: string;
}

export interface Search {
  endpoint?: string;
  items_per_page?: string | number;
  display_variants?: boolean;
  facets_included?: boolean;
  initial_number_of_facets?: string | number;
  initial_number_of_facet_values?: string | number;
  infinite_scroll?: boolean;
  fl_fields?: string;
  sorting_options?: object;
  custom_css?: string;
  additional_parameters?: string;
}

export interface SimpleMarket {
  market: string;
  marketId: string;
  marketHandle: string;
  primary: boolean;
}

export interface MarketCatalogMapping extends SimpleMarket {
  language: string;
  catalog?: string;
  isSet?: boolean = false;
}

export interface MarketViewMapping extends SimpleMarket {
  countryCode: string;
  countryName: string;
  viewId?: string;
  isSet?: boolean = false;
}

export interface Template {
  value?: string;
  version?: string;
}

type MarketTemplate = SimpleMarket & {
  template: Template;
};

export interface TemplateMarkets {
  defaultTemplate: Template;
  markets: MarketTemplate[];
}

export interface SortingOption {
  label: string;
  value: string;
}

export type TemplateAction = Record<string, any> & ({
  _action: 'autoUpdateTemplate',
  template: string,
  marketId?: string,
} | {
  _action: 'saveTemplate',
  template: string,
  templateValue: string,
  templateVersion?: string,
  marketId?: string,
} | {
  _action: 'updateAllTemplates',
  template: string,
  actions: TemplateAction[],
} | {
  _action: 'deleteTemplate',
  template: string,
  marketId: string,
});

export type SettingsAction = Record<string, any> & ({
  _action: 'saveSettings',
  marketId?: string,
  account?: Account,
  autosuggest?: Autosuggest,
  search?: Search,
  recommendations?: Recommendations,
} | {
  _action: 'updateAllSettings',
  actions: SettingsAction[],
} | {
  _action: 'deleteSettings',
  marketId: string,
});

export type Store = Prisma.Result<typeof prisma.store, Prisma.Args<typeof prisma.store, 'findUniqueOrThrow'>, 'findUniqueOrThrow'>;

export type MarketReturn = Pick<Market, 'id' | 'name' | 'handle' | 'primary' | 'enabled'>;

export type MarketCatalogViewReturn = MarketReturn & Pick<Market, 'regions' | 'webPresence'> & {
  brCatalogs?: Pick<Metafield, 'value'> | null,
  brViews?: Pick<Metafield, 'value'> | null,
};

export type TemplateMetafields = {
  searchTemplate?: Pick<Metafield, 'value'> | null,
  searchListTemplate?: Pick<Metafield, 'value'> | null,
  categoryTemplate?: Pick<Metafield, 'value'> | null,
  categoryListTemplate?: Pick<Metafield, 'value'> | null,
  autosuggestTemplate?: Pick<Metafield, 'value'> | null,
  recommendationsTemplate?: Pick<Metafield, 'value'> | null,
};

export type TemplateVersionMetafields = {
  searchTemplateVersion?: Pick<Metafield, 'value'> | null,
  searchListTemplateVersion?: Pick<Metafield, 'value'> | null,
  categoryTemplateVersion?: Pick<Metafield, 'value'> | null,
  categoryListTemplateVersion?: Pick<Metafield, 'value'> | null,
  autosuggestTemplateVersion?: Pick<Metafield, 'value'> | null,
  recommendationsTemplateVersion?: Pick<Metafield, 'value'> | null,
};

export type MarketTemplateReturn = MarketReturn & TemplateMetafields & TemplateVersionMetafields & {
  autosuggestSettings?: Pick<MetafieldConnection, 'nodes'> | null,
};

export type MetafieldReturn = Pick<Metafield, 'id' | 'namespace' | 'key' | 'value' | 'type'>;
