import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import {
  normalizeCurrencies,
  readStoredCurrency,
  storeCurrency,
  type SettingsCurrencies
} from '../_lib/currencies';

export interface CurrencyContextValue {
  /**
   * The visitor's selected ISO 4217 currency code, or undefined when the
   * portal is single-currency — call sites then omit the request param, so
   * requests are identical to a portal without multi-currency support.
   */
  currency: string | undefined;
  /** Select a currency; codes outside the allowed list are ignored. */
  setCurrency: (currency: string) => void;
  /** The ISO 4217 currency codes the portal may quote and book in. */
  allowed: string[];
  /** Whether the portal offers the visitor a choice of currencies. */
  multiCurrency: boolean;
}

export const CurrencyContext = createContext<CurrencyContextValue>({
  currency: undefined,
  setCurrency: () => undefined,
  allowed: [],
  multiCurrency: false
});

interface Props {
  /** Currency configuration from the portal settings; absent on older backends. */
  currencies?: SettingsCurrencies;
  children: React.ReactNode;
}

export function CurrencyProvider({ currencies, children }: Props): JSX.Element {
  const normalized = useMemo(
    () => normalizeCurrencies(currencies),
    [currencies]
  );

  const [selected, setSelected] = useState<string>(() => {
    const stored = readStoredCurrency();
    return stored && normalized.allowed.includes(stored)
      ? stored
      : normalized.default;
  });

  const setCurrency = useCallback(
    (currency: string) => {
      if (!normalized.allowed.includes(currency)) {
        return;
      }
      storeCurrency(currency);
      setSelected(currency);
    },
    [normalized]
  );

  const effectiveMultiCurrency =
    normalized.multi_currency && normalized.allowed.length > 1;

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency: effectiveMultiCurrency ? selected : undefined,
      setCurrency,
      allowed: normalized.allowed,
      multiCurrency: effectiveMultiCurrency
    }),
    [effectiveMultiCurrency, normalized.allowed, selected, setCurrency]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext);
}
