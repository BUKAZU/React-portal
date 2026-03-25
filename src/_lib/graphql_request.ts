import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import {
  GraphQLClient,
  type RequestDocument,
  type Variables
} from 'graphql-request';

interface GraphQLRequestConfig {
  apiUrl: string;
  locale: string;
  headers: Record<string, string>;
}

const runtimeConfig: GraphQLRequestConfig = {
  apiUrl: 'https://api.bukazu.com/graphql',
  locale: 'en',
  headers: {}
};

export function setGraphQLRequestConfig(
  updates: Partial<GraphQLRequestConfig>
): void {
  if (updates.apiUrl) {
    runtimeConfig.apiUrl = updates.apiUrl;
  }
  if (updates.locale) {
    runtimeConfig.locale = updates.locale;
  }
  if (updates.headers) {
    runtimeConfig.headers = { ...runtimeConfig.headers, ...updates.headers };
  }
}

export function createGraphQLRequestClient(): GraphQLClient {
  return new GraphQLClient(runtimeConfig.apiUrl, {
    headers: {
      locale: runtimeConfig.locale,
      ...runtimeConfig.headers
    }
  });
}

export async function requestGraphQL<
  TData,
  TVariables extends Variables = Variables
>(
  query: RequestDocument,
  variables?: TVariables
): Promise<TData> {
  const client = createGraphQLRequestClient();
  return client.request<TData, TVariables>(query, variables);
}

export function toApolloError(error: unknown): ApolloError {
  if (error instanceof ApolloError) {
    return error;
  }

  const message =
    error instanceof Error ? error.message : 'A GraphQL request failed';

  return new ApolloError({
    graphQLErrors: [new GraphQLError(message)]
  });
}