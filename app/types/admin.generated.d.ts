/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type CurrentAppInstallationQueryVariables = StorefrontAPI.Exact<{ [key: string]: never; }>;


export type CurrentAppInstallationQuery = { currentAppInstallation: Pick<StorefrontAPI.AppInstallation, 'id'> };

export type CurrentAppInstallationMetafieldsQueryVariables = StorefrontAPI.Exact<{
  namespace: StorefrontAPI.Scalars['String']['input'];
}>;


export type CurrentAppInstallationMetafieldsQuery = { currentAppInstallation: { metafields: { nodes: Array<Pick<StorefrontAPI.Metafield, 'id' | 'namespace' | 'key' | 'value' | 'type'>> } } };

export type UpsertAppDataMetafieldMutationVariables = StorefrontAPI.Exact<{
  metafieldsSetInput: Array<StorefrontAPI.MetafieldsSetInput> | StorefrontAPI.MetafieldsSetInput;
}>;


export type UpsertAppDataMetafieldMutation = { metafieldsSet?: StorefrontAPI.Maybe<{ metafields?: StorefrontAPI.Maybe<Array<Pick<StorefrontAPI.Metafield, 'namespace' | 'key' | 'value'>>>, userErrors: Array<Pick<StorefrontAPI.MetafieldsSetUserError, 'field' | 'message'>> }> };

interface GeneratedQueryTypes {
  "#graphql\n      query CurrentAppInstallation {\n        currentAppInstallation {\n          id\n        }\n      }\n    ": {return: CurrentAppInstallationQuery, variables: CurrentAppInstallationQueryVariables},
  "#graphql\n      query CurrentAppInstallationMetafields($namespace: String!) {\n        currentAppInstallation {\n          metafields(namespace: $namespace, first: 20) {\n            nodes {\n              id\n              namespace\n              key\n              value\n              type\n            }\n          }\n        }\n      }\n    ": {return: CurrentAppInstallationMetafieldsQuery, variables: CurrentAppInstallationMetafieldsQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n      mutation UpsertAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {\n        metafieldsSet(metafields: $metafieldsSetInput) {\n          metafields {\n            namespace\n            key\n            value\n          }\n          userErrors {\n            field\n            message\n          }\n        }\n      }": {return: UpsertAppDataMetafieldMutation, variables: UpsertAppDataMetafieldMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
