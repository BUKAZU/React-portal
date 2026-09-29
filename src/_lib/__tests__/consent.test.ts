import { hostConsent, windowConsent } from '../consent';

function host(attrs: Record<string, string> = {}): HTMLElement {
  const element = document.createElement('div');
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
  return element;
}

afterEach(() => {
  delete window.bukazuConsent;
});

describe('consent', () => {
  it('is given by window.bukazuConsent', () => {
    window.bukazuConsent = true;

    expect(windowConsent()).toBe(true);
    expect(hostConsent(host())).toBe(true);
  });

  it('is given by data-consent="true" on the host element', () => {
    expect(windowConsent()).toBe(false);
    expect(hostConsent(host({ 'data-consent': 'true' }))).toBe(true);
  });

  it('is not given without either', () => {
    expect(hostConsent(host())).toBe(false);
    expect(hostConsent(host({ 'data-consent': 'false' }))).toBe(false);
  });
});
