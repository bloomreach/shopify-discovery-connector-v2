import type { MarketRegionCountry } from "~/types/admin.types";
import type { MarketCatalogMapping, MarketCatalogViewReturn, MarketReturn, MarketViewMapping } from "~/types/store";

export function getCatalogMappingsFromMarkets(markets: MarketCatalogViewReturn[]): MarketCatalogMapping[] {
  const mappings: MarketCatalogMapping[] = [];

  const primaryMarket = markets.find((market) => market.primary);

  for (const market of markets) {
    if (!market.enabled) {
      continue;
    }

    const webPresence = market.webPresence ?? primaryMarket?.webPresence;
    const languages = webPresence?.rootUrls.map<string>((rootUrl) => rootUrl.locale);

    if (!languages) {
      console.log("warn: cannot get languages data from Shopify markets");
      return [];
    }

    // Create mappings from existing metafields, if any
    const catalogsValue = (market.brCatalogs)?.value;
    if (catalogsValue) {
      const catalogs = JSON.parse(catalogsValue);
      Object.keys(catalogs).forEach((lang) => {
        const index = languages.indexOf(lang);
        if (index >= 0) {
          mappings.push({
            market: market.name,
            marketId: market.id,
            marketHandle: market.handle,
            primary: market.primary,
            language: lang,
            catalog: catalogs[lang],
            isSet: true,
          });

          languages.splice(index, 1);
        }
      });
    }

    // Remaining languages are used to populate empty catalog fields
    languages.forEach((lang) => {
      mappings.push({
        market: market.name,
        marketId: market.id,
        marketHandle: market.handle,
        primary: market.primary,
        language: lang,
        isSet: false,
      });
    });
  }

  mappings.sort(compareCatalogMappings);

  return mappings;
}

/**
 * Sorting rules:
 * - Primary market always comes first.
 * - Other markets are sorted alphabetically based on their handles.
 * - Languages in the same market are sorted alphabetically.
 *
 * @param mapping1
 * @param mapping2
 * @returns
 */
function compareCatalogMappings(mapping1: MarketCatalogMapping, mapping2: MarketCatalogMapping): number {
  if (mapping1.marketHandle === mapping2.marketHandle) {
    return mapping1.language.localeCompare(mapping2.language);
  }

  if (mapping1.primary) {
    return -1;
  }

  if (mapping2.primary) {
    return 1;
  }

  return mapping1.marketHandle.localeCompare(mapping2.marketHandle);
}

export function mergeCatalogs(catalogMappings: MarketCatalogMapping[], catalogs: string[]): MarketCatalogMapping[] {
  if (catalogMappings.length !== catalogs.length) {
    console.warn("warn: mergeCatalogs: Cannot merge catalogs: Different number of items from original mappings (%d) and input catalogs (%d)",
      catalogMappings.length, catalogs.length
    );
    return [];
  }
  return catalogMappings.map((mapping, index) => ({
    ...mapping,
    catalog: catalogs[index],
  }));
}

export function filterAndSortMarkets<T extends MarketReturn>(markets: T[]): T[] {
  return markets.filter((market) => market.enabled).sort(compareMarkets);
}

/**
 * Sorting rules:
 * - Primary market always comes first.
 * - Other markets are sorted alphabetically based on their handles.
 *
 * @param mapping1
 * @param mapping2
 * @returns
 */
function compareMarkets(mapping1: MarketReturn, mapping2: MarketReturn): number {
  if (mapping1.primary) {
    return -1;
  }

  if (mapping2.primary) {
    return 1;
  }

  return mapping1.handle.localeCompare(mapping2.handle);
}

export function getViewMappingsFromMarkets(markets: MarketCatalogViewReturn[]): MarketViewMapping[] {
  const mappings: MarketViewMapping[] = [];

  for (const market of markets) {
    if (!market.enabled) {
      continue;
    }

    const countries = [...market.regions.nodes] as MarketRegionCountry[];

    // Create mappings from existing metafields, if any
    const viewIDsValue = (market.brViews)?.value;
    if (viewIDsValue) {
      const viewIDs = JSON.parse(viewIDsValue);
      Object.keys(viewIDs).forEach((countryCode) => {
        const index = countries.findIndex(country => country.code === countryCode);
        if (index >= 0) {
          mappings.push({
            market: market.name,
            marketId: market.id,
            marketHandle: market.handle,
            primary: market.primary,
            countryCode,
            countryName: countries[index].name,
            viewId: viewIDs[countryCode],
            isSet: true,
          });

          countries.splice(index, 1);
        }
      });
    }

    // Remaining countries are used to populate empty catalog fields
    countries.forEach((country) => {
      mappings.push({
        market: market.name,
        marketId: market.id,
        marketHandle: market.handle,
        primary: market.primary,
        countryCode: country.code,
        countryName: country.name,
        isSet: false,
      });
    });
  }

  mappings.sort(compareViewMappings);

  return mappings;
}

/**
 * Sorting rules:
 * - Primary market always comes first.
 * - Other markets are sorted alphabetically based on their handles.
 * - Countries in the same market are sorted alphabetically.
 *
 * @param mapping1
 * @param mapping2
 * @returns
 */
function compareViewMappings(mapping1: MarketViewMapping, mapping2: MarketViewMapping): number {
  if (mapping1.marketHandle === mapping2.marketHandle) {
    return mapping1.countryName.localeCompare(mapping2.countryName);
  }

  if (mapping1.primary) {
    return -1;
  }

  if (mapping2.primary) {
    return 1;
  }

  return mapping1.marketHandle.localeCompare(mapping2.marketHandle);
}

export function mergeViews(viewMappings: MarketViewMapping[], viewIds: string[]): MarketViewMapping[] {
  if (viewMappings.length !== viewIds.length) {
    console.warn("warn: mergeViews: Cannot combine view mappings: Different number of items from original mappings (%d) and input viewIds (%d)",
      viewMappings.length, viewIds.length
    );
    return [];
  }
  return viewMappings.map((mapping, index) => ({
    ...mapping,
    viewId: viewIds[index],
  }));
}
