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
 * Executes a GraphQL mutation using the fetch API
 * @template TData - The expected response data type
 * @template TVariables - The variables type for the mutation
 * @param {GraphQLMutationOptions<TVariables>} options - The mutation options
 * @returns {Promise<TData>} The response data
 * @throws {Error} When the request fails or returns errors
 */
export async function graphqlMutation<TData = any, TVariables = Record<string, unknown>>(
    options: GraphQLMutationOptions<TVariables>
): Promise<TData> {
    const { url = 'https://api.bukazu.com/graphql', query, variables = {}, headers = {} } = options;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify({
                query,
                variables,
            }),
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
        // Improve error handling with more context
        if (error instanceof Error) {
            throw new Error(`GraphQL mutation failed: ${error.message}`);
        }
        throw new Error('An unknown error occurred during the GraphQL mutation');
    }
}