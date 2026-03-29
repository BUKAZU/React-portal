import { ApolloClient } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { createApolloClient, MAX_RETRY_ATTEMPTS } from '../apollo_client';

// HttpLink requires a global fetch to be available in the test environment
const mockFetch = jest.fn();
// @ts-ignore – polyfilling fetch for the test environment
global.fetch = mockFetch;

describe('createApolloClient', () => {
  it('returns an ApolloClient instance', () => {
    const client = createApolloClient('https://api.bukazu.com/graphql', 'en');
    expect(client).toBeInstanceOf(ApolloClient);
  });

  it('uses cache-and-network fetch policy by default', () => {
    const client = createApolloClient('https://api.bukazu.com/graphql', 'en');
    expect(client.defaultOptions.watchQuery?.fetchPolicy).toBe(
      'cache-and-network'
    );
  });

  it('creates separate client instances per call', () => {
    const client1 = createApolloClient('https://api.bukazu.com/graphql', 'en');
    const client2 = createApolloClient('https://api.bukazu.com/graphql', 'nl');
    expect(client1).not.toBe(client2);
  });

  it('exposes MAX_RETRY_ATTEMPTS as a positive integer', () => {
    expect(typeof MAX_RETRY_ATTEMPTS).toBe('number');
    expect(MAX_RETRY_ATTEMPTS).toBeGreaterThan(0);
    expect(Number.isInteger(MAX_RETRY_ATTEMPTS)).toBe(true);
  });

  it('includes a RetryLink in the link chain', () => {
    const client = createApolloClient('https://api.bukazu.com/graphql', 'en');
    // ApolloClient exposes the concatenated link via `client.link`
    const link = client.link;
    // Walk the chain looking for a RetryLink instance
    function hasRetryLink(l: object | null): boolean {
      if (!l) return false;
      if (l instanceof RetryLink) return true;
      const asAny = l as Record<string, unknown>;
      if (asAny['left'] && hasRetryLink(asAny['left'] as object)) return true;
      if (asAny['right'] && hasRetryLink(asAny['right'] as object)) return true;
      return false;
    }
    expect(hasRetryLink(link)).toBe(true);
  });
});
