import { GraphQLError } from 'graphql';
import { GraphQLClient } from 'graphql-request';

interface GraphQLResponseError {
  response?: {
    errors?: readonly GraphQLError[];
  };
}

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

function hasGraphQLResponseErrors(
  error: unknown
): error is GraphQLResponseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    Array.isArray((error as GraphQLResponseError).response?.errors)
  );
}

export function toGraphQLErrors(error: unknown): GraphQLError[] {
  if (hasGraphQLResponseErrors(error) && error.response?.errors !== undefined) {
    return [...error.response.errors];
  }

  const message =
    error instanceof Error ? error.message : 'A GraphQL request failed';

  return [new GraphQLError(message)];
}
