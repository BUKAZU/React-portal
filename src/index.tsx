import React, { useEffect } from 'react';
import App from './components/App';
// import registerServiceWorker from './registerServiceWorker';

import './styles/main.css';
import { IntegrationError } from './components/Error';
import { AppContext } from './components/AppContext';
import { LocaleType } from './types';
import { FiltersType } from './components/SearchPage/filters/filter_types';
import { loadLocale } from './_lib/date_helper';
import { normalizeLocale } from './_lib/locale';

interface Props {
  portalCode: string;
  objectCode: string;
  pageType?: string;
  locale?: string;
  filters?: FiltersType;
  /**
   * Origin of the Bukazu API. Only the origin is used, so the GraphQL URL
   * that older embedders pass ("https://api.bukazu.com/graphql") still works.
   */
  api_url?: string;
}

function Portal({
  portalCode,
  objectCode,
  pageType,
  locale,
  filters,
  api_url = 'https://api.bukazu.com'
}: Props): JSX.Element {
  const resolvedLocale: LocaleType = normalizeLocale(locale);

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

  return (
    <AppContext.Provider
      value={{
        portalCode,
        objectCode,
        locale: resolvedLocale,
        apiUrl: api_url
      }}
    >
      <div className="bu-portal">
        <App pageType={pageType} locale={resolvedLocale} filters={filters} />
      </div>
    </AppContext.Provider>
  );
}

export default Portal;
