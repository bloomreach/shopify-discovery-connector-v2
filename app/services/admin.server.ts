import { GraphQLError } from "~/models";
import type { Session } from "@shopify/shopify-api";
import type { MetafieldsSetInput } from "~/types/admin.types";
import type { Headers } from "@shopify/shopify-api/runtime";
import type { AdminApiContext } from "@shopify/shopify-app-remix/server";

/**
 *
 * Simple delay.
 * Use inside an async function.
 *
 * @param  {number} ms The delay in milliseconds.
 * @return {promise}
 * @example
 *
 * console.log('this will log now');
 * await sleep(1000);
 * console.log('this will log after 1000ms');
 *
 */
function sleep(ms: number) {
  console.log("log: sleep");
  console.log("log: sleep: ms:", ms);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 *
 * Throttles the next rest api call by delaying the
 * return based on the current rate limit header
 *
 * @param  {Headers} headers - Shopify rest api response headers
 * @example
 *
 * Delay increases the closer we get to our limit
 * - On call 10 of 40 => delay = ((10/40) * 100 * 10) = 250ms
 * - On call 32 of 40 => delay = ((32/40 * 100) * 10) = 800ms
 */
const throttleRestApi = async (headers?: Headers) => {
  console.log("log: throttleApi");
  console.log("log: throttleApi: headers: ", headers);
  const [request, MaxRequests] = (headers?.["x-shopify-shop-api-call-limit"] as string)?.split("/") ?? [];
  console.log("log: throttleApi: request: ", request);
  console.log("log: throttleApi: MaxRequests: ", MaxRequests);
  if (request && MaxRequests) {
    const delay = (parseInt(request) / parseInt(MaxRequests)) * 100 * 10;
    console.log("log: throttleApi: delay: ", delay);
    await sleep(delay);
  }
  console.log("log: throttleApi: delay resolved ...");
};

/**
 *
 * Throttles the next GraphQL api call by delaying the
 * return based on the current rate limit header
 *
 * @param  {object} extensions - Shopify GraphQL api response extensions object
 * @example
 *
 * Delay increases the closer we get to our limit
 * - On call 10 of 40 => delay = ((10/40) * 100 * 10) = 250ms
 * - On call 32 of 40 => delay = ((32/40 * 100) * 10) = 800ms
 */
const throttleGraphQLApi = async (extensions?: Record<string, any>) => {
  console.log("log: throttleApi");
  console.log("log: throttleApi: extensions: ", extensions);
  const { maximumAvailable, currentlyAvailable } = extensions?.cost?.throttleStatus ?? {};
  console.log("log: throttleApi: maximumAvailable: %d, currentlyAvailable: %d", maximumAvailable, currentlyAvailable);
  if (maximumAvailable && currentlyAvailable) {
    const delay = (1 - currentlyAvailable / maximumAvailable) * 100 * 10;
    console.log("log: throttleApi: delay: ", delay);
    await sleep(delay);
  }
  console.log("log: throttleApi: delay resolved ...");
};

const getAppOwnerId = async (admin: AdminApiContext) => {
  console.log("log: getAppOwnerId");
  const response = await admin.graphql(
    `#graphql
      query CurrentAppInstallation {
        currentAppInstallation {
          id
        }
      }
    `);

  const { data, extensions } = await response.json();
  console.log("log: getAppOwnerId: response data: ", data);
  await throttleGraphQLApi(extensions);
  return data?.currentAppInstallation.id;
};

const getMetafields = async (admin: AdminApiContext, namespace: string) => {
  console.log("log: getMetafields");
  const response = await admin.graphql(
    `#graphql
      query CurrentAppInstallationMetafields($namespace: String!) {
        currentAppInstallation {
          metafields(namespace: $namespace, first: 20) {
            nodes {
              id
              namespace
              key
              value
              type
            }
          }
        }
      }
    `,
    {
      variables: {
        namespace,
      }
    },
  );
  const { data, extensions } = await response.json();
  console.log("log: getMetafields: response data: ", data);
  await throttleGraphQLApi(extensions);
  return data?.currentAppInstallation.metafields.nodes;
}

const upsertAppDataMetafield = async (admin: AdminApiContext, metafields: Omit<MetafieldsSetInput, "ownerId">[]) => {
  console.log("log: upsertAppDataMetafield: metafields: ", metafields);
  const ownerId = await getAppOwnerId(admin);
  if (!ownerId) {
    throw Error("App ID could not be fetched");
  }
  const metafieldsSetInput: MetafieldsSetInput[] = metafields.map((metafield) => ({ ...metafield, ownerId }));
  const response = await admin.graphql(
    `#graphql
      mutation UpsertAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafieldsSetInput) {
          metafields {
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: {
        metafieldsSetInput,
      },
    },
  );

  const { data, extensions } = await response.json();
  console.log("log: upsertAppDataMetafield: response data: ", data);
  if (data?.metafieldsSet?.userErrors && data?.metafieldsSet?.userErrors.length > 0) {
    throw new GraphQLError(data?.metafieldsSet?.userErrors);
  }

  await throttleGraphQLApi(extensions);
  return data?.metafieldsSet?.metafields;
};

const getThemes = async (admin: AdminApiContext, session: Session) => {
  console.log("log: getThemes");
  const themes = await admin.rest.resources.Theme.all({ session });
  console.log("log: getThemes: response data: ", themes);
  await throttleRestApi(themes?.headers);
  return themes?.data;
};

export { getAppOwnerId, getMetafields, upsertAppDataMetafield, getThemes };
