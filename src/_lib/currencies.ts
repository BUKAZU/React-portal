/**
 * Multi-currency support. The settings endpoint exposes which currencies a
 * portal may quote and book in (see `portal_settings.ts`); this module
 * normalizes that configuration for the UI and remembers the visitor's choice.
 */

/** Currency configuration as returned by the settings endpoint. */
export type SettingsCurrencies = {
  /** Whether the portal offers the visitor a choice of currencies. */
  multi_currency: boolean;
  /** The landlord's default ISO 4217 currency code. */
  default: string;
  /** The ISO 4217 currency codes the portal may quote and book in. */
  allowed: string[];
};

const STORAGE_KEY = 'bukazuCurrency';

/**
 * Normalize the settings' currency configuration into a shape the UI can rely
 * on: the field is absent on older backends (treated as single-currency EUR),
 * the default is always part of the allowed list, and duplicates are dropped.
 */
export function normalizeCurrencies(
  input?: Partial<SettingsCurrencies> | null
): SettingsCurrencies {
  const fallback =
    typeof input?.default === 'string' && input.default !== ''
      ? input.default
      : 'EUR';

  const given = Array.isArray(input?.allowed)
    ? input.allowed.filter(
        (code): code is string => typeof code === 'string' && code !== ''
      )
    : [];

  return {
    multi_currency: input?.multi_currency ?? false,
    default: fallback,
    allowed: [...new Set([...given, fallback])]
  };
}

/**
 * The visitor's previously chosen currency, or null when none was stored.
 * Storage can throw in embedded contexts (blocked site data, sandboxed
 * iframes), which counts as "nothing stored".
 */
export function readStoredCurrency(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Remember the visitor's chosen currency; storage failures are ignored. */
export function storeCurrency(currency: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, currency);
  } catch {
    // Storage is a convenience; the selection still lives in component state.
  }
}
