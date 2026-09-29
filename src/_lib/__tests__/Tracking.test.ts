/**
 * @jest-environment-options {"url": "https://www.example.com/zoeken"}
 */
import {
  TrackEvent,
  getSessionIdentifier,
  houseViewEntry,
  isToken,
  resetTracking,
  type TrackingEvent
} from '../Tracking';

jest.mock('../http_client', () => ({
  http: {
    post: jest.fn()
  }
}));

import { http } from '../http_client';
import { registerConsentHost, resetConsentHosts } from '../consent';

const mockPost = http.post as jest.Mock;

const TRACKING_URL = 'https://api.bukazu.com/tracking';

const houseView: TrackingEvent = {
  portal_code: 'PORTAL',
  locale: 'en',
  house_code: 'HOUSE1',
  interaction_type: 'house_view',
  interaction_info: { entry: 'direct' }
};

function respondWith(...bodies: (string | Error)[]) {
  for (const body of bodies) {
    mockPost.mockReturnValueOnce({
      text:
        body instanceof Error
          ? jest.fn().mockRejectedValue(body)
          : jest.fn().mockResolvedValue(body)
    });
  }
}

function sentPayloads(): Record<string, unknown>[] {
  return mockPost.mock.calls.map(
    ([, options]: [string, { json: Record<string, unknown> }]) => options.json
  );
}

function clearCookies() {
  document.cookie.split(';').forEach((c) => {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
  });
}

function setReferrer(referrer: string) {
  Object.defineProperty(document, 'referrer', {
    value: referrer,
    configurable: true
  });
}

let cookieWrites: string[];

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  resetTracking();
  delete window.bukazuConsent;
  clearCookies();
  setReferrer('');
  window.history.replaceState({}, '', '/zoeken');
  window.innerWidth = 1280;

  cookieWrites = [];
  const descriptor = Object.getOwnPropertyDescriptor(
    Document.prototype,
    'cookie'
  )!;
  jest.spyOn(document, 'cookie', 'set').mockImplementation((value) => {
    cookieWrites.push(value);
    descriptor.set!.call(document, value);
  });
});

describe('without consent', () => {
  it('posts the event with consented false and no attribution', async () => {
    respondWith('session-1');

    await TrackEvent(houseView);

    const [url, options] = mockPost.mock.calls[0];
    expect(url).toBe(TRACKING_URL);
    expect(options.json).toEqual({
      portal_code: 'PORTAL',
      locale: 'en',
      house_code: 'HOUSE1',
      interaction_type: 'house_view',
      interaction_info: { entry: 'direct' },
      url: 'https://www.example.com/zoeken',
      consented: false
    });
  });

  it('never reads or writes the session cookie', async () => {
    const read = jest.spyOn(document, 'cookie', 'get');
    respondWith('session-1', 'session-1');

    await TrackEvent(houseView);
    await TrackEvent(houseView);

    expect(read).not.toHaveBeenCalled();
    expect(cookieWrites).toEqual([]);
  });

  it('ignores an existing session cookie', async () => {
    document.cookie = 'bu_portal_session=from-cookie;path=/;Secure';
    respondWith('session-1');

    await TrackEvent(houseView);

    expect(sentPayloads()[0]).not.toHaveProperty('session_identifier');
  });

  it('reuses the in-memory session id for later events', async () => {
    respondWith('session-1', 'session-1');

    await TrackEvent(houseView);
    await TrackEvent(houseView);

    expect(sentPayloads()[1].session_identifier).toBe('session-1');
    expect(getSessionIdentifier()).toBe('session-1');
  });

  it('lets parallel first events share the session the server hands out', async () => {
    respondWith('session-1', 'session-1');

    await Promise.all([TrackEvent(houseView), TrackEvent(houseView)]);

    expect(sentPayloads().map((payload) => payload.session_identifier)).toEqual(
      [undefined, 'session-1']
    );
  });

  it('still sends a waiting event when the first request fails', async () => {
    respondWith(new Error('offline'), 'session-2');

    await Promise.all([TrackEvent(houseView), TrackEvent(houseView)]);

    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(getSessionIdentifier()).toBe('session-2');
  });
});

