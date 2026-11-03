// The hosts website.tsx's init mounts on.
const HOST_SELECTOR = '.bukazu-app, #bukazu-app';

// Hosts mounted through BukazuPortal.mountPortal need not match HOST_SELECTOR.
const mountedHosts = new Set<HTMLElement>();

export function registerConsentHost(element: HTMLElement): void {
  mountedHosts.add(element);
}

/** Test hook: forget the registered hosts. */
export function resetConsentHosts(): void {
  mountedHosts.clear();
}

/** Whether the host page's consent manager has set `window.bukazuConsent`. */
export function windowConsent(): boolean {
  return typeof window !== 'undefined' && window.bukazuConsent === true;
}

function elementConsent(element: Element): boolean {
  return element.isConnected && element.getAttribute('data-consent') === 'true';
}

/**
 * Consent is page-wide, as there is one session cookie per page: the window
 * flag or any mounted host carrying `data-consent="true"`. Read live on every
 * event, so a consent manager can also take it back.
 */
export function pageConsent(): boolean {
  if (windowConsent()) return true;
  const hosts = [...mountedHosts, ...document.querySelectorAll(HOST_SELECTOR)];
  return hosts.some(elementConsent);
}
