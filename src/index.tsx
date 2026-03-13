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
  const errors = IntegrationError({ portalCode, pageType, locale, filters });
  if (errors) {
    return errors;
  }

  if (!locale) {
    locale = 'en';
  }

  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const current = ref.current;
    if (current) {
      setWidth(current.getBoundingClientRect().width);
    }
  }, [ref]);

  const client = new ApolloClient({
    uri: api_url,
    cache: new InMemoryCache(),
    headers: {
      locale
    },
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network'
      }
    }
  });

  window.__localeId__ = locale;
  // Fire-and-forget: ensures the locale module is cached before subsequent
  // re-renders so that FormatIntl always uses the correct locale.
  loadLocale(locale);

  return (
    <ApolloProvider client={client}>
      <AppContext.Provider value={{ portalCode, objectCode, locale }}>
        <div ref={ref} className={width < 875 ? 'bu-smaller' : 'bu-large'}>
          <App pageType={pageType} locale={locale} filters={filters} />
        </div>
      </AppContext.Provider>
    </ApolloProvider>
  );
}

export default Portal;