describe('with consent', () => {
  beforeEach(() => {
    window.bukazuConsent = true;
  });

  it('stores the session in a lax, secure cookie and sends consented true', async () => {
    respondWith('session-1');

    await TrackEvent(houseView);

    expect(sentPayloads()[0].consented).toBe(true);
    expect(cookieWrites).toHaveLength(1);
    expect(cookieWrites[0]).toMatch(
      /^bu_portal_session=session-1;expires=.+;path=\/;SameSite=Lax;Secure$/
    );
    expect(getSessionIdentifier()).toBe('session-1');
  });

  it('sends the session cookie as session_identifier', async () => {
    document.cookie = 'bu_portal_session=existing;path=/;Secure';
    respondWith('existing');

    await TrackEvent(houseView);

    expect(sentPayloads()[0].session_identifier).toBe('existing');
  });

  it('sends attribution on the first event of a session only', async () => {
    respondWith('session-1', 'session-1');

    await TrackEvent(houseView);
    await TrackEvent(houseView);

    const [first, second] = sentPayloads();
    expect(first.attribution).toEqual({
      landing_path: '/zoeken',
      device_class: 'desktop'
    });
    expect(second).not.toHaveProperty('attribution');
  });

  it('parses the referrer host and utm parameters', async () => {
    setReferrer('https://www.google.com/search?q=cottage');
    window.history.replaceState(
      {},
      '',
      '/huis?utm_source=newsletter&utm_medium=email&utm_campaign=spring_2026&other=1'
    );
    respondWith('session-1');

    await TrackEvent(houseView);

    expect(sentPayloads()[0].attribution).toEqual({
      referrer_host: 'www.google.com',
      utm_source: 'newsletter',
      utm_medium: 'email',
      utm_campaign: 'spring_2026',
      landing_path: '/huis',
      device_class: 'desktop'
    });
  });

  it('omits a referrer from the portal site itself', async () => {
    setReferrer('https://www.example.com/');
    respondWith('session-1');

    await TrackEvent(houseView);

    expect(sentPayloads()[0].attribution).not.toHaveProperty('referrer_host');
  });

  it.each([
    [375, 'mobile'],
    [767, 'mobile'],
    [768, 'tablet'],
    [1023, 'tablet'],
    [1024, 'desktop']
  ])('classes a %ipx wide window as %s', async (width, deviceClass) => {
    window.innerWidth = width;
    respondWith('session-1');

    await TrackEvent(houseView);

    expect(sentPayloads()[0].attribution).toMatchObject({
      device_class: deviceClass
    });
  });

  it('honours window.bukazuConsent set after load', async () => {
    delete window.bukazuConsent;
    respondWith('session-1', 'session-1');

    await TrackEvent(houseView);
    window.bukazuConsent = true;
    await TrackEvent(houseView);

    const [before, after] = sentPayloads();
    expect(before.consented).toBe(false);
    expect(after).toMatchObject({
      consented: true,
      session_identifier: 'session-1'
    });
    expect(cookieWrites).toHaveLength(1);
  });

  it('sends attribution once when events race after late consent', async () => {
    delete window.bukazuConsent;
    respondWith('session-1', 'session-1', 'session-1');

    await TrackEvent(houseView);
    window.bukazuConsent = true;
    await Promise.all([TrackEvent(houseView), TrackEvent(houseView)]);

    const withAttribution = sentPayloads().filter(
      (payload) => 'attribution' in payload
    );
    expect(withAttribution).toHaveLength(1);
  });

  it.each([
    ['fails', new Error('offline')],
    ['is dropped with a 204', '']
  ])(
    'retries the attribution when its request %s',
    async (_label, firstResponse) => {
      respondWith(firstResponse, 'session-1');

      await TrackEvent(houseView);
      await TrackEvent(houseView);

      const [first, second] = sentPayloads();
      expect(first).toHaveProperty('attribution');
      expect(second).toHaveProperty('attribution');
    }
  );

  it('stops using the cookie once window.bukazuConsent is cleared', async () => {
    window.bukazuConsent = true;
    respondWith('session-1', 'session-1');

    await TrackEvent(houseView);
    expect(sentPayloads()[0].consented).toBe(true);
    expect(cookieWrites).toHaveLength(1);

    delete window.bukazuConsent;
    cookieWrites = [];
    const read = jest.spyOn(document, 'cookie', 'get');
    await TrackEvent(houseView);

    expect(sentPayloads()[1]).toMatchObject({
      consented: false,
      session_identifier: 'session-1'
    });
    expect(read).not.toHaveBeenCalled();
    expect(cookieWrites).toEqual([]);
  });
});

