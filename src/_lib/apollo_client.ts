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
    attempts: { max: MAX_RETRY_ATTEMPTS }
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
