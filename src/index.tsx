import React, { useEffect, useRef, useState } from 'react';
import App from './components/App';
// import registerServiceWorker from './registerServiceWorker';

import { initClient } from './_lib/graphqlClient';

import './styles/main.css';
import { IntegrationError } from './components/Error';
import { AppContext } from './components/AppContext';
import { LocaleType } from './types';
import { FiltersType } from './components/SearchPage/filters/filter_types';

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
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.getBoundingClientRect().width);
    }
  }, [ref.current]);

  initClient(api_url, locale);

  window.__localeId__ = locale;

  return (
    <AppContext.Provider value={{ portalCode, objectCode, locale }}>
      <div ref={ref} className={width < 875 ? 'bu-smaller' : 'bu-large'}>
        <App pageType={pageType} locale={locale} filters={filters} />
      </div>
    </AppContext.Provider>
  );
}

export default Portal;
