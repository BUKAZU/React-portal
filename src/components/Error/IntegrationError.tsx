import React from 'react';
import { FiltersType } from '../SearchPage/filters/filter_types';
import { normalizeLocale } from '../../_lib/locale';

interface Props {
  portalCode: string;
  pageType?: string;
  locale?: string;
  filters?: FiltersType;
}

export default function IntegrationError({
  portalCode,
  pageType,
  locale,
  filters
}: Props): JSX.Element | false {
  let errors: string[] = [];

  if (!portalCode) {
    let message = 'No portal code is specified, so portal is not working';
    console.error(message);
    errors.push(message);
  }

  if (pageType && pageType !== 'reviews') {
    let message = `'${pageType}' is not a valid page`;
    console.error(message);
    errors.push(message);
  }

  if (!locale) {
    console.warn('No locale is set; defaulting to English.');
  } else {
    const normalized = normalizeLocale(locale);
    const originalLanguage = locale.toLowerCase().split(/[-_]/)[0];
    if (normalized === 'en' && originalLanguage !== 'en') {
      console.warn(
        `Locale '${locale}' is not supported, defaulting to English`
      );
    }
  }

  if (filters && !isObject(filters)) {
    let message = 'Filters variable is not an object';
    console.error(message, filters);
  }

  if (errors.length == 0) {
    return false;
  }

  return (
    <div>
      <h2>Something went wrong please try again </h2>
      <ul>
        {errors.map((err) => (
          <li>{err}</li>
        ))}
      </ul>
    </div>
  );
}

const isObject = (obj: any) => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};
