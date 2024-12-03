import prisma from "../db.server";
import { deleteMetafields, getAppDataMetafields, getAppOwnerId, getOrCreateMetaDefinitions, MetafieldOwnerType, upsertAppDataMetafields, upsertMetafields, upsertWebPixel } from "./admin.server";
import { setDefaultTemplates } from "./templates.server";
import { defaults, metaDefinitions, NAMESPACE_ACCOUNT, NAMESPACE_AUTOSUGGEST, NAMESPACE_CATEGORY, NAMESPACE_RECOMMENDATIONS, NAMESPACE_SEARCH } from "~/models";
import { metafieldsReducer } from "~/utils";

import type { Account, SettingsAction, Store } from "~/types/store";
import type { Prisma } from "@prisma/client";
import type { MetafieldIdentifierInput, MetafieldsSetInput } from "~/types/admin.types";
import type { AdminApiContext } from "@shopify/shopify-app-remix/server";

const sensitiveKeys: (keyof Store)[] = ["id", "created_at", "updated_at"];

/**
 *
 * Removes sensitive information from store.
 * Use before returning store to the front end.
 *
 * @param  {Store} store - Current store
 * @return {Store} - Store with sensitive keys removed
 * @example
 *
 * const frontEndData = removeSensitiveKeys(currentStore);
 *
 */
const removeSensitiveKeys = (store: Store) => {
  console.log("log: removeSensitiveKeys");
  console.log("log: removeSensitiveKeys: store: ", store);
  console.log("log: removeSensitiveKeys: sensitiveKeys: ", sensitiveKeys);
  for (const key of sensitiveKeys) {
    delete store[`${key}`];
  }
  console.log("log: removeSensitiveKeys: return: ", store);
  return store;
};

/**
 *
 * Gets a store from the db with shopUrl.
 * This function returns data to the front & back end.
 * Back end requests can call withSensitiveKeys = true if that data is needed.
 * Front end requests should never call withSensitiveKeys = true.
 *
 * @param  {string} shopUrl - Current store url
 * @param  {boolean} withSensitiveKeys - Return data with or without sensitive data
 * @return {Store} - Store
 * @example
 *
 * const frontEndData = getStore(currentStoreUrl);
 * const backEndData = getStore(currentStoreUrl, true);
 *
 */
const getStore = async (shopUrl: string, withSensitiveKeys: boolean = false) => {
  console.log("log: getStore");
  const store = await prisma.store.findUnique({
    where: {
      shop_url: shopUrl,
    },
  });
  console.log("log: getStore: store: ", store);
  if (!store) {
    return null;
  }
  return withSensitiveKeys ? store : removeSensitiveKeys(store);
};

/**
 *
 * Deletes a store from the db with shop_url
 *
 * @param  {string}  shopUrl - Current store url
 * @return {boolean}
 *
 */
const deleteStore = async (shopUrl: string) => {
  console.log("log: deleteStore");
  console.log("log: deleteStore: shopUrl", shopUrl);
  await prisma.store.delete({ where: { shop_url: shopUrl } });
  return;
};

/**
 *
 * Installs a store
 *
 * @param  {AdminApiContext}  admin
 * @param  {string}  shopUrl
 * @return {null}
 *
 */
const installStore = async (admin: AdminApiContext, shopUrl: string) => {
  console.log("log: installStore");
  console.log("log: installStore: shopUrl:", shopUrl);
  const store = await prisma.store.findUnique({
    where: {
      shop_url: shopUrl,
    },
  });
  if (!store) {
    await prisma.store.create({
      data: {
        shop_url: shopUrl,
      },
    });
  }
  await setDefaultTemplates(admin, shopUrl);
  await setDefaultSettings(admin, shopUrl);
};

/**
 *
 * Uninstalls a store
 * - Deletes store from DB
 *
 * @param  {string}  shopUrl - Current store url
 * @return {boolean}
 *
 */
const uninstallStore = async (shopUrl: string) => {
  console.log("log: uninstallStore");
  console.log("log: uninstallStore: shop", shopUrl);
  await deleteStore(shopUrl);
  await prisma.session.deleteMany({
    where: {
      shop: shopUrl,
    },
  });
  return;
};

/**
 *
 * Updates store in the db.
 *
 * @param  {string} shopUrl - Current store url
 * @param  {Prisma.storeUpdateInput} data - store data
 * @return {Store} - Updated store
 *
 */
const updateStore = async (shopUrl: string, data: Prisma.storeUpdateInput) => {
  console.log("log: updateStore");
  const updatedStore = await prisma.store.update({
    where: {
      shop_url: shopUrl,
    },
    data: {
      ...data,
    },
  });
  console.log("log: updateStore: updatedStore: ", updatedStore);
  return removeSensitiveKeys(updatedStore);
};

const setDefaultSettings = async (admin: AdminApiContext, shopUrl: string) => {
  console.log("log: setDefaultSettings: shopUrl: ", shopUrl);
  const store = await getStore(shopUrl);
  if (!store) {
    console.log("log: setDefaultSettings: store %s not found", shopUrl);
    return;
  }

  const { setup_complete } = store;
  if (setup_complete) {
    console.log("log: setDefaultSettings: default settings already added");
    return;
  }
  console.log("log: setDefaultSettings: adding default settings");

  const inputs = createMetafieldInputs(defaults.autosuggest, NAMESPACE_AUTOSUGGEST);
  inputs.push(...createMetafieldInputs(defaults.search, NAMESPACE_SEARCH));
  inputs.push(...createMetafieldInputs(defaults.search, NAMESPACE_CATEGORY));
  inputs.push(...createMetafieldInputs(defaults.recommendations, NAMESPACE_RECOMMENDATIONS));
  // the maximum metafields input limit is 25
  while (inputs.length) {
    const results = await upsertAppDataMetafields(admin, inputs.splice(0, 25));
    console.log("log: setDefaultSettings: results: ", results);
  }
  console.log("log: setDefaultSettings: setting `setup_complete` flag");
  await updateStore(shopUrl, { setup_complete: true });
};