describe('consent from widget hosts', () => {
  function mountedHost(consent: boolean): HTMLElement {
    const element = document.createElement('div');
    if (consent) element.setAttribute('data-consent', 'true');
    document.body.appendChild(element);
    registerConsentHost(element);
    return element;
  }

  beforeEach(() => {
    resetConsentHosts();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('is consented when one of two hosts carries data-consent', async () => {
    mountedHost(false);
    mountedHost(true);
    respondWith('session-1');

    await TrackEvent(houseView);

    expect(sentPayloads()[0].consented).toBe(true);
    expect(cookieWrites).toHaveLength(1);
  });

  it('stops using the cookie once the attribute is removed', async () => {
    const host = mountedHost(true);
    respondWith('session-1', 'session-1');

    await TrackEvent(houseView);
    host.removeAttribute('data-consent');
    cookieWrites = [];
    const read = jest.spyOn(document, 'cookie', 'get');
    await TrackEvent(houseView);

    expect(sentPayloads()[1].consented).toBe(false);
    expect(read).not.toHaveBeenCalled();
    expect(cookieWrites).toEqual([]);
  });
});

describe('responses', () => {
  it('does not keep an empty session id from a 204', async () => {
    window.bukazuConsent = true;
    respondWith('', 'session-1');

    await TrackEvent(houseView);
    expect(cookieWrites).toEqual([]);
    expect(getSessionIdentifier()).toBeNull();

    await TrackEvent(houseView);
    expect(sentPayloads()[1]).not.toHaveProperty('session_identifier');
  });

  it('swallows request errors and keeps the session', async () => {
    respondWith('session-1', new Error('422 Unprocessable Entity'));

    await TrackEvent(houseView);
    await expect(TrackEvent(houseView)).resolves.toBeUndefined();

    expect(getSessionIdentifier()).toBe('session-1');
  });

  it('drops blank interaction_info values', async () => {
    respondWith('session-1');

    await TrackEvent({
      portal_code: 'PORTAL',
      locale: 'en',
      interaction_type: 'search',
      interaction_info: {
        arrival: undefined,
        departure: '',
        result_count: 0
      }
    });

    expect(sentPayloads()[0].interaction_info).toEqual({ result_count: 0 });
  });
});

describe('houseViewEntry', () => {
  it.each([
    ['', 'direct'],
    ['https://www.example.com/zoeken', 'search'],
    ['https://www.google.com/', 'external'],
    ['not a url', 'direct']
  ])('reads referrer %p as %s', (referrer, entry) => {
    setReferrer(referrer);

    expect(houseViewEntry()).toBe(entry);
  });
});

describe('isToken', () => {
  it.each([
    ['cancel_insurance', true],
    ['extra_fields.date_of_birth', true],
    ['12', true],
    ['', false],
    ['free text', false],
    ['a'.repeat(65), false],
    [12, false]
  ])('%p is a token: %p', (value, expected) => {
    expect(isToken(value)).toBe(expected);
  });
});
