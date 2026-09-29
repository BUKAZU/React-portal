/** Whether the host page's consent manager has set `window.bukazuConsent`. */
export function windowConsent(): boolean {
  return typeof window !== 'undefined' && window.bukazuConsent === true;
}

/** Consent for a widget host: the page-wide flag or `data-consent="true"`. */
export function hostConsent(element: HTMLElement): boolean {
  return windowConsent() || element.getAttribute('data-consent') === 'true';
}
