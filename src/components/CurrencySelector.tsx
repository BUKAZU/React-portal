import React from 'react';
import { t } from '../intl';
import { useCurrency } from './CurrencyContext';

/**
 * Dropdown for the visitor's display/booking currency. Renders nothing on a
 * single-currency portal, so it can be mounted unconditionally.
 */
function CurrencySelector(): JSX.Element | null {
  const { currency, setCurrency, allowed, multiCurrency } = useCurrency();

  if (!multiCurrency || allowed.length <= 1) {
    return null;
  }

  return (
    <div className="bu-currency-selector">
      <label htmlFor="bu-currency">{t('currency')}</label>
      <select
        id="bu-currency"
        value={currency}
        onChange={(event) => {
          setCurrency(event.target.value);
        }}
      >
        {allowed.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CurrencySelector;
