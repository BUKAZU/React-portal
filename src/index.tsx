import React from 'react';
import App from './components/App';
import { IntlProvider } from 'react-intl';
// import registerServiceWorker from './registerServiceWorker';

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import en from './locales/en.json';
import nl from './locales/nl.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import it from './locales/it.json';

import './styles/main.css';
import { IntegrationError } from './components/Error';
import { AppContext } from './components/AppContext';
import { LocaleType } from './types';
import { FiltersType } from './components/SearchPage/filters/filter_types';
import { appsignal } from "./_lib/appsignal";
import { ErrorBoundary as AppsignalBoundary } from "@appsignal/react";

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
  api_url
}: Props): JSX.Element {
  const errors = IntegrationError({ portalCode, pageType, locale, filters });
  if (errors) {
    return errors;
  }

  if (!locale) {
    locale = 'en';
  }

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

  const messages: MessagesType = { en, nl, de, fr, es, it };

  window.__localeId__ = locale;

  return (
    <AppsignalBoundary instance={appsignal} tags={{ portalCode, pageType, locale, objectCode }} fallback={() => <FallbackComponent />}>
      <ApolloProvider client={client}>
        <IntlProvider locale={locale} messages={messages[locale]}>
          <AppContext.Provider value={{ portalCode, objectCode, locale }}>
            <App pageType={pageType} locale={locale} filters={filters} />
          </AppContext.Provider>
        </IntlProvider>
      </ApolloProvider>
    </AppsignalBoundary>
  );
}


const FallbackComponent = () => (
  <div>Uh oh! There was an error :(</div>
);

Portal.defaultProps = {
  pageType: null,
  api_url: 'https://api.bukazu.com/graphql'
};

export default Portal;

type MessagesType = {
  en: JSONType;
  nl: JSONType;
  de: JSONType;
  fr: JSONType;
  es: JSONType;
  it: JSONType;
};

type JSONType = {
  [key: string]: string;
};
