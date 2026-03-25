import React, { useEffect } from 'react';
import { FiltersType } from '../SearchPage/filters/filter_types';
import { reportMessage } from '../../_lib/sentry';

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
    console.warn('No locale is set default to English');
  } else {
    if (!['nl', 'de', 'en', 'fr', 'it', 'es'].includes(locale)) {
      errors.push('Invalid locale');
    }
  }

  if (filters && !isObject(filters)) {
    let message = 'Filters variable is not an object';
    console.error(message, filters);
  }

  // Report to Sentry only when the error set changes (not on every re-render).
  // errorsKey is used instead of the `errors` array itself so the effect only
  // re-fires when the serialised content changes, not on every render (arrays
  // are new references each render and would make the dependency unstable).
  const errorsKey = JSON.stringify(errors);
  useEffect(() => {
    errors.forEach((message) => reportMessage(message));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `errors` is
    // intentionally excluded: we depend on the derived `errorsKey` string so
    // the effect only fires when the set of validation messages actually changes.
  }, [errorsKey]);

  if (errors.length === 0) {
    return false;
  }

  return (
    <div>
      <h2>Something went wrong please try again </h2>
      <ul>
        {errors.map((err) => (
          <li key={err}>{err}</li>
        ))}
      </ul>
    </div>
  );
}

const isObject = (obj: any) => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};
