import React, { useEffect, useRef, useState } from 'react';
import App from './components/App';
// import registerServiceWorker from './registerServiceWorker';

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import './styles/main.css';
import { IntegrationError } from './components/Error';
import { AppContext } from './components/AppContext';
import { LocaleType } from './types';
import { FiltersType } from './components/SearchPage/filters/filter_types';
import { loadLocale } from './_lib/date_helper';

interface Props {
  portalCode: string;
  objectCode: string;
  pageType?: string;
  locale?: LocaleType;
  filters?: FiltersType;
  api_url?: string;
}

function Portal({
  portalCode,
  objectCode,
  pageType,
  locale,
  filters,
  api_url = 'https://api.bukazu.com/graphql'
}: Props): JSX.Element {
  const resolvedLocale: LocaleType = locale ?? 'en';

  const errors = IntegrationError({
    portalCode,
    pageType,
    locale: resolvedLocale,
    filters
  });
  if (errors) {
    return errors;
  }

  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const current = ref.current;
    if (current) {
      setWidth(current.getBoundingClientRect().width);
    }
  }, [ref]);

  useEffect(() => {
    window.__localeId__ = resolvedLocale;
    void loadLocale(resolvedLocale);
  }, [resolvedLocale]);

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
    <ApolloProvider client={client}>
      <AppContext.Provider value={{ portalCode, objectCode, locale: resolvedLocale }}>
        <div ref={ref} className={width < 875 ? 'bu-smaller' : 'bu-large'}>
          <App pageType={pageType} locale={resolvedLocale} filters={filters} />
        </div>
      </AppContext.Provider>
    </ApolloProvider>
  );
}

export default Portal;
