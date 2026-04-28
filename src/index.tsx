import React, { useEffect, useMemo } from 'react';
import App from './components/App';
// import registerServiceWorker from './registerServiceWorker';

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import './styles/main.css';
import { IntegrationError } from './components/Error';
import { AppContext } from './components/AppContext';
import { LocaleType } from './types';
import { FiltersType } from './components/SearchPage/filters/filter_types';
import { loadLocale } from './_lib/date_helper';
import { createGraphQLRequestClient } from './_lib/graphql_request';
import { GraphQLClientContext } from './_lib/GraphQLClientContext';
import { initSentry, setSentryContext } from './_lib/sentry';

interface Props {
  portalCode: string;
  objectCode: string;
  pageType?: string;
  locale?: LocaleType;
  filters?: FiltersType;
  api_url?: string;
  sentryDsn?: string;
}

function Portal({
  portalCode,
  objectCode,
  pageType,
  locale,
  filters,
  api_url = 'https://api.bukazu.com/graphql',
  sentryDsn
}: Props): JSX.Element {
  const resolvedLocale: LocaleType = locale ?? 'en';

  // Create a per-portal GraphQL client synchronously during render so it is
  // available before any child useEffect runs – no global mutable config needed.
  const graphqlClient = useMemo(
    () => createGraphQLRequestClient(api_url, resolvedLocale),
    [api_url, resolvedLocale]
  );

  // All hooks must be called unconditionally before any conditional return
  // (React Rules of Hooks). IntegrationError is called as a plain function
  // below, which registers its internal useEffect into Portal's hook list.
  // Placing the Sentry effect here (before that call) ensures Sentry context
  // is always set before IntegrationError's reportMessage effect fires, since
  // React runs effects in registration order within a single component.
  useEffect(() => {
    if (sentryDsn) {
      initSentry(sentryDsn);
    }
    setSentryContext({ portalCode, objectCode, locale: resolvedLocale });
  }, [sentryDsn, portalCode, objectCode, resolvedLocale]);

  useEffect(() => {
    window.__localeId__ = resolvedLocale;
    void loadLocale(resolvedLocale);
  }, [resolvedLocale]);

  // IntegrationError is called as a plain function so its internal hooks are
  // appended to Portal's hook list (always, unconditionally). The early return
  // below is safe because all hooks have already been registered above.
  const errors = IntegrationError({
    portalCode,
    pageType,
    locale: resolvedLocale,
    filters
  });
  if (errors) {
    return errors;
  }

  const client = new ApolloClient({
    uri: api_url,
    cache: new InMemoryCache(),
    headers: {
      locale: resolvedLocale
    },
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network'
      }
    }
  });

  return (
    <GraphQLClientContext.Provider value={graphqlClient}>
      <ApolloProvider client={client}>
        <AppContext.Provider
          value={{ portalCode, objectCode, locale: resolvedLocale }}
        >
          <div className="bu-portal">
            <App pageType={pageType} locale={resolvedLocale} filters={filters} />
          </div>
        </AppContext.Provider>
      </ApolloProvider>
    </GraphQLClientContext.Provider>
  );
}

export default Portal;
