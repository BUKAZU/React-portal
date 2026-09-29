/** Whether the host page's consent manager has set `window.bukazuConsent`. */
export function windowConsent(): boolean {
  return typeof window !== 'undefined' && window.bukazuConsent === true;
}

/**
 * Consent the host element grants with `data-consent="true"`. The window flag
 * is left out: a consent manager may clear it later, so it is read per event.
 */
export function elementConsent(element: HTMLElement): boolean {
  return element.getAttribute('data-consent') === 'true';
}
