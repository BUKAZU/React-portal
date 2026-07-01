import { TrackEvent, getSessionIdentifier } from '../Tracking';

jest.mock('../http_client', () => ({
  http: {
    post: jest.fn()
  }
}));

import { http } from '../http_client';

const mockHttp = http as jest.Mocked<typeof http>;

const TRACKING_URL = 'https://api.bukazu.com/tracking';

interface PostOptions {
  json: Record<string, unknown>;
}

function clearCookies() {
  document.cookie.split(';').forEach((c) => {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  clearCookies();
});

describe('getSessionIdentifier', () => {
  it('returns null when bu_portal_session cookie is not set', () => {
    expect(getSessionIdentifier()).toBeNull();
  });

  it('returns the session value when bu_portal_session cookie is set', () => {
    document.cookie = 'bu_portal_session=abc123';
    expect(getSessionIdentifier()).toBe('abc123');
  });

  it('returns the correct value when multiple cookies are present', () => {
    document.cookie = 'other_cookie=foo';
    document.cookie = 'bu_portal_session=session-xyz';
    expect(getSessionIdentifier()).toBe('session-xyz');
  });

  it('returns null after the session cookie has been cleared', () => {
    document.cookie = 'bu_portal_session=temp';
    clearCookies();
    expect(getSessionIdentifier()).toBeNull();
  });
});

describe('TrackEvent', () => {
  it('posts to the tracking endpoint', async () => {
    (mockHttp.post as jest.Mock).mockReturnValue({ text: jest.fn().mockResolvedValue('s') });

    await TrackEvent({ event: 'click' });

    const [calledUrl] = (mockHttp.post as jest.Mock).mock.calls[0] as [string, PostOptions];
    expect(calledUrl).toBe(TRACKING_URL);
  });

  it('merges event data with url and session_identifier', async () => {
    (mockHttp.post as jest.Mock).mockReturnValue({ text: jest.fn().mockResolvedValue('s') });

    await TrackEvent({ event: 'click', label: 'button' });

    const [, options] = (mockHttp.post as jest.Mock).mock.calls[0] as [string, PostOptions];
    expect(options.json.event).toBe('click');
    expect(options.json.label).toBe('button');
    expect(options.json.url).toBe(window.location.href);
    expect('session_identifier' in options.json).toBe(true);
  });

  it('includes the current page URL in the posted payload', async () => {
    (mockHttp.post as jest.Mock).mockReturnValue({ text: jest.fn().mockResolvedValue('s') });

    await TrackEvent({});

    const [, options] = (mockHttp.post as jest.Mock).mock.calls[0] as [string, PostOptions];
    expect(options.json.url).toBe(window.location.href);
  });

  it('sends empty string as session_identifier when no cookie is set', async () => {
    (mockHttp.post as jest.Mock).mockReturnValue({ text: jest.fn().mockResolvedValue('s') });

    await TrackEvent({});

    const [, options] = (mockHttp.post as jest.Mock).mock.calls[0] as [string, PostOptions];
    expect(options.json.session_identifier).toBe('');
  });

  it('sends the existing session cookie as session_identifier', async () => {
    document.cookie = 'bu_portal_session=existing-session';
    (mockHttp.post as jest.Mock).mockReturnValue({ text: jest.fn().mockResolvedValue('s') });

    await TrackEvent({ event: 'pageview' });

    const [, options] = (mockHttp.post as jest.Mock).mock.calls[0] as [string, PostOptions];
    expect(options.json.session_identifier).toBe('existing-session');
  });

  it('stores the returned session id in the bu_portal_session cookie', async () => {
    (mockHttp.post as jest.Mock).mockReturnValue({ text: jest.fn().mockResolvedValue('srv-session-42') });

    await TrackEvent({ event: 'test' });

    expect(document.cookie).toContain('bu_portal_session=srv-session-42');
  });

  it('overwrites the previous session cookie with the value returned by the server', async () => {
    document.cookie = 'bu_portal_session=old-session';
    (mockHttp.post as jest.Mock).mockReturnValue({ text: jest.fn().mockResolvedValue('refreshed-session') });

    await TrackEvent({ event: 'test' });

    expect(document.cookie).toContain('bu_portal_session=refreshed-session');
    expect(document.cookie).not.toContain('old-session');
  });

  it('does not drop additional properties from the event data', async () => {
    (mockHttp.post as jest.Mock).mockReturnValue({ text: jest.fn().mockResolvedValue('s') });

    await TrackEvent({ custom_field: 'value', count: 42 });

    const [, options] = (mockHttp.post as jest.Mock).mock.calls[0] as [string, PostOptions];
    expect(options.json.custom_field).toBe('value');
    expect(options.json.count).toBe(42);
  });
});
