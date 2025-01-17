import { GraphQLError, KEY_CATALOGS, KEY_VIEWS, metaDefinitions, NAMESPACE_ACCOUNT, NAMESPACE_AUTOSUGGEST, NAMESPACE_CATEGORY, NAMESPACE_SEARCH, NAMESPACE_TEMPLATES } from "~/models";
import { GraphqlQueryError, type Session } from "@shopify/shopify-api";

import type { MetafieldDefinition, MetafieldDefinitionInput, MetafieldIdentifier, MetafieldIdentifierInput, MetafieldsSetInput, WebPixel, WebPixelInput } from "~/types/admin.types";
import type { Headers } from "@shopify/shopify-api/runtime";
import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import type { Theme } from "node_modules/@shopify/shopify-api/dist/ts/rest/admin/2024-04/theme";
import type { MarketCatalogViewReturn, MarketTemplateReturn, MetafieldReturn } from "~/types/store";

enum MetafieldOwnerType {
  /** The Api Permission metafield owner type. */
  ApiPermission = 'API_PERMISSION',
  /** The Article metafield owner type. */
  Article = 'ARTICLE',
  /** The Blog metafield owner type. */
  Blog = 'BLOG',
  /** The Cart Transform metafield owner type. */
  Carttransform = 'CARTTRANSFORM',
  /** The Collection metafield owner type. */
  Collection = 'COLLECTION',
  /** The Company metafield owner type. */
  Company = 'COMPANY',
  /** The Company Location metafield owner type. */
  CompanyLocation = 'COMPANY_LOCATION',
  /** The Customer metafield owner type. */
  Customer = 'CUSTOMER',
  /** The Delivery Customization metafield owner type. */
  DeliveryCustomization = 'DELIVERY_CUSTOMIZATION',
  /** The Discount metafield owner type. */
  Discount = 'DISCOUNT',
  /** The Draft Order metafield owner type. */
  Draftorder = 'DRAFTORDER',
  /** The Fulfillment Constraint Rule metafield owner type. */
  FulfillmentConstraintRule = 'FULFILLMENT_CONSTRAINT_RULE',
  /** The Location metafield owner type. */
  Location = 'LOCATION',
  /** The Market metafield owner type. */
  Market = 'MARKET',
  /** The Media Image metafield owner type. */
  MediaImage = 'MEDIA_IMAGE',
  /** The Order metafield owner type. */
  Order = 'ORDER',
  /** The Order Routing Location Rule metafield owner type. */
  OrderRoutingLocationRule = 'ORDER_ROUTING_LOCATION_RULE',
  /** The Page metafield owner type. */
  Page = 'PAGE',
  /** The Payment Customization metafield owner type. */
  PaymentCustomization = 'PAYMENT_CUSTOMIZATION',
  /** The Product metafield owner type. */
  Product = 'PRODUCT',
  /**
   * The Product Image metafield owner type.
   * @deprecated `PRODUCTIMAGE` is deprecated. Use `MEDIA_IMAGE` instead.
   */
  Productimage = 'PRODUCTIMAGE',
  /** The Product Variant metafield owner type. */
  Productvariant = 'PRODUCTVARIANT',
  /** The Shop metafield owner type. */
  Shop = 'SHOP',
  /** The Validation metafield owner type. */
  Validation = 'VALIDATION'
}

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

