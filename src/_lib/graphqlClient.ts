import { GraphQLClient } from 'graphql-request';

let clientInstance: GraphQLClient | null = null;
let currentUrl: string | null = null;
let currentLocale: string | null = null;

/**
 * Initialises (or re-initialises) the singleton GraphQL client.
 * Re-creates the client only when url or locale actually changes.
 */
export function initClient(url: string, locale: string): void {
  if (clientInstance && url === currentUrl && locale === currentLocale) {
    return;
  }
  clientInstance = new GraphQLClient(url, {
    headers: {
      locale
    }
  });
  currentUrl = url;
  currentLocale = locale;
}

/**
 * Returns the current singleton GraphQL client.
 * Falls back to the default production URL when initClient has not been called yet
 * (e.g. in unit tests or when the library is used without the Portal wrapper).
 */
export function getClient(): GraphQLClient {
  if (!clientInstance) {
    clientInstance = new GraphQLClient('https://api.bukazu.com/graphql');
  }
  return clientInstance;
}
