import React, { Component } from "react";
import App from "./components/App";
import { IntlProvider } from "react-intl";
import { addLocaleData } from "react-intl";
// import registerServiceWorker from './registerServiceWorker';

import { ApolloProvider } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

import enData from "react-intl/locale-data/en";
import frData from "react-intl/locale-data/fr";
import esData from "react-intl/locale-data/es";
import nlData from "react-intl/locale-data/nl";
import deData from "react-intl/locale-data/de";
import itData from "react-intl/locale-data/it";

import en from "./locales/en.json";
import nl from "./locales/nl.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import it from "./locales/it.json";

import "./index.css";

class Portal extends Component {
  render() {
    const { portalCode, objectCode, locale, filters } = this.props;

    let uri = "https://bukazu.eu/graphql";

    if (process.env.NODE_ENV !== "production") {
      // uri = 'https://stage.bukazu.eu/graphql';
    }
    const httpLink = createHttpLink({
      uri
    });

    const client = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache()
    });

    const messages = { en, nl, de, fr, es, it };

    addLocaleData([
      ...enData,
      ...frData,
      ...esData,
      ...nlData,
      ...itData,
      ...deData
    ]);

    //
    //   const elements = document.getElementsByClassName('bukazu-app');
    //   if (elements.length > 0) {
    //       for (let element of elements) {
    //           runApp(element);
    //       }
    //   } else if (elem) {
    //       runApp(elem);
    //   }
    window.__localeId__ = locale;

    // console.log({ filters });
    // if (filters) {
    //   filters = JSON.parse(filters);
    // } else {
    //   filters = {};
    // }

    return (
      <ApolloProvider client={client}>
        <IntlProvider locale={locale} messages={messages[locale]}>
          <App
            portalCode={portalCode}
            objectCode={objectCode}
            locale={locale}
            filters={filters}
          />
        </IntlProvider>
      </ApolloProvider>
    );
  }
}

export default Portal;
