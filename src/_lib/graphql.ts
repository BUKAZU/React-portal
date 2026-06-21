import { http } from './http_client';
import { HTTPError } from 'ky';

/**
 * Interface for the GraphQL mutation options
 */
interface GraphQLMutationOptions<TVariables = Record<string, unknown>> {
  url?: string; // GraphQL endpoint URL
  query: string; // The GraphQL mutation string
  variables?: TVariables; // Variables for the mutation
  headers?: Record<string, string>; // Additional headers
}

/**
 * Executes a GraphQL mutation using the shared HTTP client.
 * Transient network-level errors are automatically retried by `ky` for GET
 * requests; POST requests (mutations) are intentionally excluded from retry
 * by ky's default method list to prevent duplicate side effects.
 * @template TData - The expected response data type
 * @template TVariables - The variables type for the mutation
 * @param {GraphQLMutationOptions<TVariables>} options - The mutation options
 * @returns {Promise<TData>} The response data
 * @throws {Error} When the request fails or returns errors
 */
export async function graphqlMutation<
  TData = any, // eslint-disable-line @typescript-eslint/no-explicit-any
  TVariables = Record<string, unknown>
>(options: GraphQLMutationOptions<TVariables>): Promise<TData> {
  const {
    url = 'https://api.bukazu.com/graphql',
    query,
    variables = {},
    headers = {}
  } = options;

  let result: { data: TData; errors?: Array<{ message: string }> };
  try {
    result = await http
      .post(url, { json: { query, variables }, headers })
      .json<{ data: TData; errors?: Array<{ message: string }> }>();
  } catch (error) {
    if (error instanceof HTTPError) {
      throw new Error(`HTTP error! status: ${error.response.status}`);
    }
    if (error instanceof Error) {
      throw new Error(`GraphQL mutation failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred during the GraphQL mutation');
  }

  // Check for GraphQL errors
  if (result.errors) {
    const errorMessage = result.errors
      .map((e) => e.message)
      .join('\n');
    throw new Error(`GraphQL Error: ${errorMessage}`);
  }

  return result.data;
}

