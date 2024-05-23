import prisma from "../db.server";
import { getMetafields, upsertAppDataMetafield } from "./admin.server";
import { setDefaultTemplates } from "./templates.server";

import type { AdminApiContext } from "node_modules/@shopify/shopify-app-remix/build/ts/server/clients";
import type { Account, Recommendations, Store } from "~/types/store";
import type { Prisma } from "@prisma/client";
import type { MetafieldsSetInput } from "~/types/admin.types";

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
  await prisma.session.deleteMany({
    where: {
      shop: shopUrl,
    },
  });
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

const getAccount = async (admin: AdminApiContext): Promise<Account> => {
  console.log("log: getAccount");
  const accountFields = await getMetafields(admin, "account");
  const account = accountFields?.reduce((prev, curr) => {
    if (curr.type === "boolean") {
      prev[curr.key] = curr.value === "true";
    } else {
      prev[curr.key] = curr.value;
    }
    return prev;
  }, {} as Record<string, any>) as Account;
  console.log("log: getAccount: account: ", account);
  return account;
};

const updateAccount = async (admin: AdminApiContext, account: Account) => {
  console.log("log: updateAccount: account: ", account);

  const input = Object.keys(account).map((key) => {
    const value = account[key as keyof Account];
    if (typeof value === 'string') {
      return {
        namespace: "account",
        key,
        type: "single_line_text_field",
        value,
      };
    } else if (typeof value === 'boolean') {
      return {
        namespace: "account",
        key,
        type: "boolean",
        value: `${value}`,
      };
    }
    return null;
  }).filter(Boolean) as Omit<MetafieldsSetInput, "ownerId">[];

  const metafields = await upsertAppDataMetafield(admin, input);
  console.log("log: updateAccount: response data: ", metafields);
  return metafields;
};

const getRecommendationsSettings = async (admin: AdminApiContext): Promise<Recommendations> => {
  console.log("log: getRecommendationsSettings");
  const recommendationsFields = await getMetafields(admin, "recommendations");
  const recommendations = recommendationsFields?.reduce((prev, curr) => {
    prev[curr.key] = curr.value;
    return prev;
  }, {} as Record<string, any>) as Recommendations;
  console.log("log: getRecommendations: recommendations settings: ", recommendations);
  return recommendations;
};

const updateRecommendationsSettings = async (admin: AdminApiContext, recommendations: Recommendations) => {
  console.log("log: updateRecommendationsSettings: recommendations settings: ", recommendations);

  const input = Object.keys(recommendations).map((key) => ({
    namespace: "recommendations",
    key,
    type: "single_line_text_field",
    value: recommendations[key as keyof Recommendations],
  })).filter(Boolean) as Omit<MetafieldsSetInput, "ownerId">[];

  const metafields = await upsertAppDataMetafield(admin, input);
  console.log("log: updateRecommendationsSettings: response data: ", metafields);
  return metafields;
};

export {
  getStore,
  updateStore,
  uninstallStore,
  deleteStore,
  installStore,
  getAccount,
  updateAccount,
  removeSensitiveKeys,
  getRecommendationsSettings,
  updateRecommendationsSettings,
};