const getAppOwnerId = async (admin: AdminApiContext): Promise<string | null> => {
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

const getAppDataMetafields = async (admin: AdminApiContext, namespace: string): Promise<MetafieldReturn[] | null> => {
  console.log("log: getAppDataMetafields: namespace: %s", namespace);
  const response = await admin.graphql(
    `#graphql
      query CurrentAppInstallationMetafields($namespace: String!) {
        currentAppInstallation {
          metafields(namespace: $namespace, first: 50) {
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
  console.log("log: getAppDataMetafields: response data: ", data);
  await throttleGraphQLApi(extensions);
  return data?.currentAppInstallation.metafields.nodes;
};

const getAppDataMetafield = async (admin: AdminApiContext, namespace: string, key: string): Promise<MetafieldReturn | null> => {
  console.log(`log: getAppDataMetafield: namespace: ${namespace}, key: ${key}`);
  const response = await admin.graphql(
    `#graphql
      query CurrentAppInstallationMetafield($namespace: String!, $key: String!) {
        currentAppInstallation {
          metafield(namespace: $namespace, key: $key) {
            id
            namespace
            key
            value
            type
          }
        }
      }
    `,
    {
      variables: {
        namespace,
        key,
      }
    },
  );
  const { data, extensions } = await response.json();
  console.log("log: getAppDataMetafield: response data: ", data);
  await throttleGraphQLApi(extensions);
  return data?.currentAppInstallation.metafield;
};

const upsertMetafields = async (admin: AdminApiContext, metafields: MetafieldsSetInput[]):
  Promise<MetafieldReturn[] | null> => {
    console.log("log: upsertMetafields: metafields: ", metafields);

    // filter out blank values as Shopify does not allow it
    const setInputs: MetafieldsSetInput[] = [];
    const deleteInputs: MetafieldIdentifierInput[] = [];
    metafields.forEach(field => {
      if (field.value && field.value.trim().length > 0) {
        setInputs.push(field);
      } else {
        deleteInputs.push({
          namespace: field.namespace!,
          key: field.key,
          ownerId: field.ownerId,
        });
      }
    });

    if (deleteInputs.length > 0) {
      await deleteMetafields(admin, deleteInputs);
    }

    if (setInputs.length <= 0) {
      console.log("warn: upsertMetafields: all fields are blank");
      return [];
    }

    const response = await admin.graphql(
      `#graphql
        mutation UpsertMetafields($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              namespace
              key
              value
              type
            }
            userErrors {
              field
              message
            }
          }
        }`,
      {
        variables: {
          metafields: setInputs,
        },
      },
    );
    const { data, extensions } = await response.json();
    console.log("log: upsertMetafields: response data: ", data);
    if (data?.metafieldsSet?.userErrors && data?.metafieldsSet?.userErrors.length > 0) {
      throw new GraphQLError(data?.metafieldsSet?.userErrors);
    }
    await throttleGraphQLApi(extensions);

    return data?.metafieldsSet?.metafields;
  };

const upsertAppDataMetafields = async (admin: AdminApiContext, metafields: Omit<MetafieldsSetInput, 'ownerId'>[]):
  Promise<MetafieldReturn[] | null> => {
    console.log("log: upsertAppDataMetafield: metafields: ", metafields);
    const ownerId = await getAppOwnerId(admin);
    if (!ownerId) {
      throw Error("App ID could not be fetched");
    }
    const metafieldsSetInput: MetafieldsSetInput[] = metafields.map((metafield) => ({ ...metafield, ownerId }));
    return upsertMetafields(admin, metafieldsSetInput);
};

const deleteAppDataMetafields = async (admin: AdminApiContext, metafields: Omit<MetafieldIdentifierInput, 'ownerId'>[]):
  Promise<MetafieldIdentifier[] | null> => {
    console.log("log: deleteAppDataMetafields: metafields: ", metafields);
    const ownerId = await getAppOwnerId(admin);
    if (!ownerId) {
      throw Error("App ID could not be fetched");
    }
    const metafieldsInput: MetafieldIdentifierInput[] = metafields.map((metafield) => ({ ...metafield, ownerId }));
    return deleteMetafields(admin, metafieldsInput);
};

const deleteMetafields = async (admin: AdminApiContext, metafields: MetafieldIdentifierInput[]): Promise<MetafieldIdentifier[] | null> => {
  console.log("log: deleteMetafields: metafields: ", metafields);
  const response = await admin.graphql(
    `#graphql
      mutation DeleteMetafields($metafields: [MetafieldIdentifierInput!]!) {
        metafieldsDelete(metafields: $metafields) {
          deletedMetafields {
            namespace
            key
            ownerId
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: {
        metafields,
      },
    },
  );

  const { data, extensions } = await response.json();
  console.log("log: deleteMetafields: response data: ", data);
  if (data?.metafieldDelete?.userErrors && data?.metafieldDelete?.userErrors.length > 0) {
    throw new GraphQLError(data?.metafieldDelete?.userErrors);
  }

  await throttleGraphQLApi(extensions);
  return data?.metafieldsDelete?.deletedMetafields;
};

const getThemes = async (admin: AdminApiContext, session: Session): Promise<Theme[] | null> => {
  console.log("log: getThemes");
  const themes = await admin.rest.resources.Theme.all({ session });
  console.log("log: getThemes: response data: ", themes);
  await throttleRestApi(themes?.headers);
  return themes?.data;
};

const marketQuery = `
  id
  name
  handle
  primary
  enabled
`;

const getMarketsWithCatalogsViews = async (admin: AdminApiContext): Promise<MarketCatalogViewReturn[] | null> => {
  console.log("log: getMarketsWithCatalogsViews");

  const response = await admin.graphql(
    `#graphql
      query Markets {
        markets(first: 50) {
          nodes {
            ${marketQuery}
            regions(first: 250) {
              nodes {
                ... on MarketRegionCountry {
                  code
                  name
                }
              }
            }
            webPresence {
              rootUrls {
                locale
                url
              }
            }
            brCatalogs: metafield(namespace: "$app:${NAMESPACE_ACCOUNT}", key: "${KEY_CATALOGS}") {
              value
            }
            brViews: metafield(namespace: "$app:${NAMESPACE_ACCOUNT}", key: "${KEY_VIEWS}") {
              value
            }
          }
        }
      }
    `,
  );

  const { data, extensions } = await response.json();
  console.log("log: getMarketsWithCatalogsViews: response data: ", data);
  await throttleGraphQLApi(extensions);
  return data?.markets?.nodes;
};

const getMarketsForNamespace = async (admin: AdminApiContext, namespace: string): Promise<MarketTemplateReturn[] | null> => {
  console.log("log: getMarketsForNamespace: namespace: ", namespace);

  let metafieldsQuery =
    `${namespace}Template: metafield(namespace: "$app:${NAMESPACE_TEMPLATES}", key: "${namespace}") {
      value
    }
    ${namespace}TemplateVersion: metafield(namespace: "$app:${NAMESPACE_TEMPLATES}", key: "${namespace}_version") {
      value
    }`;
  if (namespace === NAMESPACE_SEARCH || namespace === NAMESPACE_CATEGORY) {
    metafieldsQuery += `
      ${namespace}ListTemplate: metafield(namespace: "$app:${NAMESPACE_TEMPLATES}", key: "${namespace}_product_list") {
        value
      }
      ${namespace}ListTemplateVersion: metafield(namespace: "$app:${NAMESPACE_TEMPLATES}", key: "${namespace}_product_list_version") {
        value
      }`;
  } else if (namespace === NAMESPACE_AUTOSUGGEST) {
    metafieldsQuery += `
      ${namespace}Settings: metafields(namespace: "$app:${namespace}", first: 10) {
        nodes {
          key, value
        }
      }`;
  }

  const response = await admin.graphql(
    `#graphql
      query Markets {
        markets(first: 50) {
          nodes {
            ${marketQuery}
            ${metafieldsQuery}
          }
        }
      }
    `,
  );

  const { data, extensions } = await response.json();
  console.log("log: getMarketsForNamespace: response data: ", data);
  await throttleGraphQLApi(extensions);
  return data?.markets?.nodes;
};

const getWebPixelId = async (admin: AdminApiContext): Promise<string | null> => {
  console.log("log: getWebPixel");

  try {
    const response = await admin.graphql(
      `#graphql
        query WebPixel {
          webPixel {
            id
          }
        }
      `,
    );

    const { data, extensions } = await response.json();
    console.log("log: getWebPixel: response data: ", data);
    await throttleGraphQLApi(extensions);
    return data?.webPixel?.id;
  } catch (error) {
    if (error instanceof GraphqlQueryError && error.response.status === 200) {
      console.log("No webPixel found. ", error);
      return null;
    }

    throw error;
  }
};

const upsertWebPixel = async (admin: AdminApiContext, webPixel: WebPixelInput): Promise<WebPixel | null> => {
  console.log("log: upsertWebPixel: webPixel: %s", webPixel);
  const webPixelId = await getWebPixelId(admin);

  let mutation = '';
  if (webPixelId) {
    console.log("log: upsertWebPixel: update webPixel: %s, webPixelId: %s", webPixel, webPixelId);
    mutation = `#graphql
      mutation webPixelUpdate($webPixel: WebPixelInput!) {
        webPixelUpdate(id: "${webPixelId}", webPixel: $webPixel) {
          userErrors {
            field
            message
          }
          webPixel {
            id
            settings
          }
        }
      }`;
  } else {
    console.log("log: upsertWebPixel: create webPixel: ", webPixel);
    mutation = `#graphql
      mutation webPixelCreate($webPixel: WebPixelInput!) {
        webPixelCreate(webPixel: $webPixel) {
          userErrors {
            field
            message
          }
          webPixel {
            id
            settings
          }
        }
      }`;
  }

  const response = await admin.graphql(
    `${mutation}`,
    {
      variables: {
        webPixel
      },
    },
  );

  const { data, extensions } = await response.json();
  console.log("log: upsertWebPixel: response data: ", data);
  const webPixelWrapper = webPixelId ? data?.webPixelUpdate : data?.webPixelCreate;
  if (webPixelWrapper?.userErrors && webPixelWrapper?.userErrors.length > 0) {
    throw new GraphQLError(webPixelWrapper?.userErrors);
  }

  await throttleGraphQLApi(extensions);
  return webPixelWrapper?.webPixel;
};

const getMetaDefinitions = async (admin: AdminApiContext, namespace: string, ownerType: MetafieldOwnerType): Promise<MetafieldDefinition[] | null> => {
  console.log("log: getMetaDefinitions: namespace: %s, ownerType: %s", namespace, ownerType);

  const response = await admin.graphql(
    `#graphql
      query MetafieldDefinitions($namespace: String!, $ownerType: MetafieldOwnerType!) {
        metafieldDefinitions(namespace: $namespace, ownerType: $ownerType, first: 50) {
          nodes {
            id
            key
            name
            type {
              name
            }
          }
        }
      }
    `,
    {
      variables: {
        namespace,
        ownerType,
      }
    }
  );

  const { data, extensions } = await response.json();
  console.log("log: getMetaDefinitions: response data: ", data);
  await throttleGraphQLApi(extensions);
  return data?.metafieldDefinitions?.nodes;
}

const createMetaDefinition = async (admin: AdminApiContext, definition: MetafieldDefinitionInput): Promise<MetafieldDefinition | null> => {
  console.log("log: createMetaDefinitions: definition: ", definition);

  const response = await admin.graphql(
    `#graphql
      mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition {
            id
            name
            key
            type {
              name
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    {
      variables: {
        definition: {
          ...definition,
          ...(definition.ownerType === MetafieldOwnerType.ApiPermission ? {} : {
            access: {
              admin: "MERCHANT_READ_WRITE",
              storefront: "PUBLIC_READ",
            }
          }),
        }
      }
    }
  );

  const { data, extensions } = await response.json();
  console.log("log: createMetaDefinitions: response data: ", data);
  if (data?.metafieldDefinitionCreate?.userErrors && data?.metafieldDefinitionCreate?.userErrors.length > 0) {
    // ignore if definition already exists
    if (data.metafieldDefinitionCreate.userErrors[0].code !== "TAKEN") {
      throw new GraphQLError(data?.metafieldDefinitionCreate?.userErrors);
    }
  }

  await throttleGraphQLApi(extensions);
  return data?.metafieldDefinitionCreate?.createdDefinition;
};

const getOrCreateMetaDefinitions = async (admin: AdminApiContext, namespace: string, ownerType: MetafieldOwnerType): Promise<MetafieldDefinition[]> => {
  console.log("log: getOrCreateMetaDefinitions: namespace: %s, ownerType: %s", namespace, ownerType);
  const definitions = await getMetaDefinitions(admin, namespace, ownerType) ?? [];
  const rootNamespace = namespace.startsWith("$app:") ? namespace.slice(5) : namespace;
  const promises = metaDefinitions[rootNamespace].filter((input) => !definitions.some((definition) => definition.key === input.key))
    .map((definition) => createMetaDefinition(admin, { ...definition, namespace, ownerType }));

  try {
    (await Promise.all(promises)).filter(Boolean).forEach((definition) => definitions.push(definition!));
  } catch(e) {
    console.log("error: getOrCreateMetaDefinitions: Failed to create MetafieldDefinition: ", e);
  }

  return definitions;
};

export {
  getAppOwnerId,
  getAppDataMetafields,
  getAppDataMetafield,
  upsertMetafields,
  upsertAppDataMetafields,
  deleteAppDataMetafields,
  deleteMetafields,
  getThemes,
  getMarketsWithCatalogsViews,
  getMarketsForNamespace,
  getWebPixelId,
  upsertWebPixel,
  getOrCreateMetaDefinitions,
  MetafieldOwnerType,
};
