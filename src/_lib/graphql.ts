/**
 * Interface for the GraphQL mutation options
 */
interface GraphQLMutationOptions<TVariables = Record<string, unknown>> {
  url?: string; // GraphQL endpoint URL
  query: string; // The GraphQL mutation string
  variables?: TVariables; // Variables for the mutation
  headers?: Record<string, string>; // Additional headers
}

/** Maximum number of times a failed network request is retried. */
export const MAX_RETRY_ATTEMPTS = 3;

/** Base delay in milliseconds before the first retry (doubles on each attempt). */
const BASE_RETRY_DELAY_MS = 300;

/** Returns true when the error is a network-level connection failure. */
function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes a GraphQL mutation using the fetch API.
 * Transient network-level errors (connection failures) are automatically
 * retried up to MAX_RETRY_ATTEMPTS times with exponential back-off.
 * @template TData - The expected response data type
 * @template TVariables - The variables type for the mutation
 * @param {GraphQLMutationOptions<TVariables>} options - The mutation options
 * @returns {Promise<TData>} The response data
 * @throws {Error} When the request fails or returns errors
 */
export async function graphqlMutation<
  TData = any,
  TVariables = Record<string, unknown>
>(options: GraphQLMutationOptions<TVariables>): Promise<TData> {
  const {
    url = 'https://api.bukazu.com/graphql',
    query,
    variables = {},
    headers = {}
  } = options;

  for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await sleep(BASE_RETRY_DELAY_MS * (1 << (attempt - 1)));
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Check for GraphQL errors
      if (result.errors) {
        const errorMessage = result.errors
          .map((error: { message: string }) => error.message)
          .join('\n');
        throw new Error(`GraphQL Error: ${errorMessage}`);
      }

      return result.data;
    } catch (error) {
      // Retry only on network-level connection failures (TypeError).
      if (isNetworkError(error) && attempt < MAX_RETRY_ATTEMPTS) {
        continue;
      }

      if (error instanceof Error) {
        throw new Error(`GraphQL mutation failed: ${error.message}`);
      }
      throw new Error('An unknown error occurred during the GraphQL mutation');
    }
  }

  /* istanbul ignore next -- unreachable; required for TypeScript's control-flow analysis */
  throw new Error('GraphQL mutation failed: Unknown error');
}
