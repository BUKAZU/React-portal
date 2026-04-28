import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { GraphQLClient } from 'graphql-request';

export function createGraphQLRequestClient(
  apiUrl: string,
  locale: string
): GraphQLClient {
  return new GraphQLClient(apiUrl, {
    headers: {
      locale
    }
  });
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
