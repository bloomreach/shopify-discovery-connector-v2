/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as AdminTypes from './admin.types.d.ts';

export type PopulateProductMutationVariables = AdminTypes.Exact<{
  input: AdminTypes.ProductInput;
}>;


export type PopulateProductMutation = { productCreate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<(
      Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status'>
      & { variants: { edges: Array<{ node: Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'barcode' | 'createdAt'> }> } }
    )> }> };

export type CurrentAppInstallationQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type CurrentAppInstallationQuery = { currentAppInstallation: Pick<AdminTypes.AppInstallation, 'id'> };

export type CurrentAppInstallationMetafieldsQueryVariables = AdminTypes.Exact<{
  namespace: AdminTypes.Scalars['String']['input'];
}>;


export type CurrentAppInstallationMetafieldsQuery = { currentAppInstallation: { metafields: { nodes: Array<Pick<AdminTypes.Metafield, 'id' | 'namespace' | 'key' | 'value' | 'type'>> } } };

export type UpsertAppDataMetafieldMutationVariables = AdminTypes.Exact<{
  metafieldsSetInput: Array<AdminTypes.MetafieldsSetInput> | AdminTypes.MetafieldsSetInput;
}>;


export type UpsertAppDataMetafieldMutation = { metafieldsSet?: AdminTypes.Maybe<{ metafields?: AdminTypes.Maybe<Array<Pick<AdminTypes.Metafield, 'namespace' | 'key' | 'value'>>>, userErrors: Array<Pick<AdminTypes.MetafieldsSetUserError, 'field' | 'message'>> }> };

interface GeneratedQueryTypes {
  "#graphql\n      query CurrentAppInstallation {\n        currentAppInstallation {\n          id\n        }\n      }\n    ": {return: CurrentAppInstallationQuery, variables: CurrentAppInstallationQueryVariables},
  "#graphql\n      query CurrentAppInstallationMetafields($namespace: String!) {\n        currentAppInstallation {\n          metafields(namespace: $namespace, first: 20) {\n            nodes {\n              id\n              namespace\n              key\n              value\n              type\n            }\n          }\n        }\n      }\n    ": {return: CurrentAppInstallationMetafieldsQuery, variables: CurrentAppInstallationMetafieldsQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n      mutation populateProduct($input: ProductInput!) {\n        productCreate(input: $input) {\n          product {\n            id\n            title\n            handle\n            status\n            variants(first: 10) {\n              edges {\n                node {\n                  id\n                  price\n                  barcode\n                  createdAt\n                }\n              }\n            }\n          }\n        }\n      }": {return: PopulateProductMutation, variables: PopulateProductMutationVariables},
  "#graphql\n      mutation UpsertAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {\n        metafieldsSet(metafields: $metafieldsSetInput) {\n          metafields {\n            namespace\n            key\n            value\n          }\n          userErrors {\n            field\n            message\n          }\n        }\n      }": {return: UpsertAppDataMetafieldMutation, variables: UpsertAppDataMetafieldMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
