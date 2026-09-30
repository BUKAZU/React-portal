import {
  pageConsent,
  registerConsentHost,
  resetConsentHosts,
  windowConsent
} from '../consent';

function host(attrs: Record<string, string> = {}): HTMLElement {
  const element = document.createElement('div');
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
  document.body.appendChild(element);
  return element;
}

beforeEach(() => {
  resetConsentHosts();
});

afterEach(() => {
  delete window.bukazuConsent;
  document.body.innerHTML = '';
});

describe('windowConsent', () => {
  it('is given by window.bukazuConsent === true only', () => {
    expect(windowConsent()).toBe(false);

    window.bukazuConsent = true;
    expect(windowConsent()).toBe(true);
  });
});

describe('pageConsent', () => {
  it('is given by window.bukazuConsent', () => {
    window.bukazuConsent = true;

    expect(pageConsent()).toBe(true);
  });

  it('is given by a registered host with data-consent="true"', () => {
    registerConsentHost(host({ 'data-consent': 'true' }));

    expect(pageConsent()).toBe(true);
  });

  it.each([['class'], ['id']])(
    'is given by an unregistered bukazu-app host found by %s',
    (attribute) => {
      host({ [attribute]: 'bukazu-app', 'data-consent': 'true' });

      expect(pageConsent()).toBe(true);
    }
  );

  it('is given when one of two hosts consents', () => {
    registerConsentHost(host());
    registerConsentHost(host({ 'data-consent': 'true' }));

    expect(pageConsent()).toBe(true);
  });

  it('is withdrawn when the attribute is removed', () => {
    const element = host({ 'data-consent': 'true' });
    registerConsentHost(element);
    element.removeAttribute('data-consent');

    expect(pageConsent()).toBe(false);
  });

  it('ignores a host that left the page', () => {
    const element = host({ 'data-consent': 'true' });
    registerConsentHost(element);
    element.remove();

    expect(pageConsent()).toBe(false);
  });

  it('is not given by other values or unrelated elements', () => {
    registerConsentHost(host({ 'data-consent': 'false' }));
    host({ 'data-consent': 'true' });

    expect(pageConsent()).toBe(false);
  });
});