const getAppSettings = async <T> (admin: AdminApiContext, namespace: string): Promise<T> => {
  console.log("log: getAppSettings: namespace: ", namespace);
  const fields = await getAppDataMetafields(admin, namespace) ?? [];
  const settings = metafieldsReducer(fields) as T;
  console.log("log: getAppSettings: result: ", settings);
  return settings;
};

const updateAccount = async (admin: AdminApiContext, account: Account) => {
  console.log("log: updateAccount: account: ", account);

  const inputs = createMetafieldInputs(account, NAMESPACE_ACCOUNT);

  if (inputs.length > 0) {
    const metafields = await upsertAppDataMetafields(admin, inputs);
    console.log("log: updateAccount: response data from upsert: ", metafields);

    const accountId = metafields?.find((metafield) => metafield.key === "account_id")?.value;
    if (accountId) {
      console.log("log: updateAccount: upsert webPixel: account_id: %s", accountId);
      await upsertWebPixel(admin, { settings: { account_id: accountId } });
    }
  }
};

const updateSettings = async <T> (admin: AdminApiContext, settings: T, namespace: string, marketId?: string) => {
  console.log("log: updateSettings: settings: %s, namespace: %s, marketId: %s", settings, namespace, marketId);

  const appNamespace = marketId ? `$app:${namespace}` : namespace;
  const ownerId = marketId || await getAppOwnerId(admin);
  if (!ownerId) {
    throw Error("App ID could not be fetched");
  }

  const inputs = createMetafieldInputs(settings as Record<string, any>, namespace).map(input => ({
    ...input,
    namespace: appNamespace,
    ownerId,
  }));

  if (marketId) {
    await getOrCreateMetaDefinitions(admin, appNamespace, MetafieldOwnerType.Market);
  }

  const metafields = await upsertMetafields(admin, inputs);
  console.log("log: updateSettings: response data: ", metafields);
};

const deleteSettings = async (admin: AdminApiContext, marketId: string, namespace: string) => {
  console.log("log: deleteSettings: marketId: %s, namespace: %s", marketId, namespace);
  const appNamespace = `$app:${namespace}`;
  const inputs = metaDefinitions[namespace].map(definition => ({
    ownerId: marketId,
    namespace: appNamespace,
    key: definition.key,
  }));

  const metafields = await deleteMetafields(admin, inputs);
  console.log("log: deleteSettings: response: ", metafields);
  return metafields;
};

const updateAllMarketSettings = async (admin: AdminApiContext, actions: SettingsAction[], namespace: string) => {
  console.log("log: updateAllMarketSettings: actions: ", actions);
  const appOwnerId = await getAppOwnerId(admin);
  if (!appOwnerId) {
    throw Error("App ID could not be fetched");
  }

  const saveInputs: MetafieldsSetInput[] = [];
  const deleteInputs: MetafieldIdentifierInput[] = [];
  actions.forEach((action) => {
    const { _action, marketId, ...settings } = action;
    const appNamespace = marketId ? `$app:${namespace}` : namespace;
    const ownerId = marketId ?? appOwnerId;

    if (_action === 'saveSettings') {
      const inputs = createMetafieldInputs(settings[namespace], namespace).map(input => ({
        ...input,
        namespace: appNamespace,
        ownerId,
      }));
      saveInputs.push(...inputs);
    } else if (_action === 'deleteSettings') {
      const inputs = metaDefinitions[namespace].map(definition => ({
        ownerId: marketId,
        namespace: appNamespace,
        key: definition.key,
      }));
      deleteInputs.push(...inputs);
    } else {
      console.log("warn: updateAllMarketSettings: Invalid action: ", action._action);
    }
  });

  await getOrCreateMetaDefinitions(admin, `$app:${namespace}`, MetafieldOwnerType.Market);
  if (saveInputs.length) {
    const metafields = await upsertMetafields(admin, saveInputs);
    console.log("log: updateAllMarketTemplates: saved metafields: ", metafields);
  }
  if (deleteInputs.length) {
    const metafields = await deleteMetafields(admin, deleteInputs);
    console.log("log: updateAllMarketTemplates: deleted metafields: ", metafields);
  }
};

const createMetafieldInputs = (obj: Record<string, any>, namespace: string): Omit<MetafieldsSetInput, "ownerId">[] => {
  const definitions = metaDefinitions[namespace];

  return Object.keys(obj).map((key) => {
    const value = obj[key];
    const type = definitions.find((definition) => definition.key === key)?.type;

    if (value === null || value === undefined || !type) {
      return null;
    }

    if (type === "boolean") {
      return {
        namespace,
        key,
        type,
        value: `${Boolean(value)}`,
      };
    }

    if (type === "number_integer") {
      return {
        namespace,
        key,
        type,
        value: Number(value).toFixed(0),
      };
    }

    if (type === "number_decimal") {
      return {
        namespace,
        key,
        type,
        value: Number(value).toString(),
      };
    }

    if (type === "json") {
      return {
        namespace,
        key,
        type,
        value: JSON.stringify(value),
      };
    }

    return {
      namespace,
      key,
      type,
      value: `${value}`,
    };
  }).filter(Boolean) as Omit<MetafieldsSetInput, "ownerId">[];
};

export {
  getStore,
  updateStore,
  uninstallStore,
  deleteStore,
  installStore,
  getAppSettings,
  updateAccount,
  removeSensitiveKeys,
  updateSettings,
  deleteSettings,
  updateAllMarketSettings,
};
