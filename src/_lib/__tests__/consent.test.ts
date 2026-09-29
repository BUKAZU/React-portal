import { elementConsent, windowConsent } from '../consent';

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
  });

  it('is given by data-consent="true" on the host element', () => {
    expect(windowConsent()).toBe(false);
    expect(elementConsent(host({ 'data-consent': 'true' }))).toBe(true);
  });

  it('leaves the window flag out of the element consent', () => {
    window.bukazuConsent = true;

    expect(elementConsent(host())).toBe(false);
  });

  it('is not given without either', () => {
    expect(windowConsent()).toBe(false);
    expect(elementConsent(host())).toBe(false);
    expect(elementConsent(host({ 'data-consent': 'false' }))).toBe(false);
  });
});
