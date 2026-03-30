import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';

/** Maximum number of times a failed network request is retried. */
export const MAX_RETRY_ATTEMPTS = 5;

/**
 * Creates an ApolloClient configured with a RetryLink so that transient
 * network failures are automatically retried with exponential back-off
 * and jitter before the error is surfaced to the UI.
 */
export function createApolloClient(
  uri: string,
  locale: string
): ApolloClient<object> {
  const httpLink = new HttpLink({ uri, headers: { locale } });

  const retryLink = new RetryLink({
    delay: { initial: 300, jitter: true },
    attempts: {
      max: MAX_RETRY_ATTEMPTS,
      retryIf: (error): boolean => {
        // Only retry when a network-level error is present.
        const networkError = (error as { networkError?: unknown }).networkError as {
          statusCode?: number;
        } | null | undefined;

        if (!networkError) {
          return false;
        }

        const statusCode = (networkError as { statusCode?: number }).statusCode;
        if (typeof statusCode === 'number') {
          // Retry on common transient HTTP status codes.
          if (statusCode === 408 || statusCode === 429) {
            return true;
          }
          if (statusCode >= 500 && statusCode < 600) {
            return true;
          }
          return false;
        }

        // If there is a networkError but no explicit status code, treat it as transient.
        return true;
      }
    }
  });

  return new ApolloClient({
    link: from([retryLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network'
      }
    }
  });
}
