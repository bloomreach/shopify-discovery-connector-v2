import { KEY_CATALOGS, KEY_VIEWS, NAMESPACE_ACCOUNT } from "~/models/constants";
import { getOrCreateMetaDefinitions, deleteMetafields, upsertMetafields, MetafieldOwnerType } from "./admin.server";

import type { MetafieldIdentifierInput, MetafieldsSetInput } from "~/types/admin.types";
import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import type { MarketCatalogMapping, MarketViewMapping } from "~/types/store";

const updateCatalogMappings = async (admin: AdminApiContext, catalogMappings: MarketCatalogMapping[]) => {
  console.log("log: updateCatalogMappings: catalogMappings: ", catalogMappings);

  const setInputs: MetafieldsSetInput[] = [];
  const deleteInputs: MetafieldIdentifierInput[] = [];
  const namespace = `$app:${NAMESPACE_ACCOUNT}`;

  catalogMappings.reduce((accu, curr) => {
    // ignore those untouched fields
    if (!curr.catalog && !curr.isSet) {
      return accu;
    }

    const mapping = curr.catalog ? { [curr.language]: curr.catalog } : {};
    const mappings = accu.has(curr.marketId) ?
      { ...accu.get(curr.marketId), ...mapping } :
      { ...mapping };

    accu.set(curr.marketId, mappings);
    return accu;
  }, new Map<string, Record<string, string>>()).forEach((mapping, marketId) => {
    if (Object.keys(mapping).length > 0) {
      setInputs.push({
        ownerId: marketId,
        namespace,
        key: KEY_CATALOGS,
        value: JSON.stringify(mapping),
      });
    } else {
      deleteInputs.push({
        ownerId: marketId,
        namespace,
        key: KEY_CATALOGS,
      });
    }
  });

  if (setInputs.length) {
    await getOrCreateMetaDefinitions(admin, namespace, MetafieldOwnerType.Market);
    const metafields = await upsertMetafields(admin, setInputs);
    console.log("log: updateCatalogMappings: catalogs metafields updated. Response data: ", metafields);
  }

  if (deleteInputs.length) {
    const metafields = await deleteMetafields(admin, deleteInputs);
    console.log("log: updateCatalogMappings: catalogs metafields deleted. Response data: ", metafields);
  }
};

const updateViewMappings = async (admin: AdminApiContext, viewMappings: MarketViewMapping[]) => {
  console.log("log: updateViewMappings: viewMappings: ", viewMappings);

  const setInputs: MetafieldsSetInput[] = [];
  const deleteInputs: MetafieldIdentifierInput[] = [];
  const namespace = `$app:${NAMESPACE_ACCOUNT}`;

  viewMappings.reduce((accu, curr) => {
    // ignore those untouched fields
    if (!curr.viewId && !curr.isSet) {
      return accu;
    }

    const mapping = curr.viewId ? { [curr.countryCode]: curr.viewId } : {};
    const mappings = accu.has(curr.marketId) ?
      { ...accu.get(curr.marketId), ...mapping } :
      { ...mapping };

    accu.set(curr.marketId, mappings);
    return accu;
  }, new Map<string, Record<string, string>>()).forEach((mapping, marketId) => {
    if (Object.keys(mapping).length > 0) {
      setInputs.push({
        ownerId: marketId,
        namespace,
        key: KEY_VIEWS,
        value: JSON.stringify(mapping),
      });
    } else {
      deleteInputs.push({
        ownerId: marketId,
        namespace,
        key: KEY_VIEWS,
      });
    }
  });

  if (setInputs.length) {
    await getOrCreateMetaDefinitions(admin, namespace, MetafieldOwnerType.Market);
    const metafields = await upsertMetafields(admin, setInputs);
    console.log("log: updateViewMappings: views metafields updated. Response data: ", metafields);
  }

  if (deleteInputs.length) {
    const metafields = await deleteMetafields(admin, deleteInputs);
    console.log("log: updateViewMappings: views metafields deleted. Response data: ", metafields);
  }
};

export { updateCatalogMappings, updateViewMappings };
